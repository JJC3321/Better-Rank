'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Sparkles, 
  FileText, 
  LayoutGrid, 
  Tag, 
  Search, 
  Eye, 
  Trophy,
  CheckSquare,
  ArrowRight
} from 'lucide-react'
import type { OptimizationFeedback } from '@/lib/types'

interface OptimizationFeedbackDisplayProps {
  feedback: OptimizationFeedback
}

export function OptimizationFeedbackDisplay({ feedback }: OptimizationFeedbackDisplayProps) {
  const sections = [
    {
      id: 'content',
      title: 'Content Recommendations',
      icon: FileText,
      items: feedback.contentRecommendations,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      id: 'structure',
      title: 'Structure Improvements',
      icon: LayoutGrid,
      items: feedback.structureImprovements,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      id: 'keywords',
      title: 'Keyword Optimizations',
      icon: Tag,
      items: feedback.keywordOptimizations,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      id: 'seo',
      title: 'SEO Strategies',
      icon: Search,
      items: feedback.seoStrategies,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      id: 'llm',
      title: 'LLM Visibility Tips',
      icon: Eye,
      items: feedback.llmVisibilityTips,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
    },
    {
      id: 'competitive',
      title: 'Competitive Advantages',
      icon: Trophy,
      items: feedback.competitiveAdvantages,
      color: 'text-foreground',
      bgColor: 'bg-foreground/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-chart-4" />
        <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
      </div>

      {/* Action Plan - Priority Section */}
      <Card className="border-chart-2/30 bg-gradient-to-br from-chart-2/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-5 w-5 text-chart-2" />
            Prioritized Action Plan
          </CardTitle>
          <CardDescription>
            Step-by-step implementation guide for maximum impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {feedback.actionPlan.map((action, i) => (
              <li 
                key={i} 
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-chart-2 text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{action}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detailed Recommendations</CardTitle>
          <CardDescription>
            Comprehensive strategies organized by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full" defaultValue={['content', 'llm']}>
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1.5 ${section.bgColor}`}>
                      <section.icon className={`h-4 w-4 ${section.color}`} />
                    </div>
                    <span className="font-medium">{section.title}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {section.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-8">
                    {section.items.map((item, i) => (
                      <li 
                        key={i} 
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${section.bgColor.replace('/10', '')}`} />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Win Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Wins</CardTitle>
          <CardDescription>
            High-impact, low-effort optimizations to implement first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {feedback.keywordOptimizations.slice(0, 5).map((keyword, i) => (
              <Badge key={i} className="bg-chart-4/20 text-chart-4 hover:bg-chart-4/30">
                {keyword}
              </Badge>
            ))}
            {feedback.llmVisibilityTips.slice(0, 2).map((tip, i) => (
              <Badge key={i} variant="outline" className="border-chart-5/50">
                {tip.length > 40 ? tip.substring(0, 40) + '...' : tip}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
