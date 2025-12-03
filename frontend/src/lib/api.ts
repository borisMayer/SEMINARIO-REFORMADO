
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function fetchResources(params: Record<string, string>) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/resources?${sp.toString()}`);
  return res.json();
}

export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/courses`);
  return res.json();
}

export async function fetchModules(courseId: number) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules`);
  return res.json();
}

export async function fetchItems(moduleId: number) {
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/items`);
  return res.json();
}
