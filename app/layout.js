import './globals.css'

export const metadata = {
  title: 'Bottle Refund Monitor',
  description: 'Real-time monitoring for bottle refund kiosks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
