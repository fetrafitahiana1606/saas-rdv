const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = false, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json() as Promise<T>;
  return null as T;
}

export const authApi = {
  getGoogleLoginUrl: () => `${API_URL}/auth/google`,
  getMe: () => apiFetch<User>("/auth/me", { auth: true }),
};

export const businessApi = {
  getMyBusiness: () => apiFetch<BusinessConfig>("/business/me", { auth: true }),
  updateMyBusiness: (data: Partial<BusinessConfig>) =>
    apiFetch<BusinessConfig>("/business/me", { auth: true, method: "PUT", body: JSON.stringify(data) }),
  getPublicBusiness: (slug: string) => apiFetch<BusinessConfig>(`/business/public/${slug}`),
};

export const appointmentsApi = {
  getAppointments: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const q = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<Appointment[]>(`/appointments${q}`, { auth: true });
  },
  createAppointment: (slug: string, data: CreateAppointmentData) =>
    apiFetch<Appointment>(`/appointments/book/${slug}`, { method: "POST", body: JSON.stringify(data) }),
  deleteAppointment: (id: string) =>
    apiFetch<void>(`/appointments/${id}`, { auth: true, method: "DELETE" }),
  getAvailability: (slug: string, date: string) =>
    apiFetch<AvailabilityResponse>(`/appointments/availability/${slug}?date=${date}`),
};

export const billingApi = {
  createCheckout: () => apiFetch<{ url: string }>("/billing/checkout", { auth: true, method: "POST" }),
  createPortal: () => apiFetch<{ url: string }>("/billing/portal", { auth: true, method: "POST" }),
};

export interface User { id: string; email: string; name: string; avatar?: string; plan: "free" | "pro" | "business"; createdAt: string; }
export interface BusinessHours { [day: string]: { start: string; end: string; enabled: boolean }; }
export interface BusinessConfig { id?: string; businessName: string; serviceType: string; primaryColor: string; slug: string; hours: BusinessHours; days: string[]; slotDuration: number; formFields: { email: boolean; phone: boolean; note: boolean; }; }
export interface Appointment { id: string; clientName: string; clientEmail?: string; clientPhone?: string; note?: string; date: string; startTime: string; endTime?: string; businessId?: string; createdAt?: string; }
export interface CreateAppointmentData { clientName: string; clientEmail?: string; clientPhone?: string; note?: string; date: string; startTime: string; }
export interface AvailabilityResponse { slots: string[]; business: BusinessConfig; }
