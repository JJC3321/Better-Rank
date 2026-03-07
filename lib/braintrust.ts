import { wrapGoogleGenAI, initLogger } from 'braintrust'
import * as googleGenAi from '@google/genai'

// Wrap Google GenAI SDK - automatically captures all AI calls as traces
const { GoogleGenAI } = wrapGoogleGenAI(googleGenAi)

// Initialize the Braintrust logger
initLogger({
  projectName: 'llm-brand-monitor',
  apiKey: process.env.BRAINTRUST_API_KEY,
})

// Configure Google AI SDK with wrapped client
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

export { client }

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}
