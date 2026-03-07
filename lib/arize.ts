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

// Convert timestamp to nanoseconds (OTLP expects nanoseconds)
function toNanos(ms: number): string {
  return (BigInt(ms) * BigInt(1_000_000)).toString()
}

// Generate a hex trace ID (32 hex chars = 16 bytes)
function generateTraceId(): string {
  return uuidv4().replace(/-/g, '')
}

// Generate a hex span ID (16 hex chars = 8 bytes)
function generateSpanId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16)
}

export async function logToArize(span: Omit<ArizeSpan, 'traceId' | 'spanId'>): Promise<string> {
  const traceId = generateTraceId()
  const spanId = generateSpanId()

  const apiKey = process.env.ARIZE_API_KEY
  const spaceId = process.env.ARIZE_SPACE_ID

  if (!apiKey || !spaceId) {
    console.log('[v0] Arize credentials not configured, skipping log')
    return traceId
  }

  try {
    // Build OTLP-compatible span payload for Arize
    const otlpPayload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'llm-brand-monitor' } },
              { key: 'service.version', value: { stringValue: '1.0.0' } },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: 'llm-brand-monitor',
                version: '1.0.0',
              },
              spans: [
                {
                  traceId: traceId,
                  spanId: spanId,
                  name: span.name,
                  kind: 3, // SPAN_KIND_CLIENT
                  startTimeUnixNano: toNanos(span.startTime),
                  endTimeUnixNano: toNanos(span.endTime),
                  attributes: [
                    { key: 'llm.input', value: { stringValue: span.input.substring(0, 10000) } },
                    { key: 'llm.output', value: { stringValue: span.output.substring(0, 10000) } },
                    { key: 'llm.model', value: { stringValue: 'gemini-2.5-flash' } },
                    { key: 'llm.provider', value: { stringValue: 'google' } },
                    ...Object.entries(span.attributes).map(([key, value]) => ({
                      key: `custom.${key}`,
                      value: typeof value === 'number' 
                        ? { intValue: Math.round(value).toString() }
                        : { stringValue: String(value) },
                    })),
                  ],
                  status: { code: 1 }, // STATUS_CODE_OK
                },
              ],
            },
          ],
        },
      ],
    }

    // Send to Arize OTLP endpoint
    const response = await fetch('https://otlp.arize.com/v1/traces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'space_id': spaceId,
        'api_key': apiKey,
      },
      body: JSON.stringify(otlpPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[v0] Arize OTLP error:', response.status, errorText)
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
