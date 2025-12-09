import './globals.css'

export const metadata = {
  title: 'Plot Q&A Bot',
  description: 'Interactive Q&A chatbot for plot inquiries',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}