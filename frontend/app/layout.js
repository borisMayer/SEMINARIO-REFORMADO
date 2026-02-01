export const metadata = {
  title: 'Seminario Reformado - Administración',
  description: 'Sistema de gestión de recursos educativos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
