import './globals.css'

export const metadata = {
  title: 'Web Monitor',
  description: 'Unified monitoring — agents, HTTP endpoints, and more',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
