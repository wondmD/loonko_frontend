import { apiClient } from "@/lib/api/client";
import type {
  Alert,
  BirthRecord,
  BreedingCattleHistory,
  BreedingEvent,
  BreedingHerdOverview,
  BreedingUpcomingBoard,
  Cattle,
  CattleChoice,
  CattleDetail,
  Farm,
  FeedSchedule,
  FinanceSummary,
  HealthRecord,
  HusbandryBoard,
  HusbandryTask,
  LoginResponse,
  MilkCattleHistory,
  MilkHerdOverview,
  MilkRecord,
  MilkSummary,
  MilkTrends,
  Paginated,
  Pregnancy,
  RegisterResponse,
  Transaction,
  Treatment,
  User,
  Vaccination,
  SupervisorAnalytics,
} from "@/types";

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiClient.post<LoginResponse>("/auth/login/", payload).then((r) => r.data),
  register: (payload: Record<string, unknown>) =>
    apiClient.post<RegisterResponse>("/auth/register/", payload).then((r) => r.data),
  me: () => apiClient.get<User>("/auth/me/").then((r) => r.data),
  updateMe: (payload: Record<string, unknown>) =>
    apiClient.patch<User>("/auth/me/", payload).then((r) => r.data),
  logout: (refresh: string) =>
    apiClient.post("/auth/logout/", { refresh }).then((r) => r.data),
  listStaff: () => apiClient.get<Paginated<User> | User[]>("/auth/staff/").then((r) => r.data),
  createStaff: (payload: Record<string, unknown>) =>
    apiClient.post<User>("/auth/staff/", payload).then((r) => r.data),
  updateStaff: (id: number, payload: Record<string, unknown>) =>
    apiClient.patch<User>(`/auth/staff/${id}/`, payload).then((r) => r.data),
  deleteStaff: (id: number) => apiClient.delete(`/auth/staff/${id}/`),
  verifyEmail: (payload: { uid: string; token: string }) =>
    apiClient.post<{ detail: string }>("/auth/verify-email/", payload).then((r) => r.data),
  setPassword: (payload: { uid: string; token: string; password: string }) =>
    apiClient.post<{ detail: string }>("/auth/set-password/", payload).then((r) => r.data),
};

export const farmApi = {
  get: () => apiClient.get<Farm>("/farm/").then((r) => r.data),
  create: (payload: Partial<Farm>) =>
    apiClient.post<Farm>("/farm/", payload).then((r) => r.data),
  update: (payload: Partial<Farm>) =>
    apiClient.patch<Farm>("/farm/", payload).then((r) => r.data),
  supervisor: () => 
    apiClient.get<SupervisorAnalytics>("/farm/supervisor/").then((r) => r.data),
};

export const cattleApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Paginated<Cattle>>("/cattle/", { params }).then((r) => r.data),
  choices: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Paginated<CattleChoice>>("/cattle/choices/", { params }).then((r) => r.data),
  facets: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<{
        categories: Record<string, number>;
        filters: Record<string, number>;
      }>("/cattle/facets/", { params })
      .then((r) => r.data),
  get: (id: number) => apiClient.get<CattleDetail>(`/cattle/${id}/`).then((r) => r.data),
  create: (payload: FormData | Record<string, unknown>) =>
    apiClient.post<Cattle>("/cattle/", payload).then((r) => r.data),
  update: (id: number, payload: FormData | Record<string, unknown>) =>
    apiClient.patch<Cattle>(`/cattle/${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/cattle/${id}/`),
};

