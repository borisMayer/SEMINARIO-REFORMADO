'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    area: 'Biblia',
    type: 'PDF',
    year: new Date().getFullYear().toString(),
    abstract: '',
    tags: [],
    file_url: ''
  });

  // Cargar recursos
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingResource 
        ? `/api/resources/${editingResource.id}`
        : '/api/resources';
      
      const method = editingResource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          authors: formData.authors.length > 0 ? formData.authors : [formData.authorInput || 'Anónimo'],
          tags: formData.tags.length > 0 ? formData.tags : formData.tagsInput ? formData.tagsInput.split(',').map(t => t.trim()) : []
        })
      });

      if (response.ok) {
        alert(editingResource ? 'Recurso actualizado' : 'Recurso creado exitosamente');
        setShowForm(false);
        setEditingResource(null);
        resetForm();
        fetchResources();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el recurso');
    }
  };

  // Eliminar recurso
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este recurso?')) return;

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Recurso eliminado');
        fetchResources();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el recurso');
    }
  };

  // Editar recurso
  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      authors: resource.authors || [],
      area: resource.area,
      type: resource.type,
      year: resource.year,
      abstract: resource.abstract || '',
      tags: resource.tags || [],
      file_url: resource.file_url || '',
      authorInput: resource.authors?.[0] || '',
      tagsInput: resource.tags?.join(', ') || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      authors: [],
      area: 'Biblia',
      type: 'PDF',
      year: new Date().getFullYear().toString(),
      abstract: '',
      tags: [],
      file_url: '',
      authorInput: '',
      tagsInput: ''
    });
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al Panel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Recursos</h1>
            <p className="text-gray-600 mt-1">Total: {resources.length} recursos</p>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingResource(null);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Recurso
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Ej: Introducción a la Soteriología"
                  />
                </div>

                {/* Autor */}
                <div>
                  <label className="block text-sm font-medium mb-1">Autor</label>
                  <input
                    type="text"
                    value={formData.authorInput}
                    onChange={(e) => setFormData({...formData, authorInput: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Dr. Juan Pérez"
                  />
                </div>

                {/* Año */}
                <div>
                  <label className="block text-sm font-medium mb-1">Año</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="2024"
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium mb-1">Área *</label>
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="Biblia">Biblia</option>
                    <option value="Pastoral">Pastoral</option>
                    <option value="Historia">Historia</option>
                    <option value="Ética">Ética</option>
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Libro">Libro</option>
                    <option value="Artículo">Artículo</option>
                  </select>
                </div>

                {/* URL del archivo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">URL del archivo (PDF, YouTube, etc.)</label>
                  <input
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="https://ejemplo.com/archivo.pdf o https://youtube.com/watch?v=..."
                  />
                </div>

                {/* Resumen/Abstract */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Resumen</label>
                  <textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows="3"
                    placeholder="Descripción breve del recurso..."
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({...formData, tagsInput: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="teología, doctrina, salvación"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  {editingResource ? 'Actualizar' : 'Crear'} Recurso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingResource(null);
                    resetForm();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de recursos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
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
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{resource.title}</div>
                    <div className="text-sm text-gray-500">{resource.year}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {resource.authors?.[0] || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{resource.area}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{resource.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
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
