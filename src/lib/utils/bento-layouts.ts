/**
 * Bento Grid Layout Utility
 *
 * Generates asymmetric 12-column grid span assignments for
 * editorial bento layouts. The featured item (if any) always
 * gets the larger span.
 */

export interface BentoItem {
  colSpan: number   // Column span (out of 12)
  isFeatured: boolean
}

/**
 * Assign column spans for a bento grid based on item count.
 * The featured item (by index) gets a larger span.
 *
 * @param count - Total number of items
 * @param featuredIndex - Index of the featured item (0-based), or -1 for none
 * @returns Array of BentoItem with column span assignments
 */
export function getBentoLayout(count: number, featuredIndex: number = 0): BentoItem[] {
  if (count <= 0) return []

  // Single item — full width
  if (count === 1) {
    return [{ colSpan: 12, isFeatured: true }]
  }

  // Two items — 7/5
  if (count === 2) {
    const items: BentoItem[] = [
      { colSpan: 5, isFeatured: false },
      { colSpan: 5, isFeatured: false },
    ]
    const fi = Math.max(0, Math.min(featuredIndex, 1))
    items[fi] = { colSpan: 7, isFeatured: true }
    items[fi === 0 ? 1 : 0] = { colSpan: 5, isFeatured: false }
    return items
  }

  // Three items — 7/5, 12 (featured gets 7, last is full width)
  if (count === 3) {
    // Pattern: [7, 5, 12] with featured in the 7 slot
    const items: BentoItem[] = Array.from({ length: 3 }, () => ({
      colSpan: 5,
      isFeatured: false,
    }))
    const fi = Math.max(0, Math.min(featuredIndex, 2))
    if (fi <= 1) {
      // Featured is in first row
      items[0] = { colSpan: fi === 0 ? 7 : 5, isFeatured: fi === 0 }
      items[1] = { colSpan: fi === 1 ? 7 : 5, isFeatured: fi === 1 }
      items[2] = { colSpan: 12, isFeatured: false }
    } else {
      // Featured is the full-width item
      items[0] = { colSpan: 7, isFeatured: false }
      items[1] = { colSpan: 5, isFeatured: false }
      items[2] = { colSpan: 12, isFeatured: true }
    }
    return items
  }

  // Four items — 7/5, 5/7 (alternating asymmetry)
  if (count === 4) {
    const pattern = [7, 5, 5, 7]
    const fi = Math.max(0, Math.min(featuredIndex, 3))
    // Ensure featured item gets a 7
    if (pattern[fi] === 5) {
      // Swap with neighbor
      const swapWith = fi % 2 === 0 ? fi + 1 : fi - 1
      pattern[fi] = 7
      pattern[swapWith] = 5
    }
    return pattern.map((span, i) => ({
      colSpan: span,
      isFeatured: i === fi,
    }))
  }

  // Five items — 7/5, 5/7, 12
  if (count === 5) {
    const spans = [7, 5, 5, 7, 12]
    const fi = Math.max(0, Math.min(featuredIndex, 4))
    return spans.map((span, i) => ({
      colSpan: span,
      isFeatured: i === fi,
    }))
  }

  // Six items — 7/5, 5/7, 7/5
  if (count === 6) {
    const spans = [7, 5, 5, 7, 7, 5]
    const fi = Math.max(0, Math.min(featuredIndex, 5))
    return spans.map((span, i) => ({
      colSpan: span,
      isFeatured: i === fi,
    }))
  }

  // 7+ items — repeat 7/5, 5/7 pattern
  const items: BentoItem[] = []
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 2)
    const isLeft = i % 2 === 0
    const span = row % 2 === 0
      ? (isLeft ? 7 : 5)
      : (isLeft ? 5 : 7)
    items.push({ colSpan: span, isFeatured: false })
  }
  // Handle odd count — last item full width
  if (count % 2 === 1) {
    items[items.length - 1].colSpan = 12
  }
  const fi = Math.max(0, Math.min(featuredIndex, count - 1))
  items[fi].isFeatured = true
  return items
}
