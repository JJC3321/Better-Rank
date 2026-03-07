'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import type { FullAnalysisState } from '@/lib/types'

interface AnalysisProgressProps {
  state: FullAnalysisState
}

const steps = [
  { key: 'executing', label: 'Executing prompts with Gemini Flash 2.5', description: 'Running multiple prompt executions' },
  { key: 'logging', label: 'Logging to Braintrust', description: 'Storing outputs for monitoring' },
  { key: 'analyzing', label: 'Analyzing websites with Tavily', description: 'Extracting insights from BetterHelp and competitor' },
  { key: 'optimizing', label: 'Generating optimization feedback', description: 'Creating actionable recommendations' },
]

function getStepStatus(currentStatus: string, stepKey: string): 'complete' | 'active' | 'pending' {
  const statusOrder = ['idle', 'executing', 'logging', 'analyzing', 'optimizing', 'complete']
  const currentIndex = statusOrder.indexOf(currentStatus)
  const stepIndex = statusOrder.indexOf(stepKey)
  
  if (currentStatus === 'complete' || currentStatus === 'error') {
    return stepIndex < statusOrder.indexOf('complete') ? 'complete' : 'pending'
  }
  
  if (stepIndex < currentIndex) return 'complete'
  if (stepIndex === currentIndex) return 'active'
  return 'pending'
}

export function AnalysisProgress({ state }: AnalysisProgressProps) {
  if (state.status === 'idle') return null

  return (
    <Card className="border-chart-1/20 bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(state.status, step.key)
            
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {status === 'complete' ? (
                    <CheckCircle2 className="h-6 w-6 text-chart-2" />
                  ) : status === 'active' ? (
                    <div className="relative">
                      <Circle className="h-6 w-6 text-chart-1" />
                      <Loader2 className="absolute inset-0 h-6 w-6 animate-spin text-chart-1" />
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/40" />
                  )}
                  {index < steps.length - 1 && (
                    <div 
                      className={`mt-1 h-8 w-0.5 ${
                        status === 'complete' ? 'bg-chart-2' : 'bg-muted-foreground/20'
                      }`} 
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`font-medium ${
                    status === 'active' ? 'text-chart-1' : 
                    status === 'complete' ? 'text-foreground' : 
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {status === 'active' && state.currentStep && (
                    <p className="mt-1 text-xs text-chart-1 flex items-center gap-2">
                      <Spinner className="h-3 w-3" />
                      {state.currentStep}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
