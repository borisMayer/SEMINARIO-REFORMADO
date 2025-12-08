// ============================================
// frontend/src/lib/api.ts - API COMPLETA
// ============================================
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

// Recursos
export async function fetchResources(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/resources${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function createResource(data: any) {
  const res = await fetch(`${API_BASE}/api/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creating resource');
  return res.json();
}

// Cursos
export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/courses`);
  if (!res.ok) return [];
  return res.json();
}

export async function createCourse(data: any) {
  const res = await fetch(`${API_BASE}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creating course');
  return res.json();
}

// Módulos
export async function fetchModules(courseId: string) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules`);
  if (!res.ok) return [];
  return res.json();
}

export async function createModule(courseId: string, data: any) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creating module');
  return res.json();
}

// Items
export async function fetchItems(moduleId: string) {
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/items`);
  if (!res.ok) return [];
  return res.json();
}

export async function createItem(moduleId: string, data: any) {
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creating item');
  return res.json();
}

// Biblioteca
export async function fetchLibrary(userId: string) {
  const res = await fetch(`${API_BASE}/api/library/${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function saveToLibrary(userId: string, resourceId: number) {
  const res = await fetch(`${API_BASE}/api/library`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, resource_id: resourceId }),
  });
  if (!res.ok) throw new Error('Error saving to library');
  return res.json();
}

export async function removeFromLibrary(userId: string, resourceId: number) {
  const res = await fetch(`${API_BASE}/api/library/${userId}/${resourceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error removing from library');
  return res.json();
}

// ============================================
// COMPONENTE: Diálogo Crear Curso/Aula
// ============================================
import React, { useState } from 'react';
import { FiPlus, FiVideo, FiYoutube } from 'react-icons/fi';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export function CreateCourseDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    term: '',
    instructors: '',
    description: '',
    zoom_link: '',
    youtube_playlist: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCourse({
        ...formData,
        instructors: formData.instructors.split(',').map(i => i.trim()),
      });
      setOpen(false);
      setFormData({
        name: '',
        term: '',
        instructors: '',
        description: '',
        zoom_link: '',
        youtube_playlist: '',
      });
      onSuccess();
      alert('¡Curso creado exitosamente!');
    } catch (error) {
      alert('Error al crear el curso');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = formData.name && formData.term && formData.instructors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <FiPlus className="mr-2" /> Crear Aula Virtual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Aula Virtual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Nombre del Curso *</label>
            <Input
              placeholder="Ej: Teología Sistemática I"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Período *</label>
              <Input
                placeholder="Ej: 2025-1"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Instructores *</label>
              <Input
                placeholder="Separados por coma"
                value={formData.instructors}
                onChange={(e) => setFormData({ ...formData, instructors: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Descripción</label>
            <Textarea
              placeholder="Descripción del curso..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Configuración de Clases</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1 flex items-center gap-2">
                  <FiVideo className="text-indigo-600" /> Link de Zoom (para clases en vivo)
                </label>
                <Input
                  placeholder="https://zoom.us/j/..."
                  value={formData.zoom_link}
                  onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Puedes obtener un link permanente en tu cuenta de Zoom
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1 flex items-center gap-2">
                  <FiYoutube className="text-red-600" /> Playlist de YouTube (grabaciones)
                </label>
                <Input
                  placeholder="https://youtube.com/playlist?list=..."
                  value={formData.youtube_playlist}
                  onChange={(e) => setFormData({ ...formData, youtube_playlist: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Crea una playlist en YouTube para organizar las grabaciones
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? 'Creando...' : 'Crear Aula'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE: Diálogo Agregar Clase/Video
// ============================================
export function AddItemDialog({ 
  moduleId, 
  onSuccess 
}: { 
  moduleId: string; 
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'youtube_video',
    zoom_link: '',
    youtube_url: '',
    content: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createItem(moduleId, {
        ...formData,
        position: 0,
      });
      setOpen(false);
      setFormData({
        title: '',
        type: 'youtube_video',
        zoom_link: '',
        youtube_url: '',
        content: '',
      });
      onSuccess();
      alert('¡Clase agregada exitosamente!');
    } catch (error) {
      alert('Error al agregar la clase');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = formData.title && 
    ((formData.type === 'zoom_live' && formData.zoom_link) || 
     (formData.type === 'youtube_video' && formData.youtube_url));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <FiPlus className="mr-1" /> Agregar Clase
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Clase/Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Título *</label>
            <Input
              placeholder="Ej: Clase 1 - Introducción"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Tipo *</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="youtube_video">Video de YouTube (grabación)</option>
              <option value="zoom_live">Clase en vivo (Zoom)</option>
            </select>
          </div>

          {formData.type === 'zoom_live' && (
            <div>
              <label className="text-sm font-medium block mb-1 flex items-center gap-2">
                <FiVideo className="text-indigo-600" /> Link de Zoom *
              </label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={formData.zoom_link}
                onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
              />
            </div>
          )}

          {formData.type === 'youtube_video' && (
            <div>
              <label className="text-sm font-medium block mb-1 flex items-center gap-2">
                <FiYoutube className="text-red-600" /> URL de YouTube *
              </label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">
                Sube tu clase grabada a YouTube y pega el link aquí
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1">Descripción</label>
            <Textarea
              placeholder="Descripción opcional..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
