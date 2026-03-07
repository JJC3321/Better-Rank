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

// Generate a hex trace ID (32 hex chars = 16 bytes)
function generateTraceId(): string {
  const uuid = uuidv4().replace(/-/g, '')
  return uuid
}

// Generate a hex span ID (16 hex chars = 8 bytes)
function generateSpanId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16)
}

// Convert hex string to base64
function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return Buffer.from(bytes).toString('base64')
}

export async function logToArize(span: Omit<ArizeSpan, 'traceId' | 'spanId'>): Promise<string> {
  const traceIdHex = generateTraceId()
  const spanIdHex = generateSpanId()

  const apiKey = process.env.ARIZE_API_KEY
  const spaceId = process.env.ARIZE_SPACE_ID

  if (!apiKey || !spaceId) {
    console.log('[v0] Arize credentials not configured, skipping log')
    return traceIdHex
  }

  try {
    // Convert timestamps to nanoseconds as strings for OTLP
    const startTimeNanos = (BigInt(span.startTime) * BigInt(1_000_000)).toString()
    const endTimeNanos = (BigInt(span.endTime) * BigInt(1_000_000)).toString()

    // Build attributes array in OTLP format
    const attributes = [
      { key: 'openinference.span.kind', value: { stringValue: 'LLM' } },
      { key: 'llm.model_name', value: { stringValue: 'gemini-2.5-flash' } },
      { key: 'llm.provider', value: { stringValue: 'google' } },
      { key: 'input.value', value: { stringValue: span.input.substring(0, 10000) } },
      { key: 'output.value', value: { stringValue: span.output.substring(0, 10000) } },
      { key: 'llm.input_messages', value: { stringValue: JSON.stringify([{ role: 'user', content: span.input.substring(0, 5000) }]) } },
      { key: 'llm.output_messages', value: { stringValue: JSON.stringify([{ role: 'assistant', content: span.output.substring(0, 5000) }]) } },
    ]

    // Add custom attributes
    for (const [key, value] of Object.entries(span.attributes)) {
      if (typeof value === 'number') {
        attributes.push({ key: `metadata.${key}`, value: { intValue: String(Math.round(value)) } })
      } else if (typeof value === 'string') {
        attributes.push({ key: `metadata.${key}`, value: { stringValue: value } })
      } else {
        attributes.push({ key: `metadata.${key}`, value: { stringValue: JSON.stringify(value) } })
      }
    }

    // Build OTLP JSON payload
    const otlpPayload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'llm-brand-monitor' } },
              { key: 'telemetry.sdk.language', value: { stringValue: 'nodejs' } },
              { key: 'telemetry.sdk.name', value: { stringValue: 'opentelemetry' } },
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
                  traceId: hexToBase64(traceIdHex),
                  spanId: hexToBase64(spanIdHex),
                  name: span.name,
                  kind: 3, // SPAN_KIND_CLIENT
                  startTimeUnixNano: startTimeNanos,
                  endTimeUnixNano: endTimeNanos,
                  attributes: attributes,
                  status: { code: 1 }, // STATUS_CODE_OK
                },
              ],
            },
          ],
        },
      ],
    }

    // Send to Arize OTLP endpoint with proper headers
    const response = await fetch('https://otlp.arize.com/v1/traces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
        'space_id': spaceId,
        'api_key': apiKey,
      },
      body: JSON.stringify(otlpPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[v0] Arize OTLP error:', response.status, errorText)
    } else {
      console.log('[v0] Successfully logged to Arize, trace:', traceIdHex)
    }
  } catch (error) {
    console.log('[v0] Failed to log to Arize:', error)
  }

  return traceIdHex
}

export function countBrandMentions(text: string, brand: string): number {
  const regex = new RegExp(brand, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}
