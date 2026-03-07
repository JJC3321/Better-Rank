import * as googleGenAI from '@google/genai'
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

type GenAIClient = InstanceType<typeof googleGenAI.GoogleGenAI>
let client: GenAIClient | null = null
let logger: Awaited<ReturnType<typeof import('braintrust').initLogger>> | null = null
let initialized = false

async function getClient(): Promise<GenAIClient> {
  if (initialized && client) return client

  const apiKey = getBraintrustApiKey()
  const useBraintrust = isValidBraintrustKey(apiKey)

  if (useBraintrust && apiKey) {
    try {
      const { initLogger, wrapGoogleGenAI } = await import('braintrust')
      logger = initLogger({
        projectName: BRAINTRUST_PROJECT_NAME,
        apiKey,
        asyncFlush: false,
      })
      const { GoogleGenAI } = wrapGoogleGenAI(googleGenAI)
      client = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
      })
    } catch (error) {
      console.error('[braintrust] Init failed, using raw client:', error)
      client = new googleGenAI.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
      })
    }
  } else {
    client = new googleGenAI.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    })
  }

  initialized = true
  return client
}

export async function getGenAI(): Promise<GenAIClient> {
  return getClient()
}

export async function tracedGeminiCall(
  prompt: string,
  executionIndex: number
): Promise<{ text: string; spanId: string }> {
  const genAI = await getClient()

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 2048 },
  })

  const text = response.text ?? ''
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
  if (logger) {
    try {
      await logger.flush()
    } catch (error) {
      console.error('[braintrust] Flush error:', error)
    }
  }
}

const genAI = new googleGenAI.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

export { genAI }
