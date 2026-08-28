'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type GenerateCardsResponse = {
  success: boolean
  message?: string
  deckName?: string
  cardCount?: number
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M5 13v6h14v-6" />
    </svg>
  )
}

function Spinner() {
  return <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
}

export function CreateDeckForm({ existingDecks }: { existingDecks: string[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const deckName = String(formData.get('deckName') ?? '').trim()

    setErrorMessage(null)
    setSuccessMessage(null)

    if (!deckName) {
      setErrorMessage('Deck adı zorunludur.')
      return
    }
    if (!file) {
      setErrorMessage('PDF veya görsel dosyası seçmelisiniz.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('Dosya boyutu en fazla 10 MB olabilir.')
      return
    }

    setIsSubmitting(true)
    formData.set('deckName', deckName)
    formData.set('file', file)

    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        body: formData,
      })
      const payload = (await response.json().catch(() => null)) as GenerateCardsResponse | null

      if (!response.ok || !payload?.success) {
        setErrorMessage(payload?.message || 'Kartlar üretilemedi. Lütfen tekrar deneyin.')
        return
      }

      const savedDeckName = payload.deckName || deckName
      setSuccessMessage(`${payload.cardCount} kart “${savedDeckName}” deck’ine eklendi.`)
      router.push(`/study/${encodeURIComponent(savedDeckName)}`)
      router.refresh()
    } catch {
      setErrorMessage('Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#dfe5de] bg-white p-5 shadow-[0_20px_60px_rgba(32,64,48,0.08)] sm:p-8">
      <div>
        <label htmlFor="deckName" className="text-sm font-semibold text-[#25342e]">Deck / Ders Adı</label>
        <input
          id="deckName"
          name="deckName"
          type="text"
          required
          maxLength={120}
          disabled={isSubmitting}
          list="existing-decks"
          placeholder="Örn. Kardiyovasküler Sistem"
          className="mt-2 h-12 w-full rounded-xl border border-[#dbe2da] bg-white px-4 outline-none transition placeholder:text-[#9aa29e] focus:border-[#7fa08f] focus:ring-2 focus:ring-[#dfe9e2] disabled:bg-[#f3f5f1]"
        />
        <datalist id="existing-decks">
          {existingDecks.map((deck) => <option key={deck} value={deck} />)}
        </datalist>
        <p className="mt-2 text-xs leading-5 text-[#717b76]">Mevcut bir deck adını seçerseniz yeni kartlar o deck&apos;e eklenir.</p>
      </div>

      <div className="mt-6">
        <span className="text-sm font-semibold text-[#25342e]">Ders Materyali</span>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#bfcdbf] bg-[#f8faf6] px-5 text-center text-[#07563f] transition hover:border-[#6e9b83] hover:bg-[#f3f7f1] disabled:cursor-wait disabled:opacity-60"
        >
          <UploadIcon />
          <span className="mt-4 font-bold">{file ? file.name : 'PDF veya görsel seçin'}</span>
          <span className="mt-2 text-sm text-[#6d7772]">PDF, PNG, JPG veya JPEG · en fazla 10 MB</span>
          {file ? <span className="mt-2 text-xs font-medium text-[#527064]">{(file.size / 1024 / 1024).toFixed(2)} MB</span> : null}
        </button>
        <input
          ref={fileInputRef}
          name="file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          disabled={isSubmitting}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </div>

      {errorMessage ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{errorMessage}</div> : null}
      {successMessage ? <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">{successMessage}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#07563f] px-5 font-semibold text-white transition hover:bg-[#064733] disabled:cursor-wait disabled:bg-[#6f9587]"
      >
        {isSubmitting ? <><Spinner /> Döküman okunuyor...</> : 'Soruları Üret'}
      </button>
    </form>
  )
}
