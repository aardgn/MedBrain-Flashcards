export type GeneratedCard = {
  soru: string
  cevap: string
}

export class GeneratedCardsValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GeneratedCardsValidationError'
  }
}

function stripMarkdownFence(value: string) {
  const trimmed = value.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return (fenced?.[1] ?? trimmed).trim()
}

export function parseGeneratedCards(rawText: string): GeneratedCard[] {
  const normalized = stripMarkdownFence(rawText)

  if (normalized.toLocaleUpperCase('en-US') === 'REJECT') {
    throw new GeneratedCardsValidationError('Döküman okunamadı veya kart üretmeye uygun bulunmadı.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(normalized)
  } catch {
    throw new GeneratedCardsValidationError('Model geçerli JSON üretemedi.')
  }

  if (!Array.isArray(parsed)) {
    throw new GeneratedCardsValidationError('Model yanıtı bir kart listesi değil.')
  }

  if (parsed.length === 0) {
    throw new GeneratedCardsValidationError('Kart üretilemedi.')
  }

  return parsed.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new GeneratedCardsValidationError(`${index + 1}. kartın formatı geçersiz.`)
    }

    const question = 'soru' in item && typeof item.soru === 'string' ? item.soru.trim() : ''
    const answer = 'cevap' in item && typeof item.cevap === 'string' ? item.cevap.trim() : ''

    if (!question || !answer) {
      throw new GeneratedCardsValidationError(`${index + 1}. kartta soru veya cevap eksik.`)
    }

    return { soru: question, cevap: answer }
  })
}
