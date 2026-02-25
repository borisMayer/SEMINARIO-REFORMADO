'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    area: 'Biblia',
    type: 'PDF',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      authors: formData.authors.split(',').map(a => a.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
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
        alert(editingId ? 'Recurso actualizado' : 'Recurso creado');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchResources();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.error || err.details || 'Error al guardar recurso');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error al guardar recurso');
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      title: resource.title,
      authors: Array.isArray(resource.authors) ? resource.authors.join(', ') : '',
      area: resource.area,
      type: resource.type,
      year: resource.year,
      file_url: resource.file_url || '',
      abstract: resource.abstract || '',
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este recurso?')) return;

    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchResources();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.error || 'Error al eliminar recurso');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error al eliminar recurso');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      authors: '',
      area: 'Biblia',
      type: 'PDF',
      year: new Date().getFullYear().toString(),
      file_url: '',
      abstract: '',
      tags: ''
    });
  };

  if (loading) {
    return <div className="p-8">Cargando recursos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Recursos</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Volver al panel
            </Link>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Recurso
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Recurso' : 'Nuevo Recurso'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autores (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={(e) => setFormData({...formData, authors: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Autor1, Autor2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Libro">Libro</option>
                    <option value="Artículo">Artículo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL del archivo</label>
                  <input
                    type="text"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="tag1, tag2"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{resource.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {Array.isArray(resource.authors) ? resource.authors[0] : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{resource.area}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{resource.type}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
