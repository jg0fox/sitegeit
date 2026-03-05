'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SiteNavProps {
  businessName: string
  phone: string | null
  phoneTel: string | null
  services: { name: string; slug: string }[]
  siteSlug: string
  navLabels?: { services?: string; faq?: string }
}

export function SiteNav({
  businessName,
  phone,
  phoneTel,
  services,
  siteSlug,
  navLabels,
}: SiteNavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const basePath = `/sites/${siteSlug}`

  // Derive current page from pathname
  let currentPage = 'home'
  if (pathname === `${basePath}/about`) currentPage = 'about'
  else if (pathname === `${basePath}/contact`) currentPage = 'contact'
  else if (pathname === `${basePath}/faq`) currentPage = 'faq'
  else if (pathname !== basePath) {
    const segment = pathname.replace(`${basePath}/`, '')
    if (services.some(s => s.slug === segment)) currentPage = segment
  }

  const servicesLabel = navLabels?.services || 'Services'
  const faqLabel = navLabels?.faq || 'FAQ'

  const navLinks = [
    { label: 'Home', href: basePath, key: 'home' },
    { label: 'About', href: `${basePath}/about`, key: 'about' },
    { label: 'Contact', href: `${basePath}/contact`, key: 'contact' },
    { label: faqLabel, href: `${basePath}/faq`, key: 'faq' },
  ]

  // Close services dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setServicesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        setServicesDropdownOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const isActive = (key: string) => currentPage === key

  const isServiceActive = services.some((s) => s.slug === currentPage)

  const navLinkStyle = (key: string) => ({
    color: isActive(key)
      ? 'var(--color-link, var(--color-primary))'
      : 'var(--color-text-primary)',
    fontWeight: isActive(key) ? 600 : 400,
  })

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setServicesDropdownOpen(true)
  }

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false)
    }, 150)
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="mx-auto flex items-center justify-between px-4 py-3"
        style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
      >
        {/* Mobile: Hamburger button */}
        <button
          className="flex items-center justify-center rounded p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Business name / logo */}
        <Link
          href={basePath}
          className="text-lg font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)' as unknown as number,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
          }}
        >
          {businessName}
        </Link>

        {/* Desktop: Center nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Home */}
          <Link
            href={navLinks[0].href}
            className="text-sm transition-colors duration-200 hover:opacity-80"
            style={navLinkStyle('home')}
          >
            Home
          </Link>

          {/* Services dropdown */}
          {services.length > 0 && (
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                className="flex items-center gap-1 text-sm transition-colors duration-200 hover:opacity-80"
                style={{
                  color: isServiceActive
                    ? 'var(--color-link, var(--color-primary))'
                    : 'var(--color-text-primary)',
                  fontWeight: isServiceActive ? 600 : 400,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                }}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                aria-expanded={servicesDropdownOpen}
                aria-haspopup="true"
              >
                {servicesLabel}
                <span
                  className="material-symbols-outlined transition-transform duration-200"
                  style={{
                    fontSize: '18px',
                    transform: servicesDropdownOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                  }}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown menu */}
              {servicesDropdownOpen && (
                <div
                  className="absolute left-1/2 top-full mt-2 min-w-[200px] -translate-x-1/2 rounded-lg border py-2 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  role="menu"
                >
                  {services.map((service) => (
                    <Link
                      key={service.slug}
                      href={`${basePath}/${service.slug}`}
                      className="block px-4 py-2.5 text-sm transition-colors duration-150"
                      style={{
                        color: isActive(service.slug)
                          ? 'var(--color-link, var(--color-primary))'
                          : 'var(--color-text-primary)',
                        fontWeight: isActive(service.slug) ? 600 : 400,
                      }}
                      role="menuitem"
                      onClick={() => setServicesDropdownOpen(false)}
                      onMouseEnter={(e) => {
                        if (!isActive(service.slug)) {
                          e.currentTarget.style.color = 'var(--color-link, var(--color-primary))'
                          e.currentTarget.style.backgroundColor =
                            'var(--color-primary-light, rgba(62, 99, 221, 0.06))'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(service.slug)) {
                          e.currentTarget.style.color =
                            'var(--color-text-primary)'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About, Contact, FAQ */}
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-sm transition-colors duration-200 hover:opacity-80"
              style={navLinkStyle(link.key)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Phone CTA button */}
        {phone && phoneTel ? (
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px' }}
            >
              phone
            </span>
            <span className="hidden sm:inline">{phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : (
          // Spacer to keep layout balanced when no phone
          <div className="w-[44px] md:hidden" />
        )}
      </div>

      {/* Mobile: Slide-down menu */}
      <div
        id="mobile-nav-menu"
        className="overflow-hidden transition-all duration-300 ease-in-out md:hidden"
        style={{
          maxHeight: mobileMenuOpen ? '100vh' : '0',
          opacity: mobileMenuOpen ? 1 : 0,
          backgroundColor: 'var(--color-surface)',
          borderTop: mobileMenuOpen ? '1px solid var(--color-border)' : 'none',
        }}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="px-4 py-3">
          {/* Home */}
          <Link
            href={navLinks[0].href}
            className="block py-3 text-base transition-colors duration-200"
            style={navLinkStyle('home')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {/* Services — listed individually */}
          {services.length > 0 && (
            <div>
              <span
                className="block py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary, #64748b)' }}
              >
                {servicesLabel}
              </span>
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`${basePath}/${service.slug}`}
                  className="block py-2.5 pl-3 text-base transition-colors duration-200"
                  style={{
                    color: isActive(service.slug)
                      ? 'var(--color-link, var(--color-primary))'
                      : 'var(--color-text-primary)',
                    fontWeight: isActive(service.slug) ? 600 : 400,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {service.name}
                </Link>
              ))}
            </div>
          )}

          {/* Divider */}
          <div
            className="my-2"
            style={{
              borderBottom: '1px solid var(--color-border)',
            }}
          />

          {/* About, Contact, FAQ */}
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="block py-3 text-base transition-colors duration-200"
              style={navLinkStyle(link.key)}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: Overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[-1] bg-black/30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  )
}
