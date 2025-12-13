// frontend/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ============================================
// RECURSOS
// ============================================
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

// ============================================
// CURSOS
// ============================================
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

// ============================================
// MÓDULOS
// ============================================
export async function fetchModules(courseId: number) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules`);
  if (!res.ok) return [];
  return res.json();
}

export async function createModule(data: any) {
  const res = await fetch(`${API_BASE}/api/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creating module');
  return res.json();
}

// ============================================
// ITEMS
// ============================================
export async function fetchItems(moduleId: number) {
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/items`);
  if (!res.ok) return [];
  return res.json();
}

export async function createItem(data: any) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creating item');
  return res.json();
}

// ============================================
// BIBLIOTECA
// ============================================
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
