export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SEMINARIO REFORMADO
        </h1>
        <p className="text-gray-600 mb-8">
          Repositorio Académico - Sistema funcionando ✅
        </p>
        <div className="space-x-4">
          <a 
            href="/admin" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ir al Panel Admin
          </a>
          <a 
            href="/admin/resources" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Gestión de Recursos
          </a>
          <a 
            href="/api/health" 
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            API Health
          </a>
        </div>
      </div>
    </div>
  );
}
