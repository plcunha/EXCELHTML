import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Excel Viewer | Visualizador de Planilhas Moderno',
  description: 'Transforme seus arquivos Excel em interfaces modernas e interativas. Upload, visualize, filtre e exporte seus dados com facilidade.',
  keywords: ['excel', 'viewer', 'planilha', 'dashboard', 'dados', 'tabela', 'csv', 'xlsx'],
  authors: [{ name: 'Excel Viewer Team' }],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 antialiased font-sans">
        {/* Skip Links para acessibilidade */}
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only
            focus:fixed focus:top-4 focus:left-4 focus:z-[100]
            focus:px-4 focus:py-2 focus:rounded-lg
            focus:bg-primary-600 focus:text-white
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
            font-medium text-sm
          "
        >
          Pular para o conteúdo principal
        </a>
        <a
          href="#main-nav"
          className="
            sr-only focus:not-sr-only
            focus:fixed focus:top-4 focus:left-64 focus:z-[100]
            focus:px-4 focus:py-2 focus:rounded-lg
            focus:bg-primary-600 focus:text-white
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
            font-medium text-sm
          "
        >
          Pular para a navegação
        </a>
        {children}
      </body>
    </html>
  )
}
