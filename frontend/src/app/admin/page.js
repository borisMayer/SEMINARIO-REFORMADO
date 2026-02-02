'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Library, BarChart } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona el contenido del seminario</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recursos</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <BarChart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Biblioteca</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <Library className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/resources" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recursos</h3>
              <p className="text-gray-600">Gestionar libros, artículos y materiales educativos</p>
            </div>
          </Link>

          <Link href="/admin/courses" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <GraduationCap className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cursos / Aulas</h3>
              <p className="text-gray-600">Administrar cursos, módulos y contenido de clases</p>
            </div>
          </Link>

          <Link href="/admin/library" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Library className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Biblioteca</h3>
              <p className="text-gray-600">Gestionar colección de libros y recursos físicos</p>
            </div>
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Volver a la aplicación principal
          </Link>
        </div>
      </div>
    </div>
  );
}
