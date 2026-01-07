import * as Base from 'fumadocs-ui/components/codeblock';
import { getHighlighter, hastToJsx } from 'fumadocs-core/highlight';
import { cn } from '@/lib/cn';
import type { BundledLanguage } from 'shiki';

export interface CodeBlockProps {
  code: string;
  wrapper?: Base.CodeBlockProps;
  lang: string;
}

let highlighterInstance: Awaited<ReturnType<typeof getHighlighter>> | null = null;
let highlighterPromise: ReturnType<typeof getHighlighter> | null = null;

async function getHighlighterInstance() {
  if (!highlighterInstance) {
    if (!highlighterPromise) {
      highlighterPromise = getHighlighter('js', {
        langs: ['js', 'ts', 'jsx', 'tsx'],
        themes: ['vesper', 'github-light'],
      });
    }
    highlighterInstance = await highlighterPromise;
  }
  return highlighterInstance;
}

export async function CodeBlock({ code, lang, wrapper }: CodeBlockProps) {
  const highlighter = await getHighlighterInstance();
  if (!highlighter) {
    throw new Error('Failed to initialize highlighter');
  }
  await highlighter.loadLanguage(lang as any);
  const hast = highlighter.codeToHast(code, {
    lang,
    defaultColor: false,
    themes: {
      light: 'github-light',
      dark: 'vesper',
    },
  });

  const rendered = hastToJsx(hast, {
    components: {
      pre: Base.Pre,
    },
  });

  return (
    <Base.CodeBlock {...wrapper} className={cn('my-0', wrapper?.className)}>
      {rendered}
    </Base.CodeBlock>
  );
}