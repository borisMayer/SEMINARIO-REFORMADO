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
```

5. Commit: "Add layout.js to fix build"

---

## 📸 Comparte

Por favor, ve a esta URL y comparte un screenshot:
```
https://github.com/borisMayer/SEMINARIO-REFORMADO/tree/main/frontend/app
