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
  FiBook
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
import { fetchResources, fetchCourses, fetchModules, fetchItems } from '../lib/api';

interface SearchParams {
  q?: string;
  area?: string;
  type?: string;
  year?: string;
  tags?: string;
}

export default function RepositorioLMS() {
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState<string | undefined>(undefined);
  const [tipo, setTipo] = useState<string | undefined>(undefined);
  const [anio, setAnio] = useState<string | undefined>(undefined);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [tab, setTab] = useState('repositorio');
  const [openUpload, setOpenUpload] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const etiquetasDisponibles = useMemo(() => {
    const allTags = resultados.flatMap(r => r.tags || []);
    return Array.from(new Set(allTags));
  }, [resultados]);

  useEffect(() => {
    fetchCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    const params: SearchParams = {};
    if (busqueda) params.q = busqueda;
    if (area) params.area = area;
    if (tipo) params.type = tipo;
    if (anio) params.year = anio;
    if (etiquetas.length) params.tags = etiquetas.join(',');
    fetchResources(params).then(setResultados).catch(console.error);
  }, [busqueda, area, tipo, anio, etiquetas]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <FiBook />
          <div>
            <h1 className="text-2xl font-semibold">Repositorio Académico – Facultad de Educación Teológica</h1>
            <p className="text-sm text-slate-600">Recursos, cursos y evaluaciones en un solo lugar (MVP tipo Canvas)</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Dialog open={openUpload} onOpenChange={setOpenUpload}>
              <DialogTrigger asChild>
                <Button variant="default" size="default" className="bg-indigo-600 hover:bg-indigo-700">
                  <FiUpload className="mr-2" /> Subir recurso
                </Button>
              </DialogTrigger>
              <UploadDialog onClose={() => setOpenUpload(false)} />
            </Dialog>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="repositorio" className="flex items-center gap-2" onClick={()=>setTab('repositorio')}>
              <FiBookOpen /> Repositorio
            </TabsTrigger>
            <TabsTrigger value="aulas" className="flex items-center gap-2" onClick={()=>setTab('aulas')}>
              <FiAward /> Aulas (LMS)
            </TabsTrigger>
            <TabsTrigger value="mi-biblioteca" className="flex items-center gap-2" onClick={()=>setTab('mi-biblioteca')}>
              <FiHome /> Mi Biblioteca
            </TabsTrigger>
          </TabsList>
          <TabsContent value="repositorio" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              <aside className="col-span-12 lg:col-span-3">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FiFilter /> Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <div className="relative">
                        <FiSearch className="absolute left-2 top-2.5 text-slate-500" />
                        <Input placeholder="Título, autor, palabras clave" value={busqueda} onChange={(e)=>setBusqueda(e.target.value)} className="pl-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Área</label>
                      <div className="space-y-1">
                        {['Biblia','Pastoral','Historia','Ética'].map(a => (
                          <Button
                            key={a}
                            variant="outline"
                            size="sm"
                            className={area===a ? 'bg-indigo-50 border-indigo-300' : ''}
                            onClick={()=>setArea(area===a ? undefined : a)}
                          >
                            {a}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <div className="space-y-1">
                        {['Artículo','Libro','Tesis','Recurso didáctico'].map(t => (
                          <Button
                            key={t}
                            variant="outline"
                            size="sm"
                            className={tipo===t ? 'bg-indigo-50 border-indigo-300' : ''}
                            onClick={()=>setTipo(tipo===t ? undefined : t)}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Año</label>
                      <div className="space-y-1">
                        {[2025,2024,2023,2022,2021].map(y => (
                          <Button
                            key={y}
                            variant="outline"
                            size="sm"
                            className={anio===String(y) ? 'bg-indigo-50 border-indigo-300' : ''}
                            onClick={()=>setAnio(anio===String(y) ? undefined : String(y))}
                          >
                            {y}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Etiquetas</label>
                      <div className="flex flex-wrap gap-2">
                        {etiquetasDisponibles.map((t) => {
                          const active = etiquetas.includes(t);
                          return (
                            <Badge
                              key={t}
                              variant="outline"
                              className={`cursor-pointer ${active ? 'bg-indigo-600 text-white' : ''}`}
                              onClick={()=> setEtiquetas(prev => active ? prev.filter(x=>x!==t) : [...prev, t])}
                            >
                              <FiTag /> {t}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={()=>{ setBusqueda(''); setArea(undefined); setTipo(undefined); setAnio(undefined); setEtiquetas([]); }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>
              <section className="col-span-12 lg:col-span-9 space-y-4">
                {resultados.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="py-12 text-center text-slate-600">
                      No se encontraron recursos con los criterios seleccionados.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {resultados.map((r) => (
                      <Card key={r.id} className="rounded-2xl shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base">{r.title}</CardTitle>
                          <p className="text-sm text-slate-600">{(r.authors||[]).join(', ')}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2">
                            <Badge>{r.area}</Badge>
                            <Badge>{r.type}</Badge>
                            <Badge>{r.year}</Badge>
                          </div>
                          <p className="text-sm text-slate-700">{r.abstract}</p>
                          <div className="flex flex-wrap gap-2">
                            {(r.tags||[]).map((t: string) => (
                              <Badge key={t} variant="outline">{t}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <a href={r.file_url || '#'} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="gap-2">
                                <FiFileText /> Ver / Descargar
                              </Button>
                            </a>
                            <Button variant="outline" size="sm">Citar</Button>
                            <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">Guardar</Button>
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
            <Courses />
          </TabsContent>
          <TabsContent value="mi-biblioteca" className="mt-6">
            <Card className="rounded-2xl">
              <CardContent className="py-12 text-center text-slate-600">
                Aquí verás tus recursos guardados, cursos inscritos y actividad reciente.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Facultad de Educación Teológica • Repositorio & LMS (MVP).
        </div>
      </footer>
    </div>
  );
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [autores, setAutores] = useState('');
  const [area, setArea] = useState<string | undefined>(undefined);
  const [tipo, setTipo] = useState<string | undefined>(undefined);
  const [anio, setAnio] = useState<string | undefined>(undefined);
  const [resumen, setResumen] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [aceptaLicencia, setAceptaLicencia] = useState(false);
  const canSubmit = titulo && autores && area && tipo && anio && aceptaLicencia;
  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Subir nuevo recurso</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input placeholder="Título" value={titulo} onChange={(e)=>setTitulo(e.target.value)} />
        <Input placeholder="Autores (separados por coma)" value={autores} onChange={(e)=>setAutores(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
            <SelectContent>
              {['Biblia','Pastoral','Historia','Ética'].map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              {['Artículo','Libro','Tesis','Recurso didáctico'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={anio} onValueChange={setAnio}>
            <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              {[2025,2024,2023,2022,2021].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea placeholder="Resumen / Abstract" value={resumen} onChange={(e)=>setResumen(e.target.value)} />
        <Input placeholder="Etiquetas (separadas por coma)" value={etiquetas} onChange={(e)=>setEtiquetas(e.target.value)} />
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="lic" checked={aceptaLicencia} onCheckedChange={(v)=>setAceptaLicencia(Boolean(v))} />
          <label htmlFor="lic">Confirmo derechos y licencia (p.ej., CC BY-NC) y protección de datos personales.</label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button disabled={!canSubmit} variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">Guardar (MVP)</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, any[]>>({});
  const [itemsByModule, setItemsByModule] = useState<Record<string, any[]>>({});
  useEffect(() => {
    fetchCourses().then(setCourses).catch(console.error);
  }, []);
  useEffect(() => {
    courses.forEach(c => {
      fetchModules(c.id).then(mods => {
        setModulesByCourse(prev => ({ ...prev, [c.id]: mods }));
        mods.forEach(m => {
          fetchItems(m.id).then(items => setItemsByModule(prev => ({ ...prev, [m.id]: items })));
        });
      });
    });
  }, [courses]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {courses.map((c) => (
        <Card key={c.id} className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{c.name}</CardTitle>
            <p className="text-sm text-slate-600">{c.term} • {(c.instructors||[]).join(', ')}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(modulesByCourse[c.id]||[]).map((m) => (
              <div key={m.id} className="border rounded-xl p-3">
                <h4 className="text-sm font-medium">{m.title}</h4>
                <ul className="mt-2 space-y-2">
                  {(itemsByModule[m.id]||[]).map((it) => (
                    <li key={it.id} className="flex items-center justify-between text-sm">
                      <span>
                        <Badge className="mr-2">{it.type}</Badge>
                        {it.title}
                      </span>
                      {it.resource_id && (
                        <Button variant="outline" size="sm">Abrir recurso</Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">Entrar al aula</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
