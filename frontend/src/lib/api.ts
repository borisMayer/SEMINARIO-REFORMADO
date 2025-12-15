// src/lib/api.ts
// API client para conectar con el backend en Railway

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('🔗 API URL:', API_URL);

// ============================================
// TIPOS (TypeScript)
// ============================================
export interface Resource {
  id: number;
  title: string;
  authors: string[];
  area: string;
  type: string;
  year: string;
  abstract: string;
  tags: string[];
  file_url: string | null;
  created_at: string;
}

export interface Course {
  id: number;
  name: string;
  term: string;
  instructors: string[];
  description: string;
  zoom_link: string | null;
  youtube_playlist: string | null;
  created_at: string;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  created_at: string;
}

export interface Item {
  id: number;
  module_id: number;
  type: string;
  title: string;
  content_url: string | null;
  order_index: number;
  created_at: string;
}

// ============================================
// HELPER PARA MANEJAR RESPUESTAS
// ============================================
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// ============================================
// RECURSOS - Funciones exportadas individualmente
// ============================================
export async function fetchResources(filters?: {
  q?: string;
  area?: string;
  type?: string;
  year?: string;
  tags?: string;
}): Promise<Resource[]> {
  const params = new URLSearchParams();
  
  if (filters?.q) params.append('q', filters.q);
  if (filters?.area) params.append('area', filters.area);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.year) params.append('year', filters.year);
  if (filters?.tags) params.append('tags', filters.tags);
  
  const url = `${API_URL}/api/resources${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  return handleResponse<Resource[]>(response);
}

export async function createResource(data: {
  title: string;
  authors: string[];
  area: string;
  type: string;
  year: string;
  abstract?: string;
  tags?: string[];
  file_url?: string;
}): Promise<Resource> {
  const response = await fetch(`${API_URL}/api/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(response);
}

export async function updateResource(id: number, data: Partial<Resource>): Promise<Resource> {
  const response = await fetch(`${API_URL}/api/resources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(response);
}

export async function deleteResource(id: number): Promise<{ message: string; id: number }> {
  const response = await fetch(`${API_URL}/api/resources/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// ============================================
// CURSOS - Funciones exportadas individualmente
// ============================================
export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/api/courses`);
  return handleResponse<Course[]>(response);
}

export async function createCourse(data: {
  name: string;
  term: string;
  instructors: string[];
  description?: string;
  zoom_link?: string;
  youtube_playlist?: string;
}): Promise<Course> {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Course>(response);
}

// ============================================
// MÓDULOS - Funciones exportadas individualmente
// ============================================
export async function fetchModules(courseId: number): Promise<Module[]> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/modules`);
  return handleResponse<Module[]>(response);
}

export async function createModule(data: {
  course_id: number;
  title: string;
  order_index?: number;
}): Promise<Module> {
  const response = await fetch(`${API_URL}/api/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Module>(response);
}

// ============================================
// ITEMS - Funciones exportadas individualmente
// ============================================
export async function fetchItems(moduleId: number): Promise<Item[]> {
  const response = await fetch(`${API_URL}/api/modules/${moduleId}/items`);
  return handleResponse<Item[]>(response);
}

export async function createItem(data: {
  module_id: number;
  type: string;
  title: string;
  content_url?: string;
  order_index?: number;
}): Promise<Item> {
  const response = await fetch(`${API_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Item>(response);
}

// ============================================
// BIBLIOTECA - Funciones exportadas individualmente
// ============================================
export async function fetchLibrary(userId: string): Promise<Resource[]> {
  const response = await fetch(`${API_URL}/api/library/${userId}`);
  return handleResponse<Resource[]>(response);
}

export async function saveToLibrary(userId: string, resourceId: number): Promise<any> {
  const response = await fetch(`${API_URL}/api/library`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, resource_id: resourceId }),
  });
  return handleResponse(response);
}

export async function removeFromLibrary(userId: string, resourceId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/library/${userId}/${resourceId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// ============================================
// HEALTH CHECK - Funciones exportadas individualmente
// ============================================
export async function checkHealth(): Promise<{
  ok: boolean;
  uptime: number;
  timestamp: string;
  memory: string;
}> {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse(response);
}

export async function checkDBHealth(): Promise<{
  ok: boolean;
  database: string;
  responseTime: string;
  timestamp: string;
}> {
  const response = await fetch(`${API_URL}/api/health`);
  return handleResponse(response);
}

// ============================================
// EXPORTACIONES AGRUPADAS (opcionales)
// Para uso alternativo en el futuro
// ============================================
export const resourcesApi = {
  getAll: fetchResources,
  create: createResource,
  update: updateResource,
  delete: deleteResource,
};

export const coursesApi = {
  getAll: fetchCourses,
  create: createCourse,
  getModules: fetchModules,
};

export const modulesApi = {
  create: createModule,
  getItems: fetchItems,
};

export const itemsApi = {
  create: createItem,
};

export const libraryApi = {
  get: fetchLibrary,
  add: saveToLibrary,
  remove: removeFromLibrary,
};

export const healthApi = {
  check: checkHealth,
  checkDB: checkDBHealth,
};

// Exportación por defecto con todo agrupado
const api = {
  resources: resourcesApi,
  courses: coursesApi,
  modules: modulesApi,
  items: itemsApi,
  library: libraryApi,
  health: healthApi,
};

export default api;
