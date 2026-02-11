// frontend/src/app/admin/courses/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

export default function CourseModulesPage({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id; // Cambiado de courseId a id
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    order_index: 1
  });

  const [itemFormData, setItemFormData] = useState({
    title: '',
    content: '',
    item_type: 'video',
    resource_url: '',
    duration_minutes: '',
    order_index: 1
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
      
      // Obtener items para cada módulo
      const modulesWithItems = await Promise.all(
        modulesData.map(async (module) => {
          const itemsResponse = await fetch(`/api/items?moduleId=${module.id}`);
          const items = await itemsResponse.json();
          return { ...module, items };
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
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...moduleFormData,
          course_id: parseInt(courseId)
        })
      });

      if (response.ok) {
        setShowModuleForm(false);
        setModuleFormData({ title: '', description: '', order_index: 1 });
        fetchModules();
        alert('Módulo creado exitosamente');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error al crear el módulo');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemFormData,
          module_id: parseInt(selectedModuleId),
          duration_minutes: parseInt(itemFormData.duration_minutes) || null
        })
      });

      if (response.ok) {
        setShowItemForm(false);
        setItemFormData({
          title: '',
          content: '',
          item_type: 'video',
          resource_url: '',
          duration_minutes: '',
          order_index: 1
        });
        setSelectedModuleId(null);
        fetchModules();
        alert('Clase creada exitosamente');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error al crear la clase');
    }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('¿Eliminar este módulo y todas sus clases?')) return;
    
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchModules();
        alert('Módulo eliminado');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchModules();
        alert('Clase eliminada');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
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
              <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-gray-600 mt-2">{course?.description}</p>
            </div>
            <button
              onClick={() => setShowModuleForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              + Nuevo Módulo
            </button>
          </div>
        </div>

        {/* Módulos */}
        {modules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No hay módulos. Crea el primer módulo para este curso.</p>
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
                    <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {module.items?.length || 0} clase(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModuleId(module.id);
                        setShowItemForm(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      + Clase
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule(module.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                    <span className="text-gray-400">
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
                      <div className="space-y-4">
                        {module.items.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {item.item_type === 'video' ? '🎥' : 
                                     item.item_type === 'reading' ? '📖' : 
                                     item.item_type === 'quiz' ? '📝' : '📄'}
                                  </span>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {item.order_index}. {item.title}
                                    </h4>
                                    {item.content && (
                                      <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                                    )}
                                    {item.duration_minutes && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Duración: {item.duration_minutes} minutos
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Vista previa de YouTube */}
                                {item.item_type === 'video' && item.resource_url && (
                                  <div className="mt-4">
                                    {extractYouTubeId(item.resource_url) ? (
                                      <div className="aspect-video max-w-md">
                                        <iframe
                                          className="w-full h-full rounded"
                                          src={`https://www.youtube.com/embed/${extractYouTubeId(item.resource_url)}`}
                                          title={item.title}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        ></iframe>
                                      </div>
                                    ) : (
                                      <a 
                                        href={item.resource_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        🔗 {item.resource_url}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="text-red-600 hover:text-red-800 ml-4"
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
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">Nuevo Módulo</h2>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({...moduleFormData, title: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ej: Introducción a la Doctrina de la Gracia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({...moduleFormData, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={moduleFormData.order_index}
                    onChange={(e) => setModuleFormData({...moduleFormData, order_index: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Crear Módulo
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
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Nueva Clase</h2>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={itemFormData.title}
                    onChange={(e) => setItemFormData({...itemFormData, title: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ej: Lección 1 - La Depravación Total"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Clase</label>
                  <select
                    value={itemFormData.item_type}
                    onChange={(e) => setItemFormData({...itemFormData, item_type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="video">🎥 Video</option>
                    <option value="reading">📖 Lectura</option>
                    <option value="lesson">📄 Lección</option>
                    <option value="quiz">📝 Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL del Video de YouTube *
                  </label>
                  <input
                    type="url"
                    required
                    value={itemFormData.resource_url}
                    onChange={(e) => setItemFormData({...itemFormData, resource_url: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pega el enlace completo de YouTube aquí
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={itemFormData.content}
                    onChange={(e) => setItemFormData({...itemFormData, content: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Descripción de la clase..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (minutos)</label>
                    <input
                      type="number"
                      min="1"
                      value={itemFormData.duration_minutes}
                      onChange={(e) => setItemFormData({...itemFormData, duration_minutes: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="45"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Orden</label>
                    <input
                      type="number"
                      min="1"
                      value={itemFormData.order_index}
                      onChange={(e) => setItemFormData({...itemFormData, order_index: parseInt(e.target.value)})}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Crear Clase
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false);
                      setSelectedModuleId(null);
                    }}
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
