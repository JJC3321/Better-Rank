'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { Play, Zap } from 'lucide-react'

interface AnalysisFormProps {
  onSubmit: (prompt: string, frequency: number, competitor: string) => Promise<void>
  isLoading: boolean
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [prompt, setPrompt] = useState(
    'What are the best online therapy platforms available today? Please recommend options for someone looking for affordable mental health support.'
  )
  const [frequency, setFrequency] = useState(5)
  const [competitor, setCompetitor] = useState('Talkspace')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(prompt, frequency, competitor)
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-5 w-5 text-chart-1" />
          Analysis Configuration
        </CardTitle>
        <CardDescription>
          Configure your prompt and execution parameters to analyze brand visibility in LLM outputs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the prompt to analyze..."
              className="min-h-[120px] resize-none bg-background/50"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be executed multiple times to analyze brand mention patterns
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Execution Frequency
                </Label>
                <span className="text-sm font-mono text-chart-1">
                  {frequency} times
                </span>
              </div>
              <Slider
                id="frequency"
                min={1}
                max={20}
                step={1}
                value={[frequency]}
                onValueChange={([value]) => setFrequency(value)}
                disabled={isLoading}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Number of times to execute the prompt (1-20)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitor" className="text-sm font-medium">
                Competitor to Compare
              </Label>
              <Input
                id="competitor"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                placeholder="e.g., Talkspace, Cerebral..."
                className="bg-background/50"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                The competitor brand to compare against BetterHelp
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim() || !competitor.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
