import * as googleGenAI from '@google/genai'
import { v4 as uuidv4 } from 'uuid'

const BRAINTRUST_PROJECT_NAME = 'llm-brand-monitor'

function isValidBraintrustKey(key: string | undefined): boolean {
  if (!key || typeof key !== 'string') return false
  const trimmed = key.trim()
  if (trimmed.length < 10) return false
  return trimmed.startsWith('sk-') || trimmed.split('.').length === 3
}

function getBraintrustApiKey(): string | undefined {
  return process.env.BRAINTRUST_API_KEY
}

type GenAIClient = InstanceType<typeof googleGenAI.GoogleGenAI>
let genAIClient: GenAIClient | null = null
let logger: Awaited<ReturnType<typeof import('braintrust').initLogger>> | null = null
let clientInitialized = false

async function getGenAIClient(): Promise<GenAIClient> {
  if (clientInitialized && genAIClient) return genAIClient

  const braintrustApiKey = getBraintrustApiKey()
  const hasBraintrustKey = isValidBraintrustKey(braintrustApiKey)

  if (hasBraintrustKey && braintrustApiKey) {
    try {
      const { initLogger, wrapGoogleGenAI } = await import('braintrust')
      logger = initLogger({
        projectName: BRAINTRUST_PROJECT_NAME,
        apiKey: braintrustApiKey,
        asyncFlush: false,
      })
      const { GoogleGenAI } = wrapGoogleGenAI(googleGenAI)
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
      })
    } catch (error) {
      console.error('[v0] Failed to initialize Braintrust-wrapped Gemini client:', error)
      genAIClient = new googleGenAI.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
      })
    }
  } else {
    genAIClient = new googleGenAI.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    })
  }

  clientInitialized = true
  return genAIClient
}

const genAI = new googleGenAI.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

async function getLogger() {
  if (logger) return logger
  const braintrustApiKey = getBraintrustApiKey()
  if (!isValidBraintrustKey(braintrustApiKey)) return null
  await getGenAIClient()
  return logger
}

export async function tracedGeminiCall(
  prompt: string,
  executionIndex: number
): Promise<{ text: string; spanId: string }> {
  const client = await getGenAIClient()

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 2048 },
  })

  const text = response.text || ''

  let spanId: string
  if (logger) {
    try {
      const { currentSpan } = await import('braintrust')
      spanId = currentSpan()?.id ?? uuidv4()
    } catch {
      spanId = uuidv4()
    }
  } else {
    spanId = uuidv4()
  }

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
