import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import type * as PageTree from 'fumadocs-core/page-tree';
import { icons } from 'lucide-react';
import { createElement } from 'react';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  icon(icon) {
    if (!icon) {
      // You may set a default icon
      return;
    }
    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});

/**
 * Transform page tree to add separator headings and flatten folders under matching separators
 */
export function transformPageTreeWithHeadings(tree: PageTree.Root): PageTree.Root {
  const transformedChildren: PageTree.Node[] = [];

  // Helper to check if a folder matches guides/packages
  const isGuidesFolder = (child: PageTree.Node): child is PageTree.Folder => {
    if (child.type !== 'folder') return false;
    const folder = child as PageTree.Folder;
    const name = typeof folder.name === 'string' ? folder.name.toLowerCase() : '';
    const url = folder.index?.url;
    return name === 'guides' || url === '/guides' || (typeof url === 'string' && url.startsWith('/guides'));
  };

  const isPackagesFolder = (child: PageTree.Node): child is PageTree.Folder => {
    if (child.type !== 'folder') return false;
    const folder = child as PageTree.Folder;
    const name = typeof folder.name === 'string' ? folder.name.toLowerCase() : '';
    const url = folder.index?.url;
    return name === 'packages' || url === '/packages' || (typeof url === 'string' && url.startsWith('/packages'));
  };

  // Find guides and packages folders
  const guidesFolder = tree.children.find(isGuidesFolder) as PageTree.Folder | undefined;
  const packagesFolder = tree.children.find(isPackagesFolder) as PageTree.Folder | undefined;

  // Add other items first (before guides) - preserve order
  const otherItems = tree.children.filter(
    (child) => !isGuidesFolder(child) && !isPackagesFolder(child)
  );
  transformedChildren.push(...otherItems);

  // Add Guides section with heading - flatten folder children directly under separator
  if (guidesFolder) {
    transformedChildren.push({
      type: 'separator',
      name: 'Guides',
      $id: 'separator-guides',
    } as PageTree.Separator);
    // Add folder children directly instead of the folder itself
    transformedChildren.push(...guidesFolder.children);
  }

  // Add Packages section with heading - flatten folder children directly under separator
  if (packagesFolder) {
    transformedChildren.push({
      type: 'separator',
      name: 'Packages',
      $id: 'separator-packages',
    } as PageTree.Separator);
    // Add folder children directly instead of the folder itself
    transformedChildren.push(...packagesFolder.children);
  }

  return {
    ...tree,
    children: transformedChildren,
  };
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}

export type Page = InferPageType<typeof source>;
