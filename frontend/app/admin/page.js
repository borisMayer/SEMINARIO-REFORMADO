'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Library, BarChart } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona recursos, cursos y contenido de la plataforma</p>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Gestionar Recursos */}
          <Link 
            href="/admin/resources"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold ml-3">Recursos</h2>
            </div>
            <p className="text-gray-600">Agregar, editar y eliminar recursos educativos (PDFs, videos, artículos)</p>
          </Link>

          {/* Gestionar Cursos/Aulas */}
          <Link 
            href="/admin/courses"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold ml-3">Cursos/Aulas</h2>
            </div>
            <p className="text-gray-600">Crear y gestionar aulas virtuales, cursos y clases</p>
          </Link>

          {/* Biblioteca */}
          <Link 
            href="/admin/library"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Library className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold ml-3">Biblioteca</h2>
            </div>
            <p className="text-gray-600">Administrar colecciones y contenido de la biblioteca</p>
          </Link>

          {/* Estadísticas */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold ml-3">Estadísticas</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Recursos:</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cursos:</span>
                <span className="font-semibold">-</span>
              </div>
            </div>
          </div>

        </div>

        {/* Botón volver a la app */}
        <div className="mt-8">
          <Link 
            href="/"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
          >
            ← Volver a la aplicación
          </Link>
        </div>
      </div>
    </div>
  );
}
