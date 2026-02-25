'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export default function CursosPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      {/* Page header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Cursos</h1>
          <p className="text-slate-400">
            Formación teológica estructurada en módulos y clases
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg font-medium text-slate-500">No hay cursos disponibles aún</p>
            <p className="text-sm mt-1">Volvé pronto para ver el contenido.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/cursos/${course.id}`}>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all h-full flex flex-col">
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl" />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {course.term}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-xl leading-snug mb-3">
                      {course.name}
                    </h2>
                    {course.description && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
                        {course.description}
                      </p>
                    )}
                    {course.instructors?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-slate-400 text-xs">
                          <span className="font-medium text-slate-600">Instructor:</span>{' '}
                          {course.instructors.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-6">
                    <span className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-semibold">
                      Ver curso
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Seminario Reformado</p>
        </div>
      </footer>
    </div>
  );
}
