export type Role = "OWNER" | "WORKER" | "VETERINARIAN";

export type ModuleKey =
  | "dashboard"
  | "cattle"
  | "milk"
  | "health"
  | "breeding"
  | "husbandry"
  | "finance"
  | "settings"
  | "alerts"
  | "milkWrite"
  | "cattleWrite"
  | "healthWrite"
  | "breedingWrite"
  | "husbandryWrite";

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  role: Role;
  farm: number | null;
  farm_name?: string | null;
  is_active_staff_member: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface Farm {
  id: number;
  name: string;
  location: string;
  region: string;
  woreda: string;
  phone: string;
  notes: string;
  milk_price_per_liter: string | number;
  currency: string;
  milk_income_mode: "ACCRUAL" | "CASH";
  auto_milk_income: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupervisorFarm {
  id: number;
  name: string;
  location: string;
  created_at: string;
  cattle_count: number;
  user_count: number;
}

export interface SupervisorAnalytics {
  total_farms: number;
  total_users: number;
  total_cattle: number;
  total_milk_liters: number;
  farms: SupervisorFarm[];
}

export interface CattleLifeStage {
  code: string;
  label: string;
  focus: boolean;
  category?: "CALF" | "HEIFER" | "COW" | "MALE" | "INACTIVE" | string;
  category_label?: string;
  basis?: string;
  age_days?: number | null;
  age_months?: number | null;
  last_calving_date?: string | null;
  last_insemination_date?: string | null;
  is_pregnant?: boolean;
  awaiting_pregnancy_check?: boolean;
}

export interface HusbandryWindow {
  key: string;
  title: string;
  start: string | null;
  end: string | null;
  ideal: string | null;
  status: "UPCOMING" | "ACTIVE" | "OVERDUE" | "N/A" | string;
  days_until_start: number | null;
  days_until_end: number | null;
  severity: "INFO" | "WARNING" | "CRITICAL" | null;
  message: string;
  description: string;
}

export interface HusbandryWarning {
  code: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | string;
}

export interface HusbandryPlan {
  animal_class: CattleLifeStage;
  settings_used?: Record<string, number>;
  windows: HusbandryWindow[];
  warnings: HusbandryWarning[];
}

export interface Cattle {
  id: number;
  tag_id: string;
  name: string;
  breed: string;
  sex: "FEMALE" | "MALE";
  date_of_birth: string | null;
  status: "ACTIVE" | "SOLD" | "DEAD" | "CULLED";
  mother: number | null;
  father: number | null;
  notes: string;
  photo_url: string | null;
  photo_front_url: string | null;
  photo_left_url: string | null;
  photo_right_url: string | null;
  life_stage?: CattleLifeStage;
  lactation?: CattleLactation;
  next_event?: CattleUpcomingEvent | null;
  husbandry_plan?: HusbandryPlan;
  created_at: string;
  updated_at: string;
}

export type HusbandryTaskType =
  | "WEANING"
  | "FIRST_BREEDING"
  | "HEAT_WATCH"
  | "BREEDING"
  | "PREGNANCY_CHECK"
  | "DRY_OFF"
  | "CALVING_PREP"
  | "CALVING"
  | "FRESH_MONITOR"
  | "REBREEDING"
  | "LACTATION_CHECK"
  | "VACCINATION";

export interface HusbandryTask {
  id: number;
  cattle: number;
  cattle_tag: string;
  task_type: HusbandryTaskType | string;
  task_type_label: string;
  title: string;
  description: string;
  due_date: string;
  status: "PENDING" | "COMPLETED" | "SKIPPED" | "CANCELLED";
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  is_auto: boolean;
  source_key: string;
  related_breeding: number | null;
  related_pregnancy: number | null;
  completed_at: string | null;
  completed_by: number | null;
  completion_notes: string;
  days_until: number;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface HusbandryBoard {
  overdue: HusbandryTask[];
  due_today: HusbandryTask[];
  upcoming: HusbandryTask[];
  counts: {
    overdue: number;
    due_today: number;
    upcoming: number;
  };
}

export interface CattleUpcomingEvent {
  type: "CALVING" | "INSEMINATION" | "DRY_OFF" | "VACCINATION" | string;
  title: string;
  date: string;
  days_until: number;
  description: string;
}

export interface CattleLactation {
  stage: string;
  stage_label: string;
  days_in_milk: number | null;
  last_calving_date: string | null;
  is_pregnant: boolean;
}

export interface CattleMilkSummary {
  lifetime_liters: string | number;
  last_30_days_liters: string | number;
  last_30_days_records: number;
  latest_date: string | null;
  latest_liters: string | number | null;
  average_daily_30: number;
}

export interface CattleDetail extends Cattle {
  age_days: number | null;
  lactation: CattleLactation;
  upcoming_events: CattleUpcomingEvent[];
  milk_summary: CattleMilkSummary;
  breeding_history: {
    events: BreedingEvent[];
    pregnancies: Pregnancy[];
    births: BirthRecord[];
  };
  recent_milk: MilkRecord[];
  alerts: Alert[];
  upcoming_vaccinations: Vaccination[];
  husbandry_tasks: HusbandryTask[];
  latest_bcs: number | null;
  latest_weight: number | null;
  growth_logs: any[];
  pedigree_tree: any;
}

export interface MilkRecord {
  id: number;
  cattle: number;
  cattle_tag: string;
  date: string;
  morning_liters: string;
  evening_liters: string;
  total_liters: string | number;
  recorded_by: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MilkHerdRow {
  cattle_id: number;
  cattle_number: string;
  name: string;
  last_birth_date: string | null;
  average_milk_production: number;
  next_estimated_dry_off: string | null;
  milked_days_current_calving: number | null;
  lactation_stage: string;
  lactation_stage_label: string;
  is_actively_milking: boolean;
  cycle_total_liters: number;
  cycle_record_days: number;
}

export interface MilkHerdOverview {
  count: number;
  results: MilkHerdRow[];
}

export interface MilkCalvingCycle {
  cycle_index: number | null;
  is_current: boolean;
  calving_date: string | null;
  cycle_end: string;
  birth_id: number | null;
  calf_tag_id: string;
  days_in_milk: number | null;
  estimated_dry_off: string | null;
  record_count: number;
  total_liters: number;
  average_daily: number;
  label: string;
  records: MilkRecord[];
}

export interface MilkCattleHistory {
  cattle_id: number;
  cattle_number: string;
  name: string;
  last_birth_date: string | null;
  average_milk_production: number;
  next_estimated_dry_off: string | null;
  milked_days_current_calving: number | null;
  lactation_stage: string;
  lactation_stage_label: string;
  is_actively_milking: boolean;
  cycles: MilkCalvingCycle[];
}

export interface HealthRecord {
  id: number;
  cattle: number;
  cattle_tag: string;
  recorded_at: string;
  symptoms: string[];
  temperature: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  notes: string;
  recorded_by: number | null;
  created_at: string;
}

export interface Vaccination {
  id: number;
  cattle: number;
  cattle_tag: string;
  vaccine_name: string;
  administered_on: string;
  next_due_on: string | null;
  veterinarian_name: string;
  cost: string | number | null;
  notes: string;
  recorded_by: number | null;
  created_at: string;
}

export interface Treatment {
  id: number;
  cattle: number;
  cattle_tag: string;
  diagnosis: string;
  medication: string;
  start_date: string;
  end_date: string | null;
  veterinarian_name: string;
  cost: string | number | null;
  outcome: string;
  notes: string;
  recorded_by: number | null;
  created_at: string;
}

export interface FeedSchedule {
  id: number;
  cattle: number | null;
  cattle_tag: string | null;
  feed_type: string;
  quantity: string | number;
  unit: string;
  date: string;
  quality_score: number | null;
  cost: string | number | null;
  notes: string;
  created_at: string;
}

export interface BreedingEvent {
  id: number;
  dam: number;
  dam_tag: string;
  sire: number | null;
  sire_external_id: string;
  mating_date: string;
  method: "NATURAL" | "AI";
  notes: string;
  created_at: string;
}

export interface Pregnancy {
  id: number;
  cattle: number;
  cattle_tag: string;
  breeding_event: number | null;
  confirmed_on: string | null;
  expected_calving_date: string | null;
  status: "OPEN" | "PREGNANT" | "CALVED" | "FAILED";
  clinical_notes: string;
  sire?: number | null;
  sire_external_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BirthRecord {
  id: number;
  pregnancy: number;
  cattle?: number;
  cattle_tag?: string;
  pregnancy_status?: string;
  expected_calving_date?: string | null;
  calving_date: string;
  calf: number | null;
  calf_tag_id: string;
  calf_sex: string;
  calf_sire?: number;
  calf_sire_external_id?: string;
  complications: string;
  notes: string;
  created_at: string;
}

export interface BreedingNextEvent {
  type: string;
  title: string;
  detail?: string;
  date: string;
  days_until: number;
  is_overdue: boolean;
  priority?: string;
  task_id?: number | null;
}

export interface BreedingHerdRow {
  cattle_id: number;
  cattle_number: string;
  name: string;
  pregnancy_state: "pregnant" | "unconfirmed" | "not_pregnant";
  pregnancy_state_label: string;
  pregnancy_id: number | null;
  pregnancy_status_raw: string | null;
  last_insemination_date: string | null;
  breeding_method: "AI" | "NATURAL" | null;
  days_since_insemination: number | null;
  expected_calving_date: string | null;
  days_to_calving: number | null;
  last_calving_date: string | null;
  days_open: number | null;
  lactation_stage: string;
  lactation_stage_label: string;
  next_event: BreedingNextEvent | null;
  action_hint: string;
  can_confirm_pregnancy: boolean;
  can_record_calving: boolean;
}

export interface BreedingHerdOverview {
  count: number;
  results: BreedingHerdRow[];
}

export interface BreedingUpcomingItem {
  id: number | null;
  cattle: number;
  cattle_number: string;
  cattle_name?: string;
  cattle_tag?: string;
  task_type: string;
  title: string;
  event_title?: string;
  description: string;
  due_date: string;
  days_until: number;
  is_overdue: boolean;
  priority: string;
  status: string;
  pregnancy_state: string;
  pregnancy_state_label: string;
  is_derived?: boolean;
}

export interface BreedingUpcomingBoard {
  overdue: BreedingUpcomingItem[];
  due_today: BreedingUpcomingItem[];
  upcoming: BreedingUpcomingItem[];
  counts: { overdue: number; due_today: number; upcoming: number };
  days: number;
}

export interface BreedingCycle {
  cycle_index: number | null;
  is_current: boolean;
  label: string;
  outcome: string;
  mating: BreedingEvent | null;
  pregnancy: Pregnancy | null;
  birth: BirthRecord | null;
  expected_calving_date: string | null;
  calving_date: string | null;
}

export interface BreedingCattleHistory extends BreedingHerdRow {
  cycles: BreedingCycle[];
  event_count: number;
  pregnancy_count: number;
  birth_count: number;
}

export interface Transaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: string;
  currency: string;
  date: string;
  related_milk_record: number | null;
  description: string;
  is_auto?: boolean;
  source_key?: string | null;
  recorded_by: number | null;
  created_at: string;
}

export interface Alert {
  id: number;
  user: number | null;
  cattle: number | null;
  cattle_tag: string | null;
  category: "MILK" | "HEALTH" | "BREEDING" | "FINANCE" | "SYSTEM";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  is_read: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse extends AuthTokens {
  user: User;
}

export interface MilkSummary {
  period: string;
  start: string;
  end: string;
  total_liters: string | number;
  record_count: number;
  by_cattle: Array<{
    cattle_id: number;
    cattle__tag_id: string;
    liters: string | number;
  }>;
}

export interface MilkTrendPoint {
  date: string;
  liters: string | number;
}

export interface MilkTrends {
  group: string;
  start: string;
  end: string;
  points: MilkTrendPoint[];
}

export interface FinanceSummary {
  start: string;
  end: string;
  income: string | number;
  expense: string | number;
  profit: string | number;
  currency: string;
  mode?: "ACCRUAL" | "CASH";
  milk?: {
    price_per_liter: string | number;
    currency: string;
    mode: "ACCRUAL" | "CASH";
    auto_enabled: boolean;
    liters: string | number;
    valued_income: string | number;
    auto_income_booked: string | number;
    cash_sales: string | number;
    period_milk_income: string | number;
    today_liters: string | number;
    today_milk_value: string | number;
  };
}

export interface ApiErrorShape {
  message: string;
  fieldErrors: Record<string, string[]>;
  status?: number;
}
