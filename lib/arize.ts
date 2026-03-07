import { v4 as uuidv4 } from 'uuid'

interface ArizeSpan {
  traceId: string
  spanId: string
  name: string
  input: string
  output: string
  startTime: number
  endTime: number
  attributes: Record<string, unknown>
}

export async function logToArize(span: Omit<ArizeSpan, 'traceId' | 'spanId'>): Promise<string> {
  const traceId = uuidv4()
  const spanId = uuidv4()

  const apiKey = process.env.ARIZE_API_KEY
  const spaceId = process.env.ARIZE_SPACE_ID

  if (!apiKey || !spaceId) {
    console.log('[v0] Arize credentials not configured, skipping log')
    return traceId
  }

  try {
    // Arize Phoenix/Arize AI HTTP logging
    const payload = {
      model_id: 'llm-brand-monitor',
      model_version: '1.0.0',
      model_type: 'llm',
      prediction_id: traceId,
      prediction_timestamp: new Date().toISOString(),
      prediction_label: {
        input: span.input,
        output: span.output,
      },
      actual_label: null,
      features: {
        prompt_length: span.input.length,
        response_length: span.output.length,
        latency_ms: span.endTime - span.startTime,
        ...span.attributes,
      },
      tags: {
        source: 'llm-brand-monitor',
        operation: span.name,
      },
      embeddings: null,
    }

    // Log to Arize via their HTTP API
    const response = await fetch('https://api.arize.com/v1/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Space-Id': spaceId,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[v0] Arize API error:', response.status, errorText)
    } else {
      console.log('[v0] Successfully logged to Arize:', traceId)
    }
  } catch (error) {
    console.log('[v0] Failed to log to Arize:', error)
  }

  return traceId
}

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}
