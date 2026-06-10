import type { Metadata, Viewport } from 'next'
import MeshBackground from '@/components/MeshBackground'
import AuthorCredit from '@/components/AuthorCredit'
import { boldonse, interTight } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Switcheroo — World Cup spoiler alerts',
  description:
    'Get alerted before the big moments hit your delayed stream. Spoiler-safe — no scores in alerts.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Switcheroo',
    description:
      'Get alerted before the big World Cup moments hit your screen — without spoilers.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#021408',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${boldonse.variable} h-full`}
    >
      <body className="relative min-h-full antialiased" suppressHydrationWarning>
        <MeshBackground />
        <AuthorCredit />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  )
}
