import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Lazorkit Solana UX Examples',
  description: 'Comprehensive documentation for building passkey-powered, gasless Solana applications',
  
  // Build output directory - output to Next.js public folder
  outDir: '../public/docs',
  
  // Base URL for serving from /docs route
  base: '/docs/',
  
  // Allow both light and dark mode (user can toggle)
  appearance: true,
  
  // Ignore dead links (some links are for dev/localhost)
  ignoreDeadLinks: true,
  
  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: 'Home', link: '/' }, // Link to Next.js home (outside docs)
      { text: 'Getting Started', link: '/getting-started' }, // Relative to base (/docs/)
      { text: 'Tutorials', link: '/tutorials/passkey-wallet' }, // Relative to base (/docs/)
      { text: 'Live Demo', link: '/', target: '_self' }, // Link to Next.js app
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Smart Wallet Guide', link: '/smart-wallet-guide' },
          ],
        },
        {
          text: 'Tutorials',
          items: [
            { text: 'Passkey Authentication', link: '/tutorials/passkey-wallet' },
            { text: 'Gasless Transactions', link: '/tutorials/gasless-tx' },
            { text: 'Token Swaps', link: '/tutorials/token-swap' },
            { text: 'Subscription Service', link: '/tutorials/subscription' },
          ],
        },
        {
          text: 'Resources',
          items: [
            { text: 'Lazorkit Docs', link: 'https://docs.lazorkit.com/', target: '_blank' },
            { text: 'GitHub', link: 'https://github.com/lazor-kit/lazor-kit', target: '_blank' },
            { text: 'Telegram', link: 'https://t.me/lazorkit', target: '_blank' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/lazorkit-solanaux' },
    ],

    footer: {
      message: 'Built for the Lazorkit SDK Bounty by Superteam Vietnam',
      copyright: 'Copyright © 2024',
    },

    search: {
      provider: 'local',
    },
  },
});

