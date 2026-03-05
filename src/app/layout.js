export const metadata = {
  title: '心理咨询室',
  description: '婚姻咨询',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
