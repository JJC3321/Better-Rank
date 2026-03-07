import { GoogleGenAI } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'

// Validate Braintrust API key format (should be a JWT with 3 parts)
function isValidBraintrustKey(key: string | undefined): boolean {
  if (!key) return false
  const parts = key.split('.')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

const braintrustApiKey = process.env.BRAINTRUST_API_KEY
const hasBraintrustKey = isValidBraintrustKey(braintrustApiKey)

// Lazy initialization of Braintrust logger to avoid auth errors at startup
let logger: ReturnType<typeof import('braintrust').initLogger> | null = null
let loggerInitialized = false

async function getLogger() {
  if (!hasBraintrustKey) return null
  if (loggerInitialized) return logger
  
  try {
    const { initLogger } = await import('braintrust')
    logger = initLogger({
      projectName: 'llm-brand-monitor',
      apiKey: braintrustApiKey,
    })
    loggerInitialized = true
    return logger
  } catch (error) {
    console.error('[v0] Failed to initialize Braintrust logger:', error)
    loggerInitialized = true // Don't retry
    return null
  }
}

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
    const btLogger = await getLogger()
    if (btLogger) {
      try {
        btLogger.log({
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
  const btLogger = await getLogger()
  if (btLogger) {
    try {
      await btLogger.flush()
    } catch (error) {
      console.error('[v0] Braintrust flush error (non-fatal):', error)
    }
  }
}

export { genAI }
