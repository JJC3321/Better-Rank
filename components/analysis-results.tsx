'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, TrendingDown, Minus, FileText, Database } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

interface AnalysisResultsProps {
  analysis: AnalysisResult
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const betterHelpWins = analysis.totalBetterHelpMentions > analysis.totalCompetitorMentions
  const isDraw = analysis.totalBetterHelpMentions === analysis.totalCompetitorMentions
  
  const mentionData = [
    { name: 'BetterHelp', mentions: analysis.totalBetterHelpMentions, fill: 'var(--color-chart-2)' },
    { name: analysis.competitor, mentions: analysis.totalCompetitorMentions, fill: 'var(--color-chart-1)' },
  ]

  const executionData = analysis.executions.map((exec, i) => ({
    name: `Run ${i + 1}`,
    betterhelp: exec.brandMentions.betterhelp,
    competitor: exec.brandMentions.competitor,
  }))

  const pieData = [
    { name: 'BetterHelp', value: analysis.totalBetterHelpMentions, fill: 'var(--color-chart-2)' },
    { name: analysis.competitor, value: analysis.totalCompetitorMentions, fill: 'var(--color-chart-1)' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-chart-2/30 bg-gradient-to-br from-chart-2/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-chart-2">
              <TrendingUp className="h-4 w-4" />
              BetterHelp Mentions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              {analysis.totalBetterHelpMentions}
            </div>
            <p className="text-xs text-muted-foreground">
              {(analysis.totalBetterHelpMentions / analysis.executionCount).toFixed(2)} per response
            </p>
          </CardContent>
        </Card>

        <Card className="border-chart-1/30 bg-gradient-to-br from-chart-1/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-chart-1">
              <TrendingDown className="h-4 w-4" />
              {analysis.competitor} Mentions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-1">
              {analysis.totalCompetitorMentions}
            </div>
            <p className="text-xs text-muted-foreground">
              {(analysis.totalCompetitorMentions / analysis.executionCount).toFixed(2)} per response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Total Executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analysis.executionCount}
            </div>
            <p className="text-xs text-muted-foreground">
              prompts analyzed
            </p>
          </CardContent>
        </Card>

        <Card className={
          betterHelpWins ? 'border-chart-2/30' : 
          isDraw ? 'border-muted' : 
          'border-chart-1/30'
        }>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              {betterHelpWins ? <TrendingUp className="h-4 w-4" /> : 
               isDraw ? <Minus className="h-4 w-4" /> : 
               <TrendingDown className="h-4 w-4" />}
              Result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${
              betterHelpWins ? 'text-chart-2' : 
              isDraw ? 'text-muted-foreground' : 
              'text-chart-1'
            }`}>
              {betterHelpWins ? 'BetterHelp Leads' : 
               isDraw ? 'Tied' : 
               `${analysis.competitor} Leads`}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.abs(analysis.totalBetterHelpMentions - analysis.totalCompetitorMentions)} mention difference
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">
            <BarChart3 className="mr-2 h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="responses">
            <FileText className="mr-2 h-4 w-4" />
            Responses
          </TabsTrigger>
          <TabsTrigger value="braintrust">
            <Database className="mr-2 h-4 w-4" />
            Braintrust Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Mentions Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mentionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" stroke="var(--color-muted-foreground)" />
                      <YAxis dataKey="name" type="category" width={100} stroke="var(--color-muted-foreground)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-card)', 
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
                        {mentionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mention Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-card)', 
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mentions Per Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-card)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="betterhelp" name="BetterHelp" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="competitor" name={analysis.competitor} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">LLM Responses</CardTitle>
              <CardDescription>
                Individual responses from each prompt execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {analysis.executions.map((exec, i) => (
                    <div 
                      key={exec.id} 
                      className="rounded-lg border border-border/50 bg-muted/30 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Execution {i + 1}
                        </span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-chart-2 border-chart-2/50">
                            BetterHelp: {exec.brandMentions.betterhelp}
                          </Badge>
                          <Badge variant="outline" className="text-chart-1 border-chart-1/50">
                            {analysis.competitor}: {exec.brandMentions.competitor}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {exec.response.length > 800 
                          ? exec.response.substring(0, 800) + '...' 
                          : exec.response}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground/60">
                        {new Date(exec.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="braintrust">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Braintrust Log IDs</CardTitle>
              <CardDescription>
                Logs sent to Braintrust for monitoring and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.braintrustSpanIds.map((spanId, i) => (
                  <div 
                    key={spanId}
                    className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      Execution {i + 1}
                    </span>
                    <code className="text-xs font-mono text-foreground">
                      {spanId}
                    </code>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                View these logs in your Braintrust dashboard for detailed monitoring and analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
