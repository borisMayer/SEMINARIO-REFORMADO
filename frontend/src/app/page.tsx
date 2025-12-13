'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  FiBookOpen, 
  FiAward, 
  FiUpload, 
  FiSearch, 
  FiFilter, 
  FiFileText, 
  FiTag, 
  FiHome, 
  FiBook,
  FiPlus,
  FiVideo,
  FiYoutube,
  FiTrash2,
  FiSave
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { 
  fetchResources, 
  createResource,
  fetchCourses, 
  createCourse,
  fetchModules, 
  createModule,
  fetchItems,
  createItem,
  fetchLibrary,
  saveToLibrary,
  removeFromLibrary
} from '../lib/api';

// Usuario temporal (reemplazar con autenticación real)
const TEMP_USER_ID = 'user_1';

export default function RepositorioLMS() {
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');
  const [anio, setAnio] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [tab, setTab] = useState('repositorio');
  const [openUpload, setOpenUpload] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);

  const etiquetasDisponibles = useMemo(() => {
    const allTags = resultados.flatMap(r => r.tags || []);
    return Array.from(new Set(allTags));
  }, [resultados]);

  // Cargar recursos
  useEffect(() => {
    const params: Record<string, string> = {};
    if (busqueda) params.q = busqueda;
    if (area) params.area = area;
    if (tipo) params.type = tipo;
    if (anio) params.year = anio;
    if (etiquetas.length) params.tags = etiquetas.join(',');
    fetchResources(params).then(setResultados).catch(console.error);
  }, [busqueda, area, tipo, anio, etiquetas]);

  // Cargar biblioteca
  useEffect(() => {
    if (tab === 'mi-biblioteca') {
      fetchLibrary(TEMP_USER_ID).then(setLibrary).catch(console.error);
    }
  }, [tab]);

  const handleSaveToLibrary = async (resourceId: number) => {
    try {
      await saveToLibrary(TEMP_USER_ID, resourceId);
      alert('¡Guardado en tu biblioteca!');
      fetchLibrary(TEMP_USER_ID).then(setLibrary);
    } catch (error) {
      alert('Error al guardar');
    }
  };

  const handleRemoveFromLibrary = async (resourceId: number) => {
    try {
      await removeFromLibrary(TEMP_USER_ID, resourceId);
      alert('Eliminado de tu biblioteca');
      fetchLibrary(TEMP_USER_ID).then(setLibrary);
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <FiBook className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-semibold">Repositorio Académico – Facultad de Educación Teológica</h1>
            <p className="text-sm text-slate-600">Recursos, cursos y evaluaciones en un solo lugar (MVP tipo Canvas)</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Dialog open={openUpload} onOpenChange={setOpenUpload}>
              <DialogTrigger>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <FiUpload className="mr-2 w-4 h-4" /> Subir recurso
                </Button>
              </DialogTrigger>
              <UploadDialog 
                onClose={() => setOpenUpload(false)} 
                onSuccess={() => {
                  const params: Record<string, string> = {};
                  fetchResources(params).then(setResultados);
                }}
              />
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="repositorio" className="flex items-center gap-2">
              <FiBookOpen className="w-4 h-4" /> Repositorio
            </TabsTrigger>
            <TabsTrigger value="aulas" className="flex items-center gap-2">
              <FiAward className="w-4 h-4" /> Aulas (LMS)
            </TabsTrigger>
            <TabsTrigger value="mi-biblioteca" className="flex items-center gap-2">
              <FiHome className="w-4 h-4" /> Mi Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="repositorio" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              <aside className="col-span-12 lg:col-span-3">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FiFilter className="w-4 h-4" /> Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <div className="relative">
                        <FiSearch className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
                        <Input 
                          placeholder="Título, autor, palabras clave" 
                          value={busqueda} 
                          onChange={(e)=>setBusqueda(e.target.value)} 
                          className="pl-8" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Área</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Biblia','Pastoral','Historia','Ética'].map(a => (
                          <Button 
                            key={a} 
                            variant="outline" 
                            size="sm"
                            className={area===a ? 'bg-indigo-50 border-indigo-300' : ''} 
                            onClick={()=>setArea(area===a ? '' : a)}
                          >
                            {a}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Artículo','Libro','Tesis','Recurso didáctico'].map(t => (
                          <Button 
                            key={t} 
                            variant="outline" 
                            size="sm"
                            className={tipo===t ? 'bg-indigo-50 border-indigo-300' : ''} 
                            onClick={()=>setTipo(tipo===t ? '' : t)}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Año</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[2025,2024,2023,2022,2021].map(y => (
                          <Button 
                            key={y} 
                            variant="outline" 
                            size="sm"
                            className={anio===String(y) ? 'bg-indigo-50 border-indigo-300' : ''} 
                            onClick={()=>setAnio(anio===String(y) ? '' : String(y))}
                          >
                            {y}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {etiquetasDisponibles.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Etiquetas</label>
                        <div className="flex flex-wrap gap-2">
                          {etiquetasDisponibles.map((t) => {
                            const active = etiquetas.includes(t);
                            return (
                              <Badge 
                                key={t} 
                                onClick={()=> setEtiquetas(prev => active ? prev.filter(x=>x!==t) : [...prev, t])} 
                                className={`cursor-pointer ${active ? 'bg-indigo-600 text-white' : ''}`}
                              >
                                <FiTag className="w-3 h-3" /> {t}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={()=>{ 
                          setBusqueda(''); 
                          setArea(''); 
                          setTipo(''); 
                          setAnio(''); 
                          setEtiquetas([]); 
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              <section className="col-span-12 lg:col-span-9 space-y-4">
                {resultados.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="py-12 text-center text-slate-600">
                      <FiBookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p>No se encontraron recursos con los criterios seleccionados.</p>
                      <p className="text-sm mt-2">Intenta ajustar los filtros o sube un nuevo recurso.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {resultados.map((r) => (
                      <Card key={r.id} className="rounded-2xl shadow-sm hover:shadow-md transition">
                        <CardHeader>
                          <CardTitle className="text-base">{r.title}</CardTitle>
                          <p className="text-sm text-slate-600">{(r.authors||[]).join(', ')}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2 flex-wrap">
                            <Badge>{r.area}</Badge>
                            <Badge>{r.type}</Badge>
                            <Badge>{r.year}</Badge>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-3">{r.abstract}</p>
                          {r.tags && r.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {r.tags.map((t: string) => (
                                <Badge key={t} variant="outline">{t}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2 flex-wrap">
                            {r.file_url && (
                              <a href={r.file_url} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm" className="gap-2">
                                  <FiFileText className="w-4 h-4" /> Ver
                                </Button>
                              </a>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSaveToLibrary(r.id)}
                            >
                              <FiSave className="w-4 h-4 mr-1" /> Guardar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="aulas" className="mt-6">
            <CoursesSection />
          </TabsContent>

          <TabsContent value="mi-biblioteca" className="mt-6">
            {library.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="py-12 text-center text-slate-600">
                  <FiHome className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium mb-2">Mi Biblioteca</p>
                  <p className="text-sm">Aún no has guardado recursos. Explora el repositorio y guarda tus favoritos.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {library.map((r) => (
                  <Card key={r.id} className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{r.title}</CardTitle>
                      <p className="text-sm text-slate-600">{(r.authors||[]).join(', ')}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Badge>{r.area}</Badge>
                        <Badge>{r.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-700">{r.abstract}</p>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveFromLibrary(r.id)}
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} Facultad de Educación Teológica • Repositorio & LMS (MVP).
        </div>
      </footer>
    </div>
  );
}

// ============================================
// COMPONENTE: Diálogo Subir Recurso
// ============================================
function UploadDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [autores, setAutores] = useState('');
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');
  const [anio, setAnio] = useState('');
  const [resumen, setResumen] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [aceptaLicencia, setAceptaLicencia] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = titulo && autores && area && tipo && anio && aceptaLicencia;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createResource({
        title: titulo,
        authors: autores.split(',').map(a => a.trim()),
        area,
        type: tipo,
        year: anio,
        abstract: resumen,
        tags: etiquetas.split(',').map(t => t.trim()).filter(Boolean),
        file_url: null,
      });
      alert('¡Recurso creado exitosamente!');
      onClose();
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Error al crear el recurso. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Subir nuevo recurso</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input 
          placeholder="Título *" 
          value={titulo} 
          onChange={(e)=>setTitulo(e.target.value)} 
        />
        <Input 
          placeholder="Autores (separados por coma) *" 
          value={autores} 
          onChange={(e)=>setAutores(e.target.value)} 
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger>
              <SelectValue placeholder="Área *" />
            </SelectTrigger>
            <SelectContent>
              {['Biblia','Pastoral','Historia','Ética'].map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo *" />
            </SelectTrigger>
            <SelectContent>
              {['Artículo','Libro','Tesis','Recurso didáctico'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={anio} onValueChange={setAnio}>
            <SelectTrigger>
              <SelectValue placeholder="Año *" />
            </SelectTrigger>
            <SelectContent>
              {[2025,2024,2023,2022,2021].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea 
          placeholder="Resumen / Abstract" 
          value={resumen} 
          onChange={(e)=>setResumen(e.target.value)} 
        />
        <Input 
          placeholder="Etiquetas (separadas por coma)" 
          value={etiquetas} 
          onChange={(e)=>setEtiquetas(e.target.value)} 
        />
        <div className="flex items-center gap-2 text-sm">
          <Checkbox 
            id="lic" 
            checked={aceptaLicencia} 
            onCheckedChange={(v)=>setAceptaLicencia(Boolean(v))} 
          />
          <label htmlFor="lic" className="cursor-pointer">
            Confirmo derechos y licencia (p.ej., CC BY-NC) *
          </label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          disabled={!canSubmit || loading} 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSubmit}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============================================
// COMPONENTE: Sección de Cursos
// ============================================
function CoursesSection() {
  const [courses, setCourses] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    fetchCourses().then(setCourses).catch(console.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Aulas Virtuales</h2>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <FiPlus className="mr-2" /> Crear Aula
            </Button>
          </DialogTrigger>
          <CreateCourseDialog 
            onClose={() => setOpenCreate(false)} 
            onSuccess={loadCourses}
          />
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center text-slate-600">
            <FiAward className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium mb-2">No hay aulas virtuales</p>
            <p className="text-sm">Crea tu primera aula virtual para comenzar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} onUpdate={loadCourses} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: Card de Curso
// ============================================
function CourseCard({ course, onUpdate }: { course: any; onUpdate: () => void }) {
  const [modules, setModules] = useState<any[]>([]);
  const [itemsByModule, setItemsByModule] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchModules(course.id).then(mods => {
      setModules(mods);
      mods.forEach((m: any) => {
        fetchItems(m.id).then(items => {
          setItemsByModule(prev => ({ ...prev, [m.id]: items }));
        });
      });
    });
  }, [course.id]);

  return (
    <Card className="rounded-2xl hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="text-base">{course.name}</CardTitle>
        <p className="text-sm text-slate-600">
          {course.term} • {(course.instructors||[]).join(', ')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {course.description && (
          <p className="text-sm text-slate-600">{course.description}</p>
        )}
        
        {course.zoom_link && (
          <a 
            href={course.zoom_link} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
          >
            <FiVideo /> Unirse a clase en vivo
          </a>
        )}
        
        {course.youtube_playlist && (
          <a 
            href={course.youtube_playlist} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-red-600 hover:underline"
          >
            <FiYoutube /> Ver grabaciones
          </a>
        )}

        {modules.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            {modules.map((m) => (
              <div key={m.id} className="p-2 bg-slate-50 rounded">
                <h4 className="text-sm font-medium">{m.title}</h4>
                <div className="mt-1 space-y-1">
                  {(itemsByModule[m.id]||[]).map((it) => (
                    <div key={it.id} className="flex items-center gap-2 text-xs text-slate-600">
                      {it.type === 'youtube_video' && <FiYoutube className="text-red-500" />}
                      {it.type === 'zoom_live' && <FiVideo className="text-indigo-500" />}
                      <span>{it.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: Diálogo Crear Curso
// ============================================
function CreateCourseDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
      alert('¡Aula creada exitosamente!');
      onClose();
      onSuccess();
    } catch (error) {
      alert('Error al crear el aula');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = formData.name && formData.term && formData.instructors;

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Crear Nueva Aula Virtual</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input
          placeholder="Nombre del Curso *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Período (ej: 2025-1) *"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          />
          <Input
            placeholder="Instructores (separados por coma) *"
            value={formData.instructors}
            onChange={(e) => setFormData({ ...formData, instructors: e.target.value })}
          />
        </div>

        <Textarea
          placeholder="Descripción del curso"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="space-y-3 border-t pt-4">
          <h4 className="text-sm font-medium">Configuración de Clases</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-1">
                <FiVideo className="text-indigo-600" /> Link de Zoom
              </label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={formData.zoom_link}
                onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-1">
                <FiYoutube className="text-red-600" /> Playlist de YouTube
              </label>
              <Input
                placeholder="https://youtube.com/playlist?list=..."
                value={formData.youtube_playlist}
                onChange={(e) => setFormData({ ...formData, youtube_playlist: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
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
  );
}
