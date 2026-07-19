'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  // Simpan index yang lagi kebuka dalam Set — biar orang bisa buka lebih dari
  // satu pertanyaan sekaligus, bukan cuma satu-satu.
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
      }
      return next
    })
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = openIndexes.has(i)
        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-sm"
          >
            <button
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-[var(--color-ink)] sm:text-[15px]">
                {item.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-[15px]">
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}