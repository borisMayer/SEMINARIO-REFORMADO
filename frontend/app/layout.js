export const metadata = {
  title: 'Seminario Reformado',
  description: 'Sistema de gestion de recursos educativos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
