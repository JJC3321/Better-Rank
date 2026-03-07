import { v4 as uuidv4 } from 'uuid'
import { client, countBrandMentions } from '@/lib/braintrust'
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

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      )
    }

    const executions: PromptExecution[] = []
    const braintrustSpanIds: string[] = []
    let totalBetterHelpMentions = 0
    let totalCompetitorMentions = 0

    // Execute the prompt multiple times based on frequency
    for (let i = 0; i < frequency; i++) {
      const spanId = uuidv4()
      
      // Use the wrapped client - Braintrust automatically traces this call
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 2048,
        },
      })

      const responseText = response.text

      // Count brand mentions
      const betterHelpCount = countBrandMentions(responseText, 'BetterHelp')
      const competitorCount = countBrandMentions(responseText, competitor)

      totalBetterHelpMentions += betterHelpCount
      totalCompetitorMentions += competitorCount

      braintrustSpanIds.push(spanId)

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
      braintrustSpanIds,
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
