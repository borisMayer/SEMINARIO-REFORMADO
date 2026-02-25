'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Library } from 'lucide-react';

export default function AdminLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('Todos');
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    area: 'Biblia',
    type: 'Libro',
    year: new Date().getFullYear().toString(),
    file_url: '',
    abstract: '',
    tags: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      authors: '',
      area: 'Biblia',
      type: 'Libro',
      year: new Date().getFullYear().toString(),
      file_url: '',
      abstract: '',
      tags: ''
    });
  };

  const handleEdit = (resource) => {
    setFormData({
      title: resource.title,
      authors: Array.isArray(resource.authors) ? resource.authors.join(', ') : '',
      area: resource.area,
      type: resource.type,
      year: resource.year || '',
      file_url: resource.file_url || '',
      abstract: resource.abstract || '',
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      authors: formData.authors.split(',').map((a) => a.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
    };

    try {
      const url = editingId ? `/api/resources/${editingId}` : '/api/resources';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingId ? 'Material actualizado' : 'Material agregado');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchResources();
      } else {
        const err = await response.json();
        alert(err.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este material de la biblioteca?')) return;
    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchResources();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const types = ['Todos', 'Libro', 'PDF', 'Artículo', 'Video'];
  const filtered = filterType === 'Todos' ? resources : resources.filter((r) => r.type === filterType);

  // Stats
  const stats = {
    total: resources.length,
    books: resources.filter((r) => r.type === 'Libro').length,
    pdfs: resources.filter((r) => r.type === 'PDF').length,
    articles: resources.filter((r) => r.type === 'Artículo').length,
  };

  if (loading) return <div className="p-8">Cargando biblioteca...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Biblioteca</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Volver al panel
            </Link>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar material
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Libros</p>
            <p className="text-2xl font-bold text-purple-600">{stats.books}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">PDFs</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pdfs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Artículos</p>
            <p className="text-2xl font-bold text-green-600">{stats.articles}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar material' : 'Nuevo material'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ej: Institución de la Religión Cristiana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autores (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Juan Calvino"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="1559"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Biblia">Biblia</option>
                    <option value="Pastoral">Pastoral</option>
                    <option value="Historia">Historia</option>
                    <option value="Ética">Ética</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Libro">Libro</option>
                    <option value="PDF">PDF</option>
                    <option value="Artículo">Artículo</option>
                    <option value="Video">Video</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL del archivo / enlace</label>
                  <input
                    type="text"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Resumen</label>
                  <textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Reforma, Calvino, Soteriología"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                  {editingId ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {t} {t !== 'Todos' && `(${resources.filter(r => r.type === t).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Library className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay materiales en esta categoría.</p>
            <p className="text-gray-400 text-sm mt-1">Hacé click en "Agregar material" para comenzar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autores</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {resource.file_url ? (
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          {resource.title}
                        </a>
                      ) : (
                        resource.title
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Array.isArray(resource.authors) ? resource.authors.join(', ') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{resource.area}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        resource.type === 'Libro' ? 'bg-purple-100 text-purple-700' :
                        resource.type === 'PDF' ? 'bg-blue-100 text-blue-700' :
                        resource.type === 'Artículo' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{resource.year || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(resource)} className="text-blue-600 hover:text-blue-800">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(resource.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
