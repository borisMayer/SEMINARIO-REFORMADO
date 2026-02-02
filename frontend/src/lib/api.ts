// src/lib/api.ts
// API client para conectar con Vercel API Routes

const API_URL = ''; // Usar rutas relativas en Vercel

console.log('🔗 API configurado para usar Vercel API Routes');

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
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
  return response.json();
}

// Función para construir la URL - Rutas relativas para Vercel
function getUrl(path: string, params?: URLSearchParams): string {
  return `${path}${params ? `?${params}` : ''}`;
}

// ============================================
// RECURSOS
// ============================================
export async function fetchResources(filters?: {
  q?: string;
  area?: string;
  type?: string;
  year?: string;
  tags?: string;
}): Promise<Resource[]> {
  const params = new URLSearchParams();
  if (filters?.q) params.append('search', filters.q);
  if (filters?.area) params.append('area', filters.area);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.year) params.append('year', filters.year);
  if (filters?.tags) params.append('tags', filters.tags);

  const url = getUrl('/api/resources', params.toString() ? params : undefined);
  console.log('Fetching resources from:', url);
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
  file_url?: string | null;
}): Promise<Resource> {
  const url = getUrl('/api/resources');
  console.log('Creating resource at:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(response);
}

export async function updateResource(id: number, data: Partial<Resource>): Promise<Resource> {
  const url = getUrl(`/api/resources/${id}`);
  console.log('Updating resource at:', url);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(response);
}

export async function deleteResource(id: number): Promise<{ message: string; id: number }> {
  const url = getUrl(`/api/resources/${id}`);
  console.log('Deleting resource at:', url);
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// ============================================
// CURSOS
// ============================================
export async function fetchCourses(): Promise<Course[]> {
  const url = getUrl('/api/courses');
  console.log('Fetching courses from:', url);
  const response = await fetch(url);
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
  const url = getUrl('/api/courses');
  console.log('Creating course at:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Course>(response);
}

// ============================================
// MÓDULOS
// ============================================
export async function fetchModules(courseId: number): Promise<Module[]> {
  const url = getUrl(`/api/courses/${courseId}/modules`);
  console.log('Fetching modules from:', url);
  const response = await fetch(url);
  return handleResponse<Module[]>(response);
}

export async function createModule(data: {
  course_id: number;
  title: string;
  order_index?: number;
}): Promise<Module> {
  const url = getUrl('/api/modules');
  console.log('Creating module at:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Module>(response);
}

// ============================================
// ITEMS
// ============================================
export async function fetchItems(moduleId: number): Promise<Item[]> {
  const url = getUrl(`/api/modules/${moduleId}/items`);
  console.log('Fetching items from:', url);
  const response = await fetch(url);
  return handleResponse<Item[]>(response);
}

export async function createItem(data: {
  module_id: number;
  type: string;
  title: string;
  content_url?: string;
  order_index?: number;
}): Promise<Item> {
  const url = getUrl('/api/items');
  console.log('Creating item at:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Item>(response);
}

// ============================================
// BIBLIOTECA
// ============================================
export async function fetchLibrary(userId: string): Promise<Resource[]> {
  const url = getUrl(`/api/library/${userId}`);
  console.log('Fetching library from:', url);
  const response = await fetch(url);
  return handleResponse<Resource[]>(response);
}

export async function saveToLibrary(userId: string, resourceId: number): Promise<any> {
  const url = getUrl('/api/library');
  console.log('Saving to library at:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, resource_id: resourceId }),
  });
  return handleResponse(response);
}

export async function removeFromLibrary(userId: string, resourceId: number): Promise<{ message: string }> {
  const url = getUrl(`/api/library/${userId}/${resourceId}`);
  console.log('Removing from library at:', url);
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// ============================================
// HEALTH CHECK
// ============================================
export async function checkHealth(): Promise<{
  status: string;
  timestamp: string;
  database: any;
}> {
  const url = getUrl('/api/health');
  console.log('Checking health at:', url);
  const response = await fetch(url);
  return handleResponse(response);
}

export async function checkDBHealth(): Promise<{
  status: string;
  database: any;
  timestamp: string;
}> {
  const url = getUrl('/api/health');
  console.log('Checking DB health at:', url);
  const response = await fetch(url);
  return handleResponse(response);
}

// ============================================
// EXPORTACIONES AGRUPADAS
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

const api = {
  resources: resourcesApi,
  courses: coursesApi,
  modules: modulesApi,
  items: itemsApi,
  library: libraryApi,
  health: healthApi,
};

export default api;
