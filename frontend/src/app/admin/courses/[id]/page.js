// frontend/src/app/admin/courses/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';

const ITEM_TYPES = ['Video', 'Lectura', 'Lección', 'Quiz'];
const ITEM_TYPE_ICONS = { Video: '🎥', Lectura: '📖', Lección: '📄', Quiz: '📝' };

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
}

const EMPTY_MODULE_FORM = { title: '', order_index: 1 };
const EMPTY_ITEM_FORM   = { title: '', type: 'Video', content_url: '', order_index: 1 };

export default function CourseModulesPage({ params }) {
  const { id: courseId } = use(params);

  const [course,          setCourse]          = useState(null);
  const [modules,         setModules]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // ── module form ──────────────────────────────────────────────────────────────
  const [showModuleForm,  setShowModuleForm]  = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleForm,      setModuleForm]      = useState(EMPTY_MODULE_FORM);

  // ── item form ────────────────────────────────────────────────────────────────
  const [showItemForm,    setShowItemForm]    = useState(false);
  const [editingItemId,   setEditingItemId]   = useState(null);
  const [itemParentId,    setItemParentId]    = useState(null);
  const [itemForm,        setItemForm]        = useState(EMPTY_ITEM_FORM);

  useEffect(() => {
    fetchCourse();
    fetchModules();
  }, [courseId]);

  // ── fetch ────────────────────────────────────────────────────────────────────
  const fetchCourse = async () => {
    try {
      const res  = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data);
    } catch (err) {
      console.error('Error fetching course:', err);
    }
  };

  const fetchModules = async () => {
    try {
      const res  = await fetch(`/api/modules?courseId=${courseId}`);
      const mods = await res.json();
      if (!Array.isArray(mods)) { setModules([]); return; }

      const withItems = await Promise.all(
        mods.map(async (mod) => {
          try {
            const ir   = await fetch(`/api/items?moduleId=${mod.id}`);
            const items = await ir.json();
            return { ...mod, items: Array.isArray(items) ? items : [] };
          } catch {
            return { ...mod, items: [] };
          }
        })
      );
      setModules(withItems);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  // ── module CRUD ───────────────────────────────────────────────────────────────
  const openNewModule = () => {
    setEditingModuleId(null);
    setModuleForm({ title: '', order_index: modules.length + 1 });
    setShowModuleForm(true);
  };

  const openEditModule = (e, mod) => {
    e.stopPropagation();
    setEditingModuleId(mod.id);
    setModuleForm({ title: mod.title, order_index: mod.order_index });
    setShowModuleForm(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editingModuleId ? `/api/modules/${editingModuleId}` : '/api/modules';
      const method = editingModuleId ? 'PUT' : 'POST';
      const body   = editingModuleId
        ? { title: moduleForm.title, order_index: moduleForm.order_index }
        : { title: moduleForm.title, order_index: moduleForm.order_index, course_id: parseInt(courseId) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModuleForm(false);
        setEditingModuleId(null);
        setModuleForm(EMPTY_MODULE_FORM);
        fetchModules();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Error al guardar módulo');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar módulo');
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (e, moduleId) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este módulo y todas sus clases?')) return;
    try {
      const res = await fetch(`/api/modules/${moduleId}`, { method: 'DELETE' });
      if (res.ok) fetchModules();
      else alert('Error al eliminar el módulo');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el módulo');
    }
  };

  // ── item CRUD ─────────────────────────────────────────────────────────────────
  const openNewItem = (e, moduleId, currentItems) => {
    e.stopPropagation();
    setEditingItemId(null);
    setItemParentId(moduleId);
    setItemForm({ title: '', type: 'Video', content_url: '', order_index: currentItems + 1 });
    setShowItemForm(true);
  };

  const openEditItem = (e, item) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setItemParentId(item.module_id);
    setItemForm({
      title:       item.title,
      type:        item.type,
      content_url: item.content_url || '',
      order_index: item.order_index,
    });
    setShowItemForm(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editingItemId ? `/api/items/${editingItemId}` : '/api/items';
      const method = editingItemId ? 'PUT' : 'POST';
      const body   = editingItemId
        ? { title: itemForm.title, type: itemForm.type, content_url: itemForm.content_url || null, order_index: itemForm.order_index }
        : { module_id: parseInt(itemParentId), title: itemForm.title, type: itemForm.type, content_url: itemForm.content_url || null, order_index: itemForm.order_index };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowItemForm(false);
        setEditingItemId(null);
        setItemParentId(null);
        setItemForm(EMPTY_ITEM_FORM);
        fetchModules();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Error al guardar clase');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar clase');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (e, itemId) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta clase?')) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) fetchModules();
      else alert('Error al eliminar la clase');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la clase');
    }
  };

  const toggleModule = (moduleId) =>
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  // ── render ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const courseName = course?.name || course?.title || 'Curso';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <Link href="/admin/courses" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a Cursos
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{courseName}</h1>
              {course?.description && (
                <p className="text-gray-600 mt-2">{course.description}</p>
              )}
              {(course?.term || course?.semester) && (
                <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-sm px-3 py-0.5 rounded-full">
                  {course.term || course.semester}
                </span>
              )}
            </div>
            <button
              onClick={openNewModule}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nuevo Módulo
            </button>
          </div>
        </div>

        {/* ── Módulos ── */}
        {modules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              No hay módulos. Hacé click en "Nuevo Módulo" para empezar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-lg shadow overflow-hidden">

                {/* módulo header */}
                <div
                  className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => toggleModule(mod.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-400">
                      {expandedModules[mod.id]
                        ? <ChevronDown className="w-5 h-5" />
                        : <ChevronRight className="w-5 h-5" />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {mod.order_index}. {mod.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {mod.items?.length || 0} clase(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={(e) => openNewItem(e, mod.id, mod.items?.length || 0)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Clase
                    </button>
                    <button
                      onClick={(e) => openEditModule(e, mod)}
                      className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50"
                      title="Editar módulo"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteModule(e, mod.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* clases */}
                {expandedModules[mod.id] && (
                  <div className="border-t bg-gray-50 p-5">
                    {!mod.items || mod.items.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">
                        No hay clases. Hacé click en "+ Clase" para agregar.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {mod.items.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl shrink-0">
                                    {ITEM_TYPE_ICONS[item.type] || '📄'}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      {item.order_index}. {item.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">{item.type}</span>
                                  </div>
                                </div>

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
                                    className="text-blue-600 hover:underline text-sm mt-2 inline-block truncate max-w-sm"
                                  >
                                    🔗 {item.content_url}
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => openEditItem(e, item)}
                                  className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50"
                                  title="Editar clase"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => deleteItem(e, item.id)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                                  title="Eliminar clase"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

        {/* ── Modal: Módulo ── */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl">
              <h2 className="text-2xl font-bold mb-6">
                {editingModuleId ? 'Editar Módulo' : 'Nuevo Módulo'}
              </h2>
              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Ej: Introducción a la Doctrina de la Gracia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={moduleForm.order_index}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, order_index: parseInt(e.target.value) || 1 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : editingModuleId ? 'Actualizar' : 'Crear Módulo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModuleForm(false); setEditingModuleId(null); }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Clase/Item ── */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl">
              <h2 className="text-2xl font-bold mb-6">
                {editingItemId ? 'Editar Clase' : 'Nueva Clase'}
              </h2>
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ej: Lección 1 — La Depravación Total"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={itemForm.type}
                    onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ITEM_TYPE_ICONS[t]} {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL del contenido</label>
                  <input
                    type="url"
                    value={itemForm.content_url}
                    onChange={(e) => setItemForm({ ...itemForm, content_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-400 mt-1">YouTube, PDF u otro enlace (opcional)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.order_index}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, order_index: parseInt(e.target.value) || 1 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : editingItemId ? 'Actualizar' : 'Crear Clase'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowItemForm(false); setEditingItemId(null); setItemParentId(null); }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
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
