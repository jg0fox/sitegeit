'use client'

import { useState } from 'react'
import { SiteBreadcrumb } from './SiteBreadcrumb'

interface SiteFAQProps {
  h1: string
  questions: { question: string; answer: string }[]
  basePath: string
}

export function SiteFAQ({ h1, questions, basePath }: SiteFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  const breadcrumbs = [{ label: 'FAQ' }]

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 5rem)',
        paddingBottom: 'var(--space-section, 5rem)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <div className="mb-6">
          <SiteBreadcrumb items={breadcrumbs} basePath={basePath} />
        </div>

        <h1
          className="mb-8 text-2xl sm:text-3xl md:text-4xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.02em)',
            lineHeight: 1.2,
          }}
        >
          {h1}
        </h1>

        <div
          className="divide-y"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {questions.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="text-base font-medium sm:text-lg"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {item.question}
                  </span>
                  <span
                    className="material-symbols-outlined shrink-0 transition-transform"
                    style={{
                      fontSize: '24px',
                      color: 'var(--color-text-secondary)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    add
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="pb-5 pr-8 text-sm leading-relaxed sm:text-base"
                    style={{ color: 'var(--color-text-secondary)' }}
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
