import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AnalysisResult, WebsiteAnalysis, OptimizationFeedback } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
Generate comprehensive, actionable recommendations to optimize BetterHelp's online presence and content to increase the frequency of "BetterHelp" mentions in LLM responses compared to ${analysis.competitor}. 

Respond with a JSON object in the following exact format (no markdown, just pure JSON):
{
  "contentRecommendations": ["recommendation 1", "recommendation 2", ...],
  "structureImprovements": ["improvement 1", "improvement 2", ...],
  "keywordOptimizations": ["keyword 1", "keyword 2", ...],
  "seoStrategies": ["strategy 1", "strategy 2", ...],
  "llmVisibilityTips": ["tip 1", "tip 2", ...],
  "competitiveAdvantages": ["advantage 1", "advantage 2", ...],
  "actionPlan": ["1. First action", "2. Second action", ...]
}

Be specific, practical, and data-driven in your recommendations. Include at least 3-5 items in each category.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    // Parse the JSON response
    let optimization: OptimizationFeedback
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        optimization = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch {
      // Fallback if parsing fails
      optimization = {
        contentRecommendations: ['Add more authoritative content about online therapy benefits', 'Include case studies and success stories', 'Create comprehensive FAQ sections'],
        structureImprovements: ['Improve site navigation for key service pages', 'Add clear CTAs on every page', 'Optimize mobile experience'],
        keywordOptimizations: ['online therapy', 'mental health support', 'licensed therapist', 'affordable counseling'],
        seoStrategies: ['Build more authoritative backlinks', 'Create topic clusters around mental health', 'Optimize meta descriptions'],
        llmVisibilityTips: ['Ensure content is easily parseable by AI systems', 'Use clear, factual statements about services', 'Include structured data markup'],
        competitiveAdvantages: ['Highlight unique features and differentiators', 'Emphasize user testimonials', 'Showcase certifications and credentials'],
        actionPlan: ['1. Audit current content for AI readability', '2. Implement structured data', '3. Create authoritative content', '4. Build quality backlinks', '5. Monitor and iterate'],
      }
    }

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
