import starlight from '@astrojs/starlight'
// import starlightThemeBlack from 'starlight-theme-black'
// import starlightThemeNext from 'starlight-theme-next'
import pagePlugin from '@pelagornis/page'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://docs.coralui.com',
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      title: 'Coral Libraries',
      social: {
        github: 'https://github.com/reallygoodwork/coral',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', slug: 'guides/getting-started' },
            { label: 'Releasing Packages', slug: 'guides/releasing' },
          ],
        },
        {
          label: 'Packages',
          autogenerate: { directory: 'packages' },
        },
      ],
      // plugins: [starlightThemeNext()],
      // Temporarily disabled due to version incompatibility with @astrojs/starlight
      // plugins: [starlightThemeBlack({
      //   navLinks: [{ // optional
      //     label: 'Docs',
      //     link: '/getting-started',
      //   }],
      //   footerText: //optional
      //     'Built & designed by [shadcn](https://twitter.com/shadcn). Ported to Astro Starlight by [Adrián UB](https://github.com/adrian-ub). The source code is available on [GitHub](https://github.com/adrian-ub/starlight-theme-black).'
      // })],
    }),
  ],
})
