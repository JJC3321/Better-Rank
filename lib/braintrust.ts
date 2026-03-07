import Braintrust, { initLogger, traced } from 'braintrust'
import { GoogleGenAI } from '@google/genai'

// Initialize the Braintrust logger
const logger = initLogger({
  projectName: 'llm-brand-monitor',
  apiKey: process.env.BRAINTRUST_API_KEY,
})

// Configure Google AI SDK client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

// Traced wrapper for Gemini calls that logs to Braintrust
export async function tracedGeminiCall(
  prompt: string,
  executionIndex: number
): Promise<{ text: string; spanId: string }> {
  return traced(
    async (span) => {
      const startTime = Date.now()
      
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 2048,
        },
      })
      
      const text = response.text || ''
      const duration = Date.now() - startTime
      
      // Log input/output to the span
      span.log({
        input: prompt,
        output: text,
        metadata: {
          model: 'gemini-2.5-flash',
          execution_index: executionIndex,
          duration_ms: duration,
        },
      })
      
      return { text, spanId: span.id }
    },
    { name: `gemini-execution-${executionIndex}` }
  )
}

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

export async function flushLogs() {
  await logger.flush()
}

export { genAI, logger }
