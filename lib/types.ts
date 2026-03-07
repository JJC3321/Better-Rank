export interface PromptExecution {
  id: string
  prompt: string
  response: string
  timestamp: string
  brandMentions: {
    betterhelp: number
    competitor: number
  }
}

export interface AnalysisResult {
  executions: PromptExecution[]
  totalBetterHelpMentions: number
  totalCompetitorMentions: number
  executionCount: number
  competitor: string
  arizeTraceIds: string[]
}

export interface WebsiteAnalysis {
  betterhelp: {
    url: string
    insights: string[]
    strengths: string[]
    weaknesses: string[]
    keywords: string[]
    contentStructure: string
  }
  competitor: {
    url: string
    name: string
    insights: string[]
    strengths: string[]
    keywords: string[]
    contentStructure: string
  }
}

export interface OptimizationFeedback {
  contentRecommendations: string[]
  structureImprovements: string[]
  keywordOptimizations: string[]
  seoStrategies: string[]
  llmVisibilityTips: string[]
  competitiveAdvantages: string[]
  actionPlan: string[]
}

export interface FullAnalysisState {
  status: 'idle' | 'executing' | 'analyzing' | 'optimizing' | 'complete' | 'error'
  currentStep: string
  analysis: AnalysisResult | null
  websiteAnalysis: WebsiteAnalysis | null
  optimization: OptimizationFeedback | null
  error: string | null
}
