'use client';

import { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';

const AREAS = ['Todas', 'Biblia', 'Pastoral', 'Historia', 'Ética'];

export default function BibliotecaPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('Todas');

  useEffect(() => {
    fetchBooks();
  }, [area]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (area !== 'Todas') params.set('area', area);
      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = books.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.abstract?.toLowerCase().includes(q) ||
      (Array.isArray(r.authors) && r.authors.some((a) => a.toLowerCase().includes(q)))
    );
  });

  const groupedByType = filtered.reduce((acc, r) => {
    const t = r.type || 'Otros';
    if (!acc[t]) acc[t] = [];
    acc[t].push(r);
    return acc;
  }, {});

  const typeOrder = ['Libro', 'PDF', 'Artículo', 'Video', 'Otros'];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      {/* Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Biblioteca</h1>
          <p className="text-slate-400">
            Colección de obras, libros y materiales de la tradición reformada
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    area === a
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg font-medium text-slate-500">No se encontraron materiales</p>
            <p className="text-sm mt-1">Probá con otros filtros o términos de búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {typeOrder
              .filter((t) => groupedByType[t]?.length > 0)
              .map((t) => (
                <section key={t}>
                  <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <span>
                      {t === 'Libro' ? '📚' : t === 'PDF' ? '📄' : t === 'Artículo' ? '📰' : t === 'Video' ? '🎥' : '📁'}
                    </span>
                    {t === 'Libro' ? 'Libros' : t === 'PDF' ? 'PDFs' : t === 'Artículo' ? 'Artículos' : t === 'Video' ? 'Videos' : 'Otros'}
                    <span className="text-slate-400 font-normal text-sm">({groupedByType[t].length})</span>
                  </h2>

                  <div className="space-y-3">
                    {groupedByType[t].map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all p-5 flex justify-between items-start gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {item.area && (
                              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                {item.area}
                              </span>
                            )}
                            {item.year && (
                              <span className="text-slate-400 text-xs">{item.year}</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          {Array.isArray(item.authors) && item.authors.length > 0 && (
                            <p className="text-sm text-slate-500 mt-0.5">
                              {item.authors.join(', ')}
                            </p>
                          )}
                          {item.abstract && (
                            <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                              {item.abstract}
                            </p>
                          )}
                          {Array.isArray(item.tags) && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="bg-slate-50 text-slate-500 text-xs px-2 py-0.5 rounded border border-slate-200">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Acceder
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Seminario Reformado</p>
        </div>
      </footer>
    </div>
  );
}
