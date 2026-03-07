import { GoogleGenAI } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'

const BRAINTRUST_PROJECT_NAME = 'llm-brand-monitor'

function isValidBraintrustKey(key: string | undefined): boolean {
  if (!key) return false
  const parts = key.split('.')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

const braintrustApiKey = process.env.BRAINTRUST_API_KEY
const hasBraintrustKey = isValidBraintrustKey(braintrustApiKey)

let logger: Awaited<ReturnType<typeof import('braintrust').initLogger>> | null = null
let loggerInitialized = false

async function getLogger() {
  if (!hasBraintrustKey) return null
  if (loggerInitialized) return logger

  try {
    const { initLogger } = await import('braintrust')
    logger = initLogger({
      projectName: BRAINTRUST_PROJECT_NAME,
      apiKey: braintrustApiKey,
    })
    loggerInitialized = true
    return logger
  } catch (error) {
    console.error('[v0] Failed to initialize Braintrust logger:', error)
    loggerInitialized = true
    return null
  }
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

export async function tracedGeminiCall(
  prompt: string,
  executionIndex: number
): Promise<{ text: string; spanId: string }> {
  const btLogger = await getLogger()

  if (btLogger) {
    const { currentSpan } = await import('braintrust')
    return await btLogger.traced(
      async (span) => {
        span.log({
          input: prompt,
          metadata: {
            model: 'gemini-2.5-flash',
            execution_index: executionIndex,
          },
        })
        const startTime = Date.now()
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { maxOutputTokens: 2048 },
        })
        const text = response.text || ''
        const duration = Date.now() - startTime
        span.log({
          output: text,
          metadata: {
            model: 'gemini-2.5-flash',
            execution_index: executionIndex,
            duration_ms: duration,
          },
        })
        return { text, spanId: currentSpan().id }
      },
      { name: 'gemini-call', type: 'llm' }
    )
  }

  const spanId = uuidv4()
  const startTime = Date.now()
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 2048 },
  })
  const text = response.text || ''
  return { text, spanId }
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
