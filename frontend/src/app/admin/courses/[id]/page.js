// frontend/src/app/admin/courses/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

const ITEM_TYPE_ICONS = {
  Video: '🎥',
  Lectura: '📖',
  Lección: '📄',
  Quiz: '📝',
};

function extractYouTubeId(url) {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function CourseModulesPage({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [saving, setSaving] = useState(false);

  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    order_index: 1,
  });

  const [itemFormData, setItemFormData] = useState({
    title: '',
    type: 'Video',
    content_url: '',
    order_index: 1,
  });

  useEffect(() => {
    fetchCourse();
    fetchModules();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/modules?courseId=${courseId}`);
      const modulesData = await response.json();

      const modulesWithItems = await Promise.all(
        modulesData.map(async (module) => {
          const itemsResponse = await fetch(`/api/items?moduleId=${module.id}`);
          const items = await itemsResponse.json();
          return { ...module, items: Array.isArray(items) ? items : [] };
        })
      );

      setModules(modulesWithItems);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: moduleFormData.title,
          order_index: moduleFormData.order_index,
          course_id: parseInt(courseId),
        }),
      });

      if (response.ok) {
        setShowModuleForm(false);
        setModuleFormData({ title: '', order_index: 1 });
        fetchModules();
      } else {
        const err = await response.json();
        alert(err.error || 'Error al crear el módulo');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error al crear el módulo');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: parseInt(selectedModuleId),
          title: itemFormData.title,
          type: itemFormData.type,
          content_url: itemFormData.content_url || null,
          order_index: itemFormData.order_index,
        }),
      });

      if (response.ok) {
        setShowItemForm(false);
        setItemFormData({ title: '', type: 'Video', content_url: '', order_index: 1 });
        setSelectedModuleId(null);
        fetchModules();
      } else {
        const err = await response.json();
        alert(err.error || 'Error al crear la clase');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error al crear la clase');
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('¿Eliminar este módulo y todas sus clases?')) return;
    try {
      const response = await fetch(`/api/modules/${moduleId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchModules();
      } else {
        alert('Error al eliminar el módulo');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Error al eliminar el módulo');
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    try {
      const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchModules();
      } else {
        alert('Error al eliminar la clase');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error al eliminar la clase');
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/courses" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a Cursos
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course?.name}</h1>
              {course?.description && (
                <p className="text-gray-600 mt-2">{course.description}</p>
              )}
              {course?.term && (
                <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-sm px-3 py-0.5 rounded-full">
                  {course.term}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setModuleFormData({ title: '', order_index: modules.length + 1 });
                setShowModuleForm(true);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              + Nuevo Módulo
            </button>
          </div>
        </div>

        {/* Módulos */}
        {modules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No hay módulos. Creá el primer módulo para este curso.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {module.order_index}. {module.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {module.items?.length || 0} clase(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModuleId(module.id);
                        setItemFormData({
                          title: '',
                          type: 'Video',
                          content_url: '',
                          order_index: (module.items?.length || 0) + 1,
                        });
                        setShowItemForm(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      + Clase
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                      className="text-red-500 hover:text-red-700 text-lg"
                      title="Eliminar módulo"
                    >
                      🗑️
                    </button>
                    <span className="text-gray-400 text-sm">
                      {expandedModules[module.id] ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Items del módulo */}
                {expandedModules[module.id] && (
                  <div className="border-t bg-gray-50 p-6">
                    {!module.items || module.items.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay clases en este módulo</p>
                    ) : (
                      <div className="space-y-3">
                        {module.items.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {ITEM_TYPE_ICONS[item.type] || '📄'}
                                  </span>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {item.order_index}. {item.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">{item.type}</span>
                                  </div>
                                </div>

                                {/* Vista previa YouTube */}
                                {item.content_url && extractYouTubeId(item.content_url) && (
                                  <div className="mt-4 aspect-video max-w-md">
                                    <iframe
                                      className="w-full h-full rounded"
                                      src={`https://www.youtube.com/embed/${extractYouTubeId(item.content_url)}`}
                                      title={item.title}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                                {item.content_url && !extractYouTubeId(item.content_url) && (
                                  <a
                                    href={item.content_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                                  >
                                    🔗 {item.content_url}
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="text-red-500 hover:text-red-700 ml-4 text-lg"
                                title="Eliminar clase"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Nuevo Módulo */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">Nuevo Módulo</h2>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ej: Introducción a la Doctrina de la Gracia"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={moduleFormData.order_index}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, order_index: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Crear Módulo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModuleForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Nueva Clase */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">Nueva Clase</h2>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={itemFormData.title}
                    onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ej: Lección 1 - La Depravación Total"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={itemFormData.type}
                    onChange={(e) => setItemFormData({ ...itemFormData, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Video">🎥 Video</option>
                    <option value="Lectura">📖 Lectura</option>
                    <option value="Lección">📄 Lección</option>
                    <option value="Quiz">📝 Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL del contenido</label>
                  <input
                    type="url"
                    value={itemFormData.content_url}
                    onChange={(e) => setItemFormData({ ...itemFormData, content_url: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    YouTube, PDF u otro enlace
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={itemFormData.order_index}
                    onChange={(e) => setItemFormData({ ...itemFormData, order_index: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Crear Clase'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowItemForm(false); setSelectedModuleId(null); }}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
