'use client'

import { useState, useCallback } from 'react'
import { AnalysisForm } from '@/components/analysis-form'
import { AnalysisProgress } from '@/components/analysis-progress'
import { AnalysisResults } from '@/components/analysis-results'
import { WebsiteAnalysisDisplay } from '@/components/website-analysis'
import { OptimizationFeedbackDisplay } from '@/components/optimization-feedback'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Brain, BarChart3, Sparkles, RotateCcw } from 'lucide-react'
import type { FullAnalysisState, AnalysisResult, WebsiteAnalysis, OptimizationFeedback } from '@/lib/types'

const APP_NAME = 'Better Rank'

export default function HomePage() {
  const [state, setState] = useState<FullAnalysisState>({
    status: 'idle',
    currentStep: '',
    analysis: null,
    websiteAnalysis: null,
    optimization: null,
    error: null,
  })

  const runAnalysis = useCallback(async (prompt: string, frequency: number, competitor: string) => {
    setState(prev => ({
      ...prev,
      status: 'executing',
      currentStep: `Executing prompt ${frequency} times...`,
      error: null,
    }))

    try {
      const executeResponse = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, frequency, competitor }),
      })

      if (!executeResponse.ok) {
        throw new Error('Failed to execute prompts')
      }

      const analysis: AnalysisResult = await executeResponse.json()
      
      setState(prev => ({
        ...prev,
        status: 'analyzing',
        currentStep: 'Analyzing websites with Tavily...',
        analysis,
      }))

      const analyzeResponse = await fetch('/api/analyze-websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitor }),
      })

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze websites')
      }

      const websiteAnalysis: WebsiteAnalysis = await analyzeResponse.json()

      setState(prev => ({
        ...prev,
        status: 'optimizing',
        currentStep: 'Generating optimization recommendations...',
        websiteAnalysis,
      }))

      const optimizeResponse = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, websiteAnalysis }),
      })

      if (!optimizeResponse.ok) {
        throw new Error('Failed to generate optimization')
      }

      const optimization: OptimizationFeedback = await optimizeResponse.json()

      setState(prev => ({
        ...prev,
        status: 'complete',
        currentStep: '',
        optimization,
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        currentStep: '',
        error: error instanceof Error ? error.message : 'An error occurred',
      }))
    }
  }, [])

  const resetAnalysis = useCallback(() => {
    setState({
      status: 'idle',
      currentStep: '',
      analysis: null,
      websiteAnalysis: null,
      optimization: null,
      error: null,
    })
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-chart-1 p-2">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" suppressHydrationWarning>{APP_NAME}</h1>
              <p className="text-xs text-muted-foreground">
                Analyze and optimize brand visibility in AI responses
              </p>
            </div>
          </div>
          {state.status === 'complete' && (
            <Button variant="outline" size="sm" onClick={resetAnalysis}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {state.status === 'idle' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Monitor Your Brand in LLM Outputs
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
                Execute prompts multiple times, track brand mentions, analyze competitor websites,
                and receive AI-powered optimization recommendations to increase your visibility.
              </p>
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-chart-2" />
                  <span>Gemini Flash 2.5</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-chart-1" />
                  <span>Braintrust Monitoring</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-chart-3" />
                  <span>Tavily Analysis</span>
                </div>
              </div>
            </div>
          )}

          {state.status === 'idle' && (
            <AnalysisForm 
              onSubmit={runAnalysis} 
              isLoading={state.status !== 'idle'} 
            />
          )}

          {state.status !== 'idle' && state.status !== 'complete' && state.status !== 'error' && (
            <AnalysisProgress state={state} />
          )}

          {state.status === 'error' && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-4 pt-6">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive">Analysis Failed</h3>
                  <p className="text-sm text-muted-foreground">{state.error}</p>
                </div>
                <Button variant="outline" onClick={resetAnalysis}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {state.analysis && (state.status === 'complete' || state.status === 'analyzing' || state.status === 'optimizing') && (
            <>
              <Separator />
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-chart-2" />
                  <h3 className="text-lg font-semibold">Brand Mention Analysis</h3>
                </div>
                <AnalysisResults analysis={state.analysis} />
              </section>
            </>
          )}

          {state.websiteAnalysis && (state.status === 'complete' || state.status === 'optimizing') && (
            <>
              <Separator />
              <section>
                <WebsiteAnalysisDisplay analysis={state.websiteAnalysis} />
              </section>
            </>
          )}

          {state.optimization && state.status === 'complete' && (
            <>
              <Separator />
              <section>
                <OptimizationFeedbackDisplay feedback={state.optimization} />
              </section>
            </>
          )}
        </div>
      </div>

      <footer className="mt-auto border-t border-border/50 bg-card/30 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Powered by Gemini Flash 2.5, Braintrust, and Tavily
        </div>
      </footer>
    </main>
  )
}
