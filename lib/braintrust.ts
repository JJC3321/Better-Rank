import { initLogger, wrapTraced } from 'braintrust'

// Initialize the Braintrust logger
const logger = initLogger({
  projectName: 'llm-brand-monitor',
  apiKey: process.env.BRAINTRUST_API_KEY,
})

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

interface LogParams {
  name: string
  input: string
  output: string
  startTime: number
  endTime: number
  attributes: Record<string, string | number | boolean>
}

export async function logToBraintrust(params: LogParams): Promise<string> {
  const { name, input, output, startTime, endTime, attributes } = params
  
  const spanId = crypto.randomUUID()
  const durationMs = endTime - startTime

  try {
    // Log the span to Braintrust
    logger.log({
      input: { prompt: input },
      output: { response: output },
      metadata: {
        span_name: name,
        span_id: spanId,
        duration_ms: durationMs,
        model: 'gemini-2.5-flash',
        ...attributes,
      },
      scores: {
        betterhelp_mentions: attributes.betterhelp_mentions as number,
        competitor_mentions: attributes.competitor_mentions as number,
      },
    })

    return spanId
  } catch (error) {
    console.error('[v0] Error logging to Braintrust:', error)
    return spanId
  }
}

// Wrapper for traced function execution
export const tracedGenerate = wrapTraced(
  async function tracedGenerate(
    generateFn: () => Promise<string>,
    input: string,
    metadata: Record<string, string | number | boolean>
  ): Promise<{ output: string; spanId: string }> {
    const spanId = crypto.randomUUID()
    const output = await generateFn()
    return { output, spanId }
  },
  { name: 'gemini-generation' }
)

// Flush logs before response
export async function flushBraintrustLogs(): Promise<void> {
  try {
    await logger.flush()
  } catch (error) {
    console.error('[v0] Error flushing Braintrust logs:', error)
  }
}
