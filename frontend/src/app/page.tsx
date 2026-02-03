export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          ✅ SEMINARIO REFORMADO
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema Funcionando Correctamente
        </p>
        <div className="space-x-4">
          <a 
            href="/admin" 
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            📊 Panel Admin
          </a>
          <a 
            href="/admin/resources" 
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            📚 Recursos
          </a>
          <a 
            href="/api/health" 
            className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            🏥 Health Check
          </a>
        </div>
      </div>
    </div>
  );
}
