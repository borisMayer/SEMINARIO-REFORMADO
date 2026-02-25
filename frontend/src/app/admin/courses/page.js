'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, BookOpen } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    term: '',
    instructors: '',
    description: '',
    zoom_link: '',
    youtube_playlist: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', term: '', instructors: '', description: '', zoom_link: '', youtube_playlist: '' });
  };

  const handleEdit = (course) => {
    setFormData({
      name: course.name || '',
      term: course.term || '',
      instructors: Array.isArray(course.instructors) ? course.instructors.join(', ') : '',
      description: course.description || '',
      zoom_link: course.zoom_link || '',
      youtube_playlist: course.youtube_playlist || ''
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      instructors: formData.instructors.split(',').map(i => i.trim()).filter(Boolean)
    };

    try {
      const url = editingId ? `/api/courses/${editingId}` : '/api/courses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingId ? 'Curso actualizado' : 'Curso creado');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchCourses();
      } else {
        const err = await response.json();
        alert(err.error || 'Error al guardar curso');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error al guardar curso');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este curso y todos sus módulos?')) return;
    try {
      const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchCourses();
      } else {
        alert('Error al eliminar curso');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error al eliminar curso');
    }
  };

  if (loading) return <div className="p-8">Cargando cursos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Volver al panel
            </Link>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Curso' : 'Nuevo Curso'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ej: Teología Sistemática I"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Término / Semestre *</label>
                  <input
                    type="text"
                    required
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ej: 2025-I"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructores (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.instructors}
                    onChange={(e) => setFormData({ ...formData, instructors: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Pastor Juan, Pastor Pedro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Zoom</label>
                  <input
                    type="text"
                    value={formData.zoom_link}
                    onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Playlist de YouTube</label>
                  <input
                    type="text"
                    value={formData.youtube_playlist}
                    onChange={(e) => setFormData({ ...formData, youtube_playlist: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://www.youtube.com/playlist?list=..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
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
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay cursos todavía.</p>
            <p className="text-gray-400 text-sm mt-1">Hacé click en "Nuevo Curso" para agregar el primero.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Término</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructores</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <Link href={`/admin/courses/${course.id}`} className="text-blue-600 hover:underline">
                        {course.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.term}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Array.isArray(course.instructors) ? course.instructors.join(', ') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          Ver módulos
                        </Link>
                        <button onClick={() => handleEdit(course)} className="text-blue-600 hover:text-blue-800">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-800">
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
