import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteFAQ } from '@/components/sites/SiteFAQ'
import { getBasePath } from '@/lib/utils/site-urls.server'

interface FAQContent {
  h1: string
  questions: { question: string; answer: string }[]
}

interface Props {
  params: Promise<{ slug: string }>
}

async function getSiteData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: sites } = await supabase
    .from('generated_sites')
    .select('*, businesses(*)')
    .eq('deploy_url', slug)
    .eq('deploy_status', 'live')
    .order('created_at', { ascending: false })
    .limit(1)

  return sites?.[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteData(slug)
  if (!site) return {}

  const business = site.businesses as Record<string, unknown>
  const businessName = business.name as string

  const title = `FAQ | ${businessName}`
  const description = `Frequently asked questions about ${businessName} — answers to common questions.`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  const pageUrl = `${baseUrl}/sites/${slug}/faq`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: businessName,
      type: 'website',
    },
  }
}

export default async function FAQPage({ params }: Props) {
  const { slug } = await params
  const [site, basePath] = await Promise.all([getSiteData(slug), getBasePath(slug)])

  if (!site) {
    notFound()
  }

  const faq = site.faq_content as FAQContent | null
  const isEditorial = (site.theme_config as { designSystem?: string } | null)?.designSystem === 'editorial'

  if (!faq) {
    notFound()
  }

  // Build FAQPage JSON-LD schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <>
    <main>
      <SiteFAQ
        h1={faq.h1}
        questions={faq.questions}
        basePath={basePath}
        isEditorial={isEditorial}
      />
    </main>

    {/* JSON-LD FAQPage schema */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
    </>
  )
}
