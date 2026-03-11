const API_URL = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Non authentifié');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Erreur ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getMe() {
    return this.request<any>('/auth/me');
  }

  // Users
  getUsers() {
    return this.request<any[]>('/users');
  }

  createUser(data: any) {
    return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  addCollaborator(data: any) {
    return this.request<any>('/users/collaborator', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteUser(id: string) {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  // KPI
  getKpiDefinitions() {
    return this.request<any[]>('/kpi/definitions');
  }

  getKpiEntries(days = 7, userId?: string) {
    const params = new URLSearchParams({ days: String(days) });
    if (userId) params.set('userId', userId);
    return this.request<any[]>(`/kpi/entries?${params}`);
  }

  saveKpiEntry(data: { value: number; date: string; kpiDefinitionId: string }) {
    return this.request<any>('/kpi/entries', { method: 'POST', body: JSON.stringify(data) });
  }

  addComment(entryId: string, text: string) {
    return this.request<any>(`/kpi/entries/${entryId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Attendance
  getAttendance(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request<any>(`/attendance${params}`);
  }

  saveAttendance(data: { userId: string; date: string; status: string }) {
    return this.request<any>('/attendance', { method: 'POST', body: JSON.stringify(data) });
  }

  // Sections
  getSections() {
    return this.request<any[]>('/sections');
  }

  createSection(data: { name: string; kpis: { name: string; unit: string }[] }) {
    return this.request<any>('/sections', { method: 'POST', body: JSON.stringify(data) });
  }

  toggleSection(id: string) {
    return this.request<any>(`/sections/${id}/toggle`, { method: 'PATCH' });
  }

  deleteSection(id: string) {
    return this.request<void>(`/sections/${id}`, { method: 'DELETE' });
  }

  // Admin
  getAdminOverview(days = 7) {
    return this.request<any[]>(`/admin/overview?days=${days}`);
  }

  getExportUrl(startDate: string, endDate: string) {
    return `${API_URL}/admin/export?startDate=${startDate}&endDate=${endDate}`;
  }
}

export const api = new ApiClient();
