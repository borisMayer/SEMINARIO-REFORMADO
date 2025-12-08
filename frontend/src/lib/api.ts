const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function fetchResources(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/resources${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/courses`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchModules(courseId: string) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchItems(moduleId: string) {
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/items`);
  if (!res.ok) return [];
  return res.json();
}
