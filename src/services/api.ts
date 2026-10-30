// API client for VisionGuard AI
import { Inspection, InspectionProfile, User } from '../server/types';

const TOKEN_KEY = 'visionguard_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string):Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string, role = 'inspector'): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  // Inspections
  async getInspections(params?: {
    domain?: string;
    status?: string;
    severity?: string;
    search?: string;
  }): Promise<{ inspections: Inspection[] }> {
    const query = new URLSearchParams();
    if (params?.domain) query.set('domain', params.domain);
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return request<{ inspections: Inspection[] }>(`/api/inspections${qs ? `?${qs}` : ''}`);
  },

  async getInspection(id: string): Promise<{ inspection: Inspection }> {
    return request<{ inspection: Inspection }>(`/api/inspections/${id}`);
  },

  async createInspection(formDataOrJson: FormData | Record<string, any>): Promise<{ inspection: Inspection }> {
    const isFormData = formDataOrJson instanceof FormData;
    return request<{ inspection: Inspection }>('/api/inspections', {
      method: 'POST',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },

  async reanalyzeInspection(id: string, notes?: string): Promise<{ inspection: Inspection }> {
    return request<{ inspection: Inspection }>(`/api/inspections/${id}/reanalyze`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async deleteInspection(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/inspections/${id}`, {
      method: 'DELETE',
    });
  },

  // Profiles
  async getProfiles(): Promise<{ profiles: InspectionProfile[] }> {
    return request<{ profiles: InspectionProfile[] }>('/api/profiles');
  },

  async createProfile(data: {
    name: string;
    domain: string;
    description?: string;
    custom_rules: any;
  }): Promise<{ profile: InspectionProfile }> {
    return request<{ profile: InspectionProfile }>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteProfile(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/profiles/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  async getAnalyticsSummary(): Promise<{ summary: any }> {
    return request<{ summary: any }>('/api/analytics/summary');
  },

  // Sample Assets
  async getSampleAssets(): Promise<{ assets: any[] }> {
    return request<{ assets: any[] }>('/api/sample-assets');
  },
};
