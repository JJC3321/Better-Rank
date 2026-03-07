import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { AnalysisResult, WebsiteAnalysis, OptimizationFeedback } from '@/lib/types'

const optimizationSchema = z.object({
  contentRecommendations: z.array(z.string()).describe('Specific content changes to improve LLM visibility'),
  structureImprovements: z.array(z.string()).describe('Website structure and navigation improvements'),
  keywordOptimizations: z.array(z.string()).describe('Keywords to emphasize or add'),
  seoStrategies: z.array(z.string()).describe('SEO strategies to improve search and AI discovery'),
  llmVisibilityTips: z.array(z.string()).describe('Specific tips to increase mentions in LLM responses'),
  competitiveAdvantages: z.array(z.string()).describe('Ways to differentiate from competitors'),
  actionPlan: z.array(z.string()).describe('Prioritized action items'),
})

export async function POST(req: Request) {
  try {
    const { analysis, websiteAnalysis } = await req.json() as {
      analysis: AnalysisResult
      websiteAnalysis: WebsiteAnalysis
    }

    if (!analysis || !websiteAnalysis) {
      return Response.json(
        { error: 'Missing analysis or website analysis data' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert in SEO, content optimization, and AI/LLM visibility strategies. 

CONTEXT:
A prompt was executed ${analysis.executionCount} times through an LLM (Gemini Flash 2.5).

BRAND MENTION RESULTS:
- "BetterHelp" was mentioned ${analysis.totalBetterHelpMentions} times total
- Competitor "${analysis.competitor}" was mentioned ${analysis.totalCompetitorMentions} times total
- BetterHelp mention rate: ${(analysis.totalBetterHelpMentions / analysis.executionCount).toFixed(2)} per response
- Competitor mention rate: ${(analysis.totalCompetitorMentions / analysis.executionCount).toFixed(2)} per response

BETTERHELP WEBSITE ANALYSIS:
- URL: ${websiteAnalysis.betterhelp.url}
- Key Strengths: ${websiteAnalysis.betterhelp.strengths.join(', ')}
- Identified Weaknesses: ${websiteAnalysis.betterhelp.weaknesses.join(', ')}
- Current Keywords: ${websiteAnalysis.betterhelp.keywords.join(', ')}
- Content Structure: ${websiteAnalysis.betterhelp.contentStructure}
- Key Insights: ${websiteAnalysis.betterhelp.insights.slice(0, 3).join(' | ')}

COMPETITOR (${websiteAnalysis.competitor.name}) ANALYSIS:
- URL: ${websiteAnalysis.competitor.url}
- Key Strengths: ${websiteAnalysis.competitor.strengths.join(', ')}
- Keywords: ${websiteAnalysis.competitor.keywords.join(', ')}
- Content Structure: ${websiteAnalysis.competitor.contentStructure}
- Key Insights: ${websiteAnalysis.competitor.insights.slice(0, 3).join(' | ')}

SAMPLE LLM RESPONSES:
${analysis.executions.slice(0, 3).map((e, i) => `Response ${i + 1}: "${e.response.substring(0, 500)}..."`).join('\n\n')}

TASK:
Generate comprehensive, actionable recommendations to optimize BetterHelp's online presence and content to increase the frequency of "BetterHelp" mentions in LLM responses compared to ${analysis.competitor}. Focus on:

1. Content changes that would make BetterHelp more likely to be mentioned by AI systems
2. Structural improvements to the website
3. Keyword strategies
4. SEO improvements for AI/LLM discovery
5. Specific techniques to increase LLM visibility
6. Competitive differentiation
7. A prioritized action plan

Be specific, practical, and data-driven in your recommendations.`

    const result = await generateText({
      model: 'google/gemini-2.5-flash',
      prompt,
      maxOutputTokens: 4096,
      output: Output.object({
        schema: optimizationSchema,
      }),
    })

    const optimization = result.output as OptimizationFeedback

    // Ensure all arrays have content
    const finalOptimization: OptimizationFeedback = {
      contentRecommendations: optimization?.contentRecommendations?.length 
        ? optimization.contentRecommendations 
        : ['Add more authoritative content about online therapy benefits', 'Include case studies and success stories', 'Create comprehensive FAQ sections'],
      structureImprovements: optimization?.structureImprovements?.length 
        ? optimization.structureImprovements 
        : ['Improve site navigation for key service pages', 'Add clear CTAs on every page', 'Optimize mobile experience'],
      keywordOptimizations: optimization?.keywordOptimizations?.length 
        ? optimization.keywordOptimizations 
        : ['online therapy', 'mental health support', 'licensed therapist', 'affordable counseling'],
      seoStrategies: optimization?.seoStrategies?.length 
        ? optimization.seoStrategies 
        : ['Build more authoritative backlinks', 'Create topic clusters around mental health', 'Optimize meta descriptions'],
      llmVisibilityTips: optimization?.llmVisibilityTips?.length 
        ? optimization.llmVisibilityTips 
        : ['Ensure content is easily parseable by AI systems', 'Use clear, factual statements about services', 'Include structured data markup'],
      competitiveAdvantages: optimization?.competitiveAdvantages?.length 
        ? optimization.competitiveAdvantages 
        : ['Highlight unique features and differentiators', 'Emphasize user testimonials', 'Showcase certifications and credentials'],
      actionPlan: optimization?.actionPlan?.length 
        ? optimization.actionPlan 
        : ['1. Audit current content for AI readability', '2. Implement structured data', '3. Create authoritative content', '4. Build quality backlinks', '5. Monitor and iterate'],
    }

    return Response.json(finalOptimization)
  } catch (error) {
    console.error('[v0] Error generating optimization:', error)
    return Response.json(
      { error: 'Failed to generate optimization recommendations' },
      { status: 500 }
    )
  }
}
