import { Fira_Sans, Fira_Code } from 'next/font/google'
import './globals.css'

const firaSans = Fira_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

const firaCode = Fira_Code({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'Web Monitor',
  description: 'Unified monitoring — agents, HTTP endpoints, and more',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
