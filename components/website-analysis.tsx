'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Globe, Lightbulb, Target, AlertTriangle, Tag, LayoutGrid } from 'lucide-react'
import type { WebsiteAnalysis } from '@/lib/types'

interface WebsiteAnalysisDisplayProps {
  analysis: WebsiteAnalysis
}

export function WebsiteAnalysisDisplay({ analysis }: WebsiteAnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-chart-3" />
        <h3 className="text-lg font-semibold">Website Analysis (via Tavily)</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* BetterHelp Analysis */}
        <Card className="border-chart-2/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-chart-2">
              <Globe className="h-4 w-4" />
              BetterHelp
            </CardTitle>
            <CardDescription className="text-xs">
              {analysis.betterhelp.url}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Insights */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-chart-4" />
                Key Insights
              </h4>
              <ScrollArea className="h-[120px]">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysis.betterhelp.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-chart-2" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Target className="h-4 w-4 text-chart-2" />
                Strengths
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.betterhelp.strengths.map((strength, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-chart-5" />
                Potential Weaknesses
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.betterhelp.weaknesses.map((weakness, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-chart-5/50 text-chart-5">
                    {weakness}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Tag className="h-4 w-4 text-chart-3" />
                Keywords
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysis.betterhelp.keywords.map((keyword, i) => (
                  <span 
                    key={i} 
                    className="rounded-full bg-chart-2/10 px-2 py-0.5 text-xs text-chart-2"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Structure */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                Content Structure
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysis.betterhelp.contentStructure}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card className="border-chart-1/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-chart-1">
              <Globe className="h-4 w-4" />
              {analysis.competitor.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {analysis.competitor.url}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Insights */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-chart-4" />
                Key Insights
              </h4>
              <ScrollArea className="h-[120px]">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysis.competitor.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-chart-1" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Target className="h-4 w-4 text-chart-1" />
                Strengths
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.competitor.strengths.map((strength, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Tag className="h-4 w-4 text-chart-3" />
                Keywords
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysis.competitor.keywords.map((keyword, i) => (
                  <span 
                    key={i} 
                    className="rounded-full bg-chart-1/10 px-2 py-0.5 text-xs text-chart-1"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Structure */}
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                Content Structure
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysis.competitor.contentStructure}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
