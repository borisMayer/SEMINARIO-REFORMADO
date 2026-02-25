'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export default function CursoDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/courses/${id}`).then((r) => r.json()),
      fetch(`/api/modules?courseId=${id}`).then((r) => r.json()),
    ])
      .then(async ([courseData, modulesData]) => {
        setCourse(courseData);
        if (!Array.isArray(modulesData)) {
          setModules([]);
          return;
        }
        // Fetch items for each module
        const withItems = await Promise.all(
          modulesData.map(async (mod) => {
            try {
              const items = await fetch(`/api/items?moduleId=${mod.id}`).then((r) => r.json());
              return { ...mod, items: Array.isArray(items) ? items : [] };
            } catch {
              return { ...mod, items: [] };
            }
          })
        );
        setModules(withItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
  };

  const typeIcon = (type) => {
    if (type === 'video') return '🎥';
    if (type === 'reading') return '📖';
    if (type === 'quiz') return '📝';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNav />
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course || course.error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNav />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500">
          <p className="text-lg font-medium">Curso no encontrado.</p>
          <Link href="/cursos" className="text-amber-600 hover:underline mt-4 inline-block text-sm">
            ← Volver a cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      {/* Course hero */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/cursos" className="text-slate-400 hover:text-amber-400 text-sm flex items-center gap-1 mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Todos los cursos
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-600/20 text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-600/30">
              {course.term}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.name}</h1>
          {course.description && (
            <p className="text-slate-300 max-w-2xl">{course.description}</p>
          )}
          {course.instructors?.length > 0 && (
            <p className="text-slate-400 text-sm mt-4">
              Instructor: {course.instructors.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Login gate */}
        {!session && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Iniciá sesión para ver el contenido</p>
              <p className="text-amber-700 text-sm mt-0.5">
                Necesitás una cuenta de Google para acceder a las clases y materiales.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {/* Modules */}
        {modules.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>Este curso aún no tiene módulos cargados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              Contenido del curso · {modules.length} módulo{modules.length !== 1 ? 's' : ''}
            </h2>
            {modules.map((mod, index) => (
              <div key={mod.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Module header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{mod.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {mod.items.length} clase{mod.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${openModules[mod.id] ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Module items */}
                {openModules[mod.id] && (
                  <div className="border-t border-slate-100">
                    {mod.items.length === 0 ? (
                      <p className="text-slate-400 text-sm px-6 py-4">No hay clases en este módulo.</p>
                    ) : (
                      mod.items.map((item) => (
                        <div key={item.id} className="px-6 py-4 border-b border-slate-50 last:border-0">
                          {session ? (
                            /* Logged in: show full content */
                            <div>
                              <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon(item.type)}</span>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{item.title}</p>
                                  {item.content_url && item.type === 'video' && (
                                    <div className="mt-3">
                                      {extractYouTubeId(item.content_url) ? (
                                        <div className="aspect-video max-w-xl rounded-lg overflow-hidden">
                                          <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${extractYouTubeId(item.content_url)}`}
                                            title={item.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : (
                                        <a
                                          href={item.content_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-amber-600 hover:underline text-sm"
                                        >
                                          Ver recurso →
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {item.content_url && item.type !== 'video' && (
                                    <a
                                      href={item.content_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-amber-600 hover:underline text-sm mt-1 inline-block"
                                    >
                                      Abrir recurso →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Locked: show title + lock */
                            <div className="flex items-center gap-3 opacity-60">
                              <span className="text-xl">{typeIcon(item.type)}</span>
                              <p className="text-slate-700 text-sm flex-1">{item.title}</p>
                              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Extra links */}
        {(course.zoom_link || course.youtube_playlist) && session && (
          <div className="mt-8 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Recursos del curso</h3>
            <div className="flex flex-wrap gap-3">
              {course.zoom_link && (
                <a
                  href={course.zoom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🎥 Clases en vivo (Zoom)
                </a>
              )}
              {course.youtube_playlist && (
                <a
                  href={course.youtube_playlist}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ▶ Playlist de YouTube
                </a>
              )}
            </div>
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
