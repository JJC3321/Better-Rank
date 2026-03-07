import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { v4 as uuidv4 } from 'uuid'
import { logToArize, countBrandMentions } from '@/lib/arize'
import type { PromptExecution, AnalysisResult } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { prompt, frequency, competitor } = await req.json()

    if (!prompt || !frequency || !competitor) {
      return Response.json(
        { error: 'Missing required fields: prompt, frequency, competitor' },
        { status: 400 }
      )
    }

    const executions: PromptExecution[] = []
    const arizeTraceIds: string[] = []
    let totalBetterHelpMentions = 0
    let totalCompetitorMentions = 0

    // Execute the prompt multiple times based on frequency
    for (let i = 0; i < frequency; i++) {
      const startTime = Date.now()
      
      const result = await generateText({
        model: google('gemini-2.5-flash-preview-04-17'),
        prompt: prompt,
        maxOutputTokens: 2048,
      })

      const endTime = Date.now()
      const responseText = result.text

      // Count brand mentions
      const betterHelpCount = countBrandMentions(responseText, 'BetterHelp')
      const competitorCount = countBrandMentions(responseText, competitor)

      totalBetterHelpMentions += betterHelpCount
      totalCompetitorMentions += competitorCount

      // Log to Arize
      const traceId = await logToArize({
        name: 'prompt_execution',
        input: prompt,
        output: responseText,
        startTime,
        endTime,
        attributes: {
          execution_index: i + 1,
          total_executions: frequency,
          betterhelp_mentions: betterHelpCount,
          competitor_mentions: competitorCount,
          competitor_name: competitor,
        },
      })

      arizeTraceIds.push(traceId)

      const execution: PromptExecution = {
        id: uuidv4(),
        prompt,
        response: responseText,
        timestamp: new Date().toISOString(),
        brandMentions: {
          betterhelp: betterHelpCount,
          competitor: competitorCount,
        },
      }

      executions.push(execution)
    }

    const analysisResult: AnalysisResult = {
      executions,
      totalBetterHelpMentions,
      totalCompetitorMentions,
      executionCount: frequency,
      competitor,
      arizeTraceIds,
    }

    return Response.json(analysisResult)
  } catch (error) {
    console.error('[v0] Error executing prompts:', error)
    return Response.json(
      { error: 'Failed to execute prompts' },
      { status: 500 }
    )
  }
}
