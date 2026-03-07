import { GoogleGenAI } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'

const BRAINTRUST_PROJECT_NAME = 'llm-brand-monitor'

function getBraintrustApiKey(): string | undefined {
  return process.env.BRAINTRUST_API_KEY
}

function isValidBraintrustKey(key: string | undefined): boolean {
  if (!key || typeof key !== 'string') return false
  const trimmed = key.trim()
  if (trimmed.length < 10) return false
  return trimmed.startsWith('sk-') || trimmed.split('.').length === 3
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

let logger: Awaited<ReturnType<typeof import('braintrust').initLogger>> | null = null
let loggerInitialized = false

async function getLogger() {
  if (loggerInitialized) return logger
  const apiKey = getBraintrustApiKey()
  if (!isValidBraintrustKey(apiKey)) {
    loggerInitialized = true
    return null
  }
  try {
    const { initLogger } = await import('braintrust')
    logger = initLogger({
      projectName: BRAINTRUST_PROJECT_NAME,
      apiKey: apiKey!,
      asyncFlush: false,
    })
  } catch (error) {
    console.error('[braintrust] init failed:', error)
  }
  loggerInitialized = true
  return logger
}

export async function getGenAI() {
  return genAI
}

export async function tracedGeminiCall(
  prompt: string,
  executionIndex: number
): Promise<{ text: string; spanId: string }> {
  const btLogger = await getLogger()

  if (btLogger) {
    const { currentSpan } = await import('braintrust')
    const result = await btLogger.traced(
      async (span) => {
        span.log({
          input: prompt,
          metadata: { model: 'gemini-2.5-flash', execution_index: executionIndex },
        })
        const start = Date.now()
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { maxOutputTokens: 2048 },
        })
        const text = response.text ?? ''
        span.log({
          output: text,
          metadata: {
            model: 'gemini-2.5-flash',
            execution_index: executionIndex,
            duration_ms: Date.now() - start,
          },
        })
        return { text, spanId: currentSpan().id }
      },
      { name: 'gemini-call', type: 'llm' }
    )
    return result
  }

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 2048 },
  })
  const text = response.text ?? ''
  return { text, spanId: uuidv4() }
}

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

export async function flushLogs() {
  const btLogger = await getLogger()
  if (!btLogger) return
  try {
    await btLogger.flush()
    await new Promise((r) => setTimeout(r, 500))
  } catch (error) {
    console.error('[braintrust] flush error:', error)
  }
}

export { genAI }
