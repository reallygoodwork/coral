import { HTMLElement, parse } from 'node-html-parser'
import type { CoralRootNode } from '../structures/coral'
import type { CoralResponsiveStyles } from '../structures/responsiveBreakpoint'
import type { CoralStyleType } from '../structures/styles'
import { parseHTMLNodeToSpec } from './parseHTMLNodeToSpec'
import {
  extractMediaQueriesFromCSS,
  mediaQueriesToResponsiveStyles,
} from './parseMediaQuery'

export const transformHTMLToSpec = (html: string): CoralRootNode => {
  // Strip leading/trailing whitespace and normalize internal whitespace
  const normalizedHtml = html
    .trim()
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s+/g, ' ') // Normalize whitespace
  const root = parse(normalizedHtml)

  if (!root) {
    throw new Error('Invalid HTML')
  } else if (root.childNodes.length === 0) {
    throw new Error('Empty HTML')
  }

  // Extract CSS from <style> tags
  const styleTags = root.querySelectorAll('style')
  const cssContent = styleTags.map((tag) => tag.textContent).join('\n')

  // Build a map of selector -> responsive styles from <style> tags
  const selectorToResponsiveStyles = new Map<string, CoralResponsiveStyles>()

  if (cssContent) {
    const mediaQueries = extractMediaQueriesFromCSS(cssContent)
    const responsiveStylesBySelector = new Map<
      string,
      Array<{ mediaQuery: string; styles: CoralStyleType }>
    >()

    // Group media queries by selector
    for (const mq of mediaQueries) {
      // Extract selector from mediaQuery string if it has one
      const selectorMatch = mq.mediaQuery.match(/\[(.*?)\]/)
      if (selectorMatch?.[1]) {
        const selector = selectorMatch[1].trim()
        const cleanMediaQuery = mq.mediaQuery.replace(/\[.*?\]/, '').trim()

        if (!responsiveStylesBySelector.has(selector)) {
          responsiveStylesBySelector.set(selector, [])
        }
        const existing = responsiveStylesBySelector.get(selector)
        if (existing) {
          existing.push({
            mediaQuery: cleanMediaQuery,
            styles: mq.styles,
          })
        }
      }
    }

    // Convert to ResponsiveStyle format
    for (const [selector, queries] of responsiveStylesBySelector) {
      const responsiveStyles = mediaQueriesToResponsiveStyles(queries)
      selectorToResponsiveStyles.set(selector, responsiveStyles)
    }
  }

  // Find the first non-style element child (skip text nodes, comments, style tags, etc.)
  const firstElementChild = root.childNodes.find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      child.rawTagName.toLowerCase() !== 'style',
  )

  if (!firstElementChild) {
    throw new Error('No valid HTML element found (excluding style tags)')
  }

  const spec = parseHTMLNodeToSpec(firstElementChild)

  // TODO: Apply responsive styles from style tags to matching elements
  // This would require matching selectors to elements, which is complex
  // For now, inline styles with media queries will work

  return spec
}
