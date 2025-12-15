// lib/api.ts
// API client para conectar con el backend en Railway

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('🔗 API URL:', API_URL); // Para debugging

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

export interface LibraryEntry {
  id: number;
  user_id: string;
  resource_id: number;
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
// RECURSOS
// ============================================
export const resourcesApi = {
  /**
   * Obtener todos los recursos con filtros opcionales
   */
  async getAll(filters?: {
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
  },

  /**
   * Crear un nuevo recurso
   */
  async create(data: {
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
  },

  /**
   * Actualizar un recurso existente
   */
  async update(id: number, data: Partial<Resource>): Promise<Resource> {
    const response = await fetch(`${API_URL}/api/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Resource>(response);
  },

  /**
   * Eliminar un recurso
   */
  async delete(id: number): Promise<{ message: string; id: number }> {
    const response = await fetch(`${API_URL}/api/resources/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============================================
// CURSOS
// ============================================
export const coursesApi = {
  /**
   * Obtener todos los cursos
   */
  async getAll(): Promise<Course[]> {
    const response = await fetch(`${API_URL}/api/courses`);
    return handleResponse<Course[]>(response);
  },

  /**
   * Crear un nuevo curso
   */
  async create(data: {
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
  },

  /**
   * Obtener módulos de un curso
   */
  async getModules(courseId: number): Promise<Module[]> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/modules`);
    return handleResponse<Module[]>(response);
  },
};

// ============================================
// MÓDULOS
// ============================================
export const modulesApi = {
  /**
   * Crear un nuevo módulo
   */
  async create(data: {
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
  },

  /**
   * Obtener items de un módulo
   */
  async getItems(moduleId: number): Promise<Item[]> {
    const response = await fetch(`${API_URL}/api/modules/${moduleId}/items`);
    return handleResponse<Item[]>(response);
  },
};

// ============================================
// ITEMS
// ============================================
export const itemsApi = {
  /**
   * Crear un nuevo item
   */
  async create(data: {
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
  },
};

// ============================================
// BIBLIOTECA (Favoritos del usuario)
// ============================================
export const libraryApi = {
  /**
   * Obtener biblioteca de un usuario
   */
  async get(userId: string): Promise<Resource[]> {
    const response = await fetch(`${API_URL}/api/library/${userId}`);
    return handleResponse<Resource[]>(response);
  },

  /**
   * Agregar un recurso a la biblioteca
   */
  async add(userId: string, resourceId: number): Promise<LibraryEntry> {
    const response = await fetch(`${API_URL}/api/library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, resource_id: resourceId }),
    });
    return handleResponse<LibraryEntry>(response);
  },

  /**
   * Remover un recurso de la biblioteca
   */
  async remove(userId: string, resourceId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/library/${userId}/${resourceId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthApi = {
  /**
   * Verificar estado del servidor
   */
  async check(): Promise<{
    ok: boolean;
    uptime: number;
    timestamp: string;
    memory: string;
  }> {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse(response);
  },
  
  /**
   * Verificar estado de la base de datos
   */
  async checkDB(): Promise<{
    ok: boolean;
    database: string;
    responseTime: string;
    timestamp: string;
  }> {
    const response = await fetch(`${API_URL}/api/health`);
    return handleResponse(response);
  },
};

// ============================================
// EXPORTAR TODO COMO OBJETO DEFAULT
// ============================================
const api = {
  resources: resourcesApi,
  courses: coursesApi,
  modules: modulesApi,
  items: itemsApi,
  library: libraryApi,
  health: healthApi,
};

export default api;
