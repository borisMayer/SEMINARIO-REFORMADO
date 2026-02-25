'use client';

import { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';

const TYPE_ICONS = {
  PDF: '📄',
  Video: '🎥',
  Libro: '📚',
  'Artículo': '📰',
};

const AREAS = ['Todas', 'Biblia', 'Pastoral', 'Historia', 'Ética'];
const TYPES = ['Todos', 'PDF', 'Video', 'Libro', 'Artículo'];

export default function RecursosPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('Todas');
  const [type, setType] = useState('Todos');

  useEffect(() => {
    fetchResources();
  }, [area, type]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (area !== 'Todas') params.set('area', area);
      if (type !== 'Todos') params.set('type', type);
      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.abstract?.toLowerCase().includes(q) ||
      (Array.isArray(r.authors) && r.authors.some((a) => a.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      {/* Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Recursos</h1>
          <p className="text-slate-400">
            Artículos, PDFs, videos y libros seleccionados para tu formación teológica
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por título, autor o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Area filter */}
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>{a === 'Todas' ? 'Todas las áreas' : a}</option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t === 'Todos' ? 'Todos los tipos' : t}</option>
              ))}
            </select>

            {(search || area !== 'Todas' || type !== 'Todos') && (
              <button
                onClick={() => { setSearch(''); setArea('Todas'); setType('Todos'); }}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Limpiar filtros
              </button>
            )}
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
            <p className="text-lg font-medium text-slate-500">No se encontraron recursos</p>
            <p className="text-sm mt-1">Probá con otros filtros o términos de búsqueda.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{filtered.length} recurso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col"
                >
                  <div className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{TYPE_ICONS[resource.type] || '📄'}</span>
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {resource.type}
                      </span>
                      {resource.area && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {resource.area}
                        </span>
                      )}
                    </div>

                    <h2 className="font-bold text-slate-900 text-base leading-snug mb-2">
                      {resource.title}
                    </h2>

                    {Array.isArray(resource.authors) && resource.authors.length > 0 && (
                      <p className="text-sm text-slate-500 mb-2">
                        {resource.authors.join(', ')}
                        {resource.year && <span className="ml-1 text-slate-400">({resource.year})</span>}
                      </p>
                    )}

                    {resource.abstract && (
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
                        {resource.abstract}
                      </p>
                    )}

                    {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-slate-50 text-slate-500 text-xs px-2 py-0.5 rounded border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-semibold"
                      >
                        Acceder al recurso
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
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
