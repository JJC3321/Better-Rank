import type { WebsiteAnalysis } from '@/lib/types'

async function searchWithTavily(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY
  
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY not configured')
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      include_answer: true,
      include_raw_content: true,
      max_results: 5,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  // Combine answer and results content
  let content = data.answer || ''
  if (data.results && Array.isArray(data.results)) {
    for (const result of data.results) {
      content += `\n\n${result.title || ''}\n${result.content || ''}`
    }
  }
  
  return content
}

export async function POST(req: Request) {
  try {
    const { competitor } = await req.json()

    if (!competitor) {
      return Response.json(
        { error: 'Missing competitor name' },
        { status: 400 }
      )
    }

    // Analyze BetterHelp website
    const betterHelpContent = await searchWithTavily(
      'BetterHelp online therapy platform website features services pricing content structure SEO analysis'
    )

    const betterHelpStructure = await searchWithTavily(
      'BetterHelp website content strategy keywords mental health therapy online counseling'
    )

    // Analyze competitor website
    const competitorContent = await searchWithTavily(
      `${competitor} online therapy platform website features services pricing content structure SEO analysis`
    )

    const competitorStrategy = await searchWithTavily(
      `${competitor} website content strategy keywords mental health therapy online counseling`
    )

    // Extract insights from the content
    const websiteAnalysis: WebsiteAnalysis = {
      betterhelp: {
        url: 'https://www.betterhelp.com',
        insights: extractInsights(betterHelpContent),
        strengths: extractStrengths(betterHelpContent),
        weaknesses: extractWeaknesses(betterHelpContent),
        keywords: extractKeywords(betterHelpContent + ' ' + betterHelpStructure),
        contentStructure: summarizeStructure(betterHelpContent),
      },
      competitor: {
        url: `https://www.${competitor.toLowerCase().replace(/\s+/g, '')}.com`,
        name: competitor,
        insights: extractInsights(competitorContent),
        strengths: extractStrengths(competitorContent),
        keywords: extractKeywords(competitorContent + ' ' + competitorStrategy),
        contentStructure: summarizeStructure(competitorContent),
      },
    }

    return Response.json(websiteAnalysis)
  } catch (error) {
    console.error('[v0] Error analyzing websites:', error)
    return Response.json(
      { error: 'Failed to analyze websites' },
      { status: 500 }
    )
  }
}

function extractInsights(content: string): string[] {
  const insights: string[] = []
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Extract key insights
  const keyPhrases = ['therapy', 'counseling', 'mental health', 'online', 'platform', 'service', 'pricing', 'therapist']
  
  for (const sentence of sentences.slice(0, 10)) {
    const lower = sentence.toLowerCase()
    if (keyPhrases.some(phrase => lower.includes(phrase))) {
      insights.push(sentence.trim())
      if (insights.length >= 5) break
    }
  }
  
  return insights.length > 0 ? insights : ['No specific insights extracted from analysis']
}

function extractStrengths(content: string): string[] {
  const strengths: string[] = []
  const lower = content.toLowerCase()
  
  if (lower.includes('convenient') || lower.includes('accessible')) {
    strengths.push('High accessibility and convenience')
  }
  if (lower.includes('affordable') || lower.includes('pricing')) {
    strengths.push('Competitive pricing structure')
  }
  if (lower.includes('therapist') && lower.includes('licensed')) {
    strengths.push('Licensed professional therapists')
  }
  if (lower.includes('app') || lower.includes('mobile')) {
    strengths.push('Mobile app availability')
  }
  if (lower.includes('messaging') || lower.includes('chat')) {
    strengths.push('Multiple communication options')
  }
  
  return strengths.length > 0 ? strengths : ['General online therapy services']
}

function extractWeaknesses(content: string): string[] {
  const weaknesses: string[] = []
  const lower = content.toLowerCase()
  
  if (lower.includes('wait') || lower.includes('delay')) {
    weaknesses.push('Potential wait times for therapist matching')
  }
  if (lower.includes('subscription') || lower.includes('cost')) {
    weaknesses.push('Subscription-based model may not suit everyone')
  }
  if (!lower.includes('emergency') && !lower.includes('crisis')) {
    weaknesses.push('May not be suitable for crisis situations')
  }
  
  return weaknesses.length > 0 ? weaknesses : ['Limited information on weaknesses']
}

function extractKeywords(content: string): string[] {
  const keywords = new Set<string>()
  const keyTerms = [
    'therapy', 'counseling', 'mental health', 'online therapy', 'therapist',
    'counselor', 'depression', 'anxiety', 'wellness', 'support', 'professional',
    'licensed', 'affordable', 'convenient', 'accessible', 'mobile', 'app',
    'messaging', 'video', 'session', 'subscription', 'matching'
  ]
  
  const lower = content.toLowerCase()
  for (const term of keyTerms) {
    if (lower.includes(term)) {
      keywords.add(term)
    }
  }
  
  return Array.from(keywords).slice(0, 10)
}

function summarizeStructure(content: string): string {
  const wordCount = content.split(/\s+/).length
  const paragraphs = content.split(/\n\n+/).length
  
  return `Analyzed content contains approximately ${wordCount} words across ${paragraphs} sections, covering service descriptions, pricing information, and user engagement features.`
}
