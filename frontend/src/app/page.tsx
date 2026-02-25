'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import PublicNav from '@/components/PublicNav';

interface Course {
  id: number;
  name: string;
  term: string;
  instructors: string[];
  description: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-block bg-amber-600/20 text-amber-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6 border border-amber-600/30">
              Formación teológica reformada
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Seminario
              <br />
              <span className="text-amber-400">Reformado</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              Cursos, recursos y biblioteca para una formación teológica sólida,
              arraigada en las confesiones históricas de la fe reformada.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/cursos"
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Explorar cursos
              </Link>
              {!session && (
                <Link
                  href="/login"
                  className="border border-slate-500 hover:border-amber-500 hover:text-amber-400 text-slate-300 font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="bg-amber-100 text-amber-700 p-3 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Cursos estructurados</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Módulos y clases organizadas para un aprendizaje progresivo de la teología reformada.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-amber-100 text-amber-700 p-3 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Recursos y artículos</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Biblioteca de textos, artículos y materiales seleccionados por los instructores.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-amber-100 text-amber-700 p-3 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Biblioteca digital</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Accedé a obras clásicas y contemporáneas de la tradición reformada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Cursos disponibles</h2>
              <p className="text-slate-500 text-sm mt-1">Iniciá tu formación teológica hoy</p>
            </div>
            <Link
              href="/cursos"
              className="text-amber-600 hover:text-amber-700 text-sm font-semibold flex items-center gap-1"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p>Los cursos estarán disponibles pronto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/cursos/${course.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all p-6 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {course.term}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                        {course.description}
                      </p>
                    )}
                    {course.instructors?.length > 0 && (
                      <p className="text-slate-400 text-xs">
                        {course.instructors.join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!session && (
        <section className="bg-slate-900 text-white py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Accedé al contenido completo
            </h2>
            <p className="text-slate-300 mb-8">
              Iniciá sesión con tu cuenta de Google para ver los cursos, recursos y biblioteca.
            </p>
            <Link
              href="/login"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
            >
              Iniciar sesión con Google
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© {new Date().getFullYear()} Seminario Reformado. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
