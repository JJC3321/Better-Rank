import { initLogger } from 'braintrust'
import { GoogleGenAI } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'

// Check if Braintrust API key is available
const hasBraintrustKey = !!process.env.BRAINTRUST_API_KEY

// Initialize the Braintrust logger only if API key exists
const logger = hasBraintrustKey
  ? initLogger({
      projectName: 'llm-brand-monitor',
      apiKey: process.env.BRAINTRUST_API_KEY,
    })
  : null

// Configure Google AI SDK client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

// Wrapper for Gemini calls that optionally logs to Braintrust
export async function tracedGeminiCall(
  prompt: string,
  executionIndex: number
): Promise<{ text: string; spanId: string }> {
  const spanId = uuidv4()
  const startTime = Date.now()

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 2048,
      },
    })

    const text = response.text || ''
    const duration = Date.now() - startTime

    // Log to Braintrust if available (non-blocking)
    if (logger) {
      try {
        logger.log({
          id: spanId,
          input: prompt,
          output: text,
          metadata: {
            model: 'gemini-2.5-flash',
            execution_index: executionIndex,
            duration_ms: duration,
          },
        })
      } catch (logError) {
        console.error('[v0] Braintrust logging error (non-fatal):', logError)
      }
    }

    return { text, spanId }
  } catch (error) {
    console.error('[v0] Gemini API error:', error)
    throw error
  }
}

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

export async function flushLogs() {
  if (logger) {
    try {
      await logger.flush()
    } catch (error) {
      console.error('[v0] Braintrust flush error (non-fatal):', error)
    }
  }
}

export { genAI, logger }