export const milkApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Paginated<MilkRecord>>("/milk/records/", { params }).then((r) => r.data),
  create: (payload: Partial<MilkRecord>) =>
    apiClient.post<MilkRecord>("/milk/records/", payload).then((r) => r.data),
  update: (id: number, payload: Partial<MilkRecord>) =>
    apiClient.patch<MilkRecord>(`/milk/records/${id}/`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/milk/records/${id}/`),
  summary: (params?: { period?: string }) =>
    apiClient.get<MilkSummary>("/milk/summary/", { params }).then((r) => r.data),
  trends: (params?: { days?: number; group?: string }) =>
    apiClient.get<MilkTrends>("/milk/trends/", { params }).then((r) => r.data),
  herd: () => apiClient.get<MilkHerdOverview>("/milk/herd/").then((r) => r.data),
  cattleHistory: (cattleId: number) =>
    apiClient.get<MilkCattleHistory>(`/milk/herd/${cattleId}/`).then((r) => r.data),
  listFeed: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<FeedSchedule>>("/milk/feed-schedules/", { params })
      .then((r) => r.data),
  createFeed: (payload: Partial<FeedSchedule>) =>
    apiClient.post<FeedSchedule>("/milk/feed-schedules/", payload).then((r) => r.data),
  removeFeed: (id: number) => apiClient.delete(`/milk/feed-schedules/${id}/`),
};

export const healthApi = {
  listRecords: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Paginated<HealthRecord>>("/health/records/", { params }).then((r) => r.data),
  createRecord: (payload: Partial<HealthRecord>) =>
    apiClient.post<HealthRecord>("/health/records/", payload).then((r) => r.data),
  listVaccinations: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<Vaccination>>("/health/vaccinations/", { params })
      .then((r) => r.data),
  createVaccination: (payload: Partial<Vaccination>) =>
    apiClient.post<Vaccination>("/health/vaccinations/", payload).then((r) => r.data),
  listTreatments: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Paginated<Treatment>>("/health/treatments/", { params }).then((r) => r.data),
  createTreatment: (payload: Partial<Treatment>) =>
    apiClient.post<Treatment>("/health/treatments/", payload).then((r) => r.data),
  upcomingVaccinations: () =>
    apiClient.get<Vaccination[]>("/health/upcoming-vaccinations/").then((r) => r.data),
};

export const husbandryApi = {
  board: (params?: { days?: number }) =>
    apiClient.get<HusbandryBoard>("/husbandry/tasks/board/", { params }).then((r) => r.data),
  listTasks: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<HusbandryTask>>("/husbandry/tasks/", { params })
      .then((r) => r.data),
  complete: (id: number, notes = "") =>
    apiClient
      .post<HusbandryTask>(`/husbandry/tasks/${id}/complete/`, { notes })
      .then((r) => r.data),
  skip: (id: number, notes = "") =>
    apiClient
      .post<HusbandryTask>(`/husbandry/tasks/${id}/skip/`, { notes })
      .then((r) => r.data),
  sync: (payload?: { cattle_id?: number }) =>
    apiClient.post("/husbandry/sync/", payload ?? {}).then((r) => r.data),
  settings: () =>
    apiClient.get<Record<string, number | string>>("/husbandry/settings/").then((r) => r.data),
};

export const breedingApi = {
  listEvents: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<BreedingEvent>>("/breeding/events/", { params })
      .then((r) => r.data),
  createEvent: (payload: Partial<BreedingEvent>) =>
    apiClient.post<BreedingEvent>("/breeding/events/", payload).then((r) => r.data),
  listPregnancies: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<Pregnancy>>("/breeding/pregnancies/", { params })
      .then((r) => r.data),
  createPregnancy: (payload: Partial<Pregnancy>) =>
    apiClient.post<Pregnancy>("/breeding/pregnancies/", payload).then((r) => r.data),
  updatePregnancy: (id: number, payload: Partial<Pregnancy>) =>
    apiClient.patch<Pregnancy>(`/breeding/pregnancies/${id}/`, payload).then((r) => r.data),
  listBirths: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Paginated<BirthRecord>>("/breeding/births/", { params }).then((r) => r.data),
  createBirth: (payload: Partial<BirthRecord>) =>
    apiClient.post<BirthRecord>("/breeding/births/", payload).then((r) => r.data),
  herd: () =>
    apiClient.get<BreedingHerdOverview>("/breeding/herd/").then((r) => r.data),
  upcoming: (params?: { days?: number }) =>
    apiClient.get<BreedingUpcomingBoard>("/breeding/upcoming/", { params }).then((r) => r.data),
  cattleHistory: (cattleId: number) =>
    apiClient
      .get<BreedingCattleHistory>(`/breeding/herd/${cattleId}/`)
      .then((r) => r.data),
};

export const financeApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<Transaction>>("/finance/transactions/", { params })
      .then((r) => r.data),
  create: (payload: Partial<Transaction>) =>
    apiClient.post<Transaction>("/finance/transactions/", payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/finance/transactions/${id}/`),
  summary: (params?: { days?: number }) =>
    apiClient.get<FinanceSummary>("/finance/summary/", { params }).then((r) => r.data),
  byCategory: (params?: { days?: number }) =>
    apiClient
      .get<{
        start: string;
        end: string;
        breakdown: Array<{ type: string; category: string; total: string | number }>;
      }>("/finance/by-category/", { params })
      .then((r) => r.data),
};

export const alertsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiClient.get<Paginated<Alert>>("/alerts/", { params }).then((r) => r.data),
  unreadCount: () =>
    apiClient.get<{ unread: number }>("/alerts/unread-count/").then((r) => r.data),
  markRead: (id: number) =>
    apiClient.patch<Alert>(`/alerts/${id}/read/`).then((r) => r.data),
  acknowledge: (id: number) =>
    apiClient.post<Alert>(`/alerts/${id}/acknowledge/`).then((r) => r.data),
  generate: () =>
    apiClient.post<{ created: number }>("/alerts/generate/").then((r) => r.data),
};

export function unwrapList<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}
