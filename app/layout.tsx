import type { Metadata } from 'next'
import MeshBackground from '@/components/MeshBackground'
import { boldonse, interTight } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Switcheroo',
  description:
    'The football time machine. Get messaged when something worth watching is about to happen.',
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
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <MeshBackground />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  )
}
