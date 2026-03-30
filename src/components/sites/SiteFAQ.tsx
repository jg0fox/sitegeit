'use client'

import { useState } from 'react'
import { SiteBreadcrumb } from './SiteBreadcrumb'

interface SiteFAQProps {
  h1: string
  questions: { question: string; answer: string }[]
  basePath: string
  isEditorial?: boolean
}

export function SiteFAQ({ h1, questions, basePath, isEditorial }: SiteFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  const breadcrumbs = [{ label: 'FAQ' }]

  // =========================================================
  // Editorial rendering — no borders, generous spacing, tonal bg
  // =========================================================
  if (isEditorial) {
    return (
      <section
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(3rem, 6vw, 5rem)',
          paddingBottom: 'clamp(3rem, 6vw, 5rem)',
          backgroundColor: 'var(--ed-surface, var(--color-background))',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1280px)' }}>
          <div className="mb-6">
            <SiteBreadcrumb items={breadcrumbs} basePath={basePath} isEditorial />
          </div>

          <h1
            className="mb-10"
            style={{
              fontFamily: 'var(--ed-font-heading, var(--font-heading))',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--ed-on-surface, var(--color-text-primary))',
            }}
          >
            {h1}
          </h1>

          <div className="max-w-3xl space-y-3">
            {questions.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={i}
                  className="overflow-hidden transition-colors"
                  style={{
                    backgroundColor: isOpen
                      ? 'var(--ed-surface-container-lowest, #ffffff)'
                      : 'transparent',
                    borderRadius: 'var(--ed-radius-lg, 2rem)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="text-base font-medium sm:text-lg"
                      style={{ color: 'var(--ed-on-surface, var(--color-text-primary))' }}
                    >
                      {item.question}
                    </span>
                    <span
                      className="material-symbols-outlined shrink-0 transition-transform duration-300"
                      style={{
                        fontSize: '24px',
                        color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      }}
                    >
                      add
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      className="px-6 pb-6 text-sm leading-relaxed sm:text-base"
                      style={{
                        color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                        lineHeight: 1.6,
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  return (
    <section className="px-4" style={{ paddingTop: 'var(--space-section, 5rem)', paddingBottom: 'var(--space-section, 5rem)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <div className="mb-6"><SiteBreadcrumb items={breadcrumbs} basePath={basePath} /></div>
        <h1 className="mb-8 text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.02em)', lineHeight: 1.2 }}>{h1}</h1>
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {questions.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} style={{ borderColor: 'var(--color-border)' }}>
                <button type="button" onClick={() => toggle(i)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={isOpen}>
                  <span className="text-base font-medium sm:text-lg" style={{ color: 'var(--color-text-primary)' }}>{item.question}</span>
                  <span className="material-symbols-outlined shrink-0 transition-transform" style={{ fontSize: '24px', color: 'var(--color-text-secondary)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>add</span>
                </button>
                {isOpen && <div className="pb-5 pr-8 text-sm leading-relaxed sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>{item.answer}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
