// frontend/src/app/admin/library/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LibraryManagement() {
  const [libraryData, setLibraryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      // Esta ruta necesita ser implementada o ajustada según tu API
      const response = await fetch('/api/library/all');
      if (response.ok) {
        const data = await response.json();
        setLibraryData(data);
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Biblioteca</h1>
          <Link href="/admin" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Volver al panel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estadísticas de Uso</h2>
          
          {libraryData.length === 0 ? (
            <p className="text-gray-600">No hay datos de biblioteca disponibles</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Total Usuarios</p>
                <p className="text-3xl font-bold text-purple-900">
                  {new Set(libraryData.map(item => item.user_id)).size}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Recursos en Bibliotecas</p>
                <p className="text-3xl font-bold text-blue-900">{libraryData.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Libros Completados</p>
                <p className="text-3xl font-bold text-green-900">
                  {libraryData.filter(item => item.status === 'completed').length}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
            {libraryData.length === 0 ? (
              <p className="text-gray-500">No hay actividad reciente</p>
            ) : (
              <div className="space-y-2">
                {libraryData.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Usuario: {item.user_id}</p>
                      <p className="text-sm text-gray-600">Recurso ID: {item.resource_id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
