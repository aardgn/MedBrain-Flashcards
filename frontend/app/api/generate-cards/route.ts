import { parseGeneratedCards, GeneratedCardsValidationError } from '@/lib/generated-cards'
import { FLASHCARD_PROMPT } from '@/lib/prompts'
import { getStreakDateKey } from '@/lib/streak'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const DEFAULT_DAILY_UPLOAD_LIMIT = 15
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
])

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

class GeminiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'GeminiRequestError'
  }
}

function getDailyUploadLimit() {
  const configuredLimit = Number.parseInt(process.env.DAILY_UPLOAD_LIMIT ?? '', 10)

  return Number.isSafeInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : DEFAULT_DAILY_UPLOAD_LIMIT
}

function jsonError(message: string, status: number) {
  return Response.json({ success: false, message }, { status })
}

async function generateWithModel({
  apiKey,
  model,
  mimeType,
  base64Data,
}: {
  apiKey: string
  model: string
  mimeType: string
  base64Data: string
}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: FLASHCARD_PROMPT },
              { inlineData: { mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
      signal: AbortSignal.timeout(60_000),
    },
  )

  if (!response.ok) {
    throw new GeminiRequestError(
      `Gemini modeli ${response.status} durum kodu döndürdü.`,
      response.status,
    )
  }

  const payload = (await response.json()) as GeminiResponse
  const rawText = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!rawText) {
    throw new GeminiRequestError('Gemini boş yanıt döndürdü.')
  }

  return parseGeneratedCards(rawText)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return jsonError('Bu işlem için giriş yapmalısınız.', 401)
  }

  const dailyUploadLimit = getDailyUploadLimit()
  const istanbulDay = getStreakDateKey(new Date())
  const usageResult = await supabase
    .from('card_generation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('istanbul_day', istanbulDay)

  if (usageResult.error) {
    console.error('[generate-cards] Daily usage check failed', {
      message: usageResult.error.message,
      code: usageResult.error.code,
      details: usageResult.error.details,
    })
    return jsonError('Günlük kullanım bilgisi kontrol edilemedi. Lütfen tekrar deneyin.', 500)
  }

  if ((usageResult.count ?? 0) >= dailyUploadLimit) {
    return jsonError(
      `Günlük yükleme limitine ulaştınız (${dailyUploadLimit}/gün), yarın tekrar deneyebilirsiniz.`,
      429,
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError('Yükleme isteği okunamadı.', 400)
  }

  const deckNameValue = formData.get('deckName')
  const fileValue = formData.get('file')
  const deckName = typeof deckNameValue === 'string' ? deckNameValue.trim() : ''

  if (!deckName) return jsonError('Deck adı zorunludur.', 400)
  if (deckName.length > 120) return jsonError('Deck adı en fazla 120 karakter olabilir.', 400)
  if (!(fileValue instanceof File)) return jsonError('PDF veya görsel dosyası seçmelisiniz.', 400)
  if (fileValue.size === 0) return jsonError('Yüklenen dosya boş.', 400)
  if (fileValue.size > MAX_FILE_SIZE) return jsonError('Dosya boyutu en fazla 10 MB olabilir.', 413)
  if (!ALLOWED_MIME_TYPES.has(fileValue.type)) {
    return jsonError('Yalnızca PDF, PNG, JPG veya JPEG dosyaları kabul edilir.', 415)
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return jsonError('Gemini API yapılandırması eksik.', 500)

  const primaryModel = process.env.GEMINI_MODEL_PRIMARY?.trim() || 'gemini-3-flash-preview'
  const fallbackModel = process.env.GEMINI_MODEL_FALLBACK?.trim() || 'gemini-2.5-flash'
  const base64Data = Buffer.from(await fileValue.arrayBuffer()).toString('base64')

  let cards: ReturnType<typeof parseGeneratedCards> | null = null
  let lastError: unknown
  let quotaExceeded = false

  for (const model of [primaryModel, fallbackModel]) {
    try {
      cards = await generateWithModel({
        apiKey,
        model,
        mimeType: fileValue.type,
        base64Data,
      })
      break
    } catch (error) {
      lastError = error
      if (error instanceof GeminiRequestError && error.status === 429) {
        quotaExceeded = true
      }
    }
  }

  if (!cards) {
    if (quotaExceeded) {
      return jsonError('Şu anda yoğunluk var, birkaç dakika sonra tekrar deneyin.', 503)
    }

    const message =
      lastError instanceof GeneratedCardsValidationError
        ? lastError.message
        : 'Döküman işlenemedi. Lütfen daha okunaklı bir dosyayla tekrar deneyin.'
    return jsonError(message, 422)
  }

  const insertResult = await supabase.from('cards').insert(
    cards.map((card) => ({
      soru: card.soru,
      cevap: card.cevap,
      ders: deckName,
      durum: 'yeni',
      sonraki_tekrar: 0,
      aralik: 0,
      user_id: user.id,
    })),
  )

  if (insertResult.error) {
    const debug = {
      message: insertResult.error.message,
      code: insertResult.error.code,
      details: insertResult.error.details,
    }

    console.error('[generate-cards] Supabase insert failed', debug)

    return Response.json(
      {
        success: false,
        message: 'Kartlar üretildi ancak kaydedilemedi. Lütfen tekrar deneyin.',
        debug,
      },
      { status: 500 },
    )
  }

  const usageLogResult = await supabase.from('card_generation_logs').insert({
    user_id: user.id,
  })

  if (usageLogResult.error) {
    console.error('[generate-cards] Daily usage log insert failed', {
      message: usageLogResult.error.message,
      code: usageLogResult.error.code,
      details: usageLogResult.error.details,
    })
    return jsonError(
      'Kartlar kaydedildi ancak kullanım kaydı oluşturulamadı. Lütfen destek ekibine bildirin.',
      500,
    )
  }

  return Response.json({
    success: true,
    deckName,
    cardCount: cards.length,
  })
}
