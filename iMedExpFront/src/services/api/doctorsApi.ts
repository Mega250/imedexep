import { authedRequest } from "@/services/api/authedRequest";
import { ListResponse, PageQuery } from "@/services/api/types";
import { toQueryString } from "@/services/api/query";

export type Doctor = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  general_license: string;
  specialty_id: number | null;
  sub_specialty_id: number | null;
  specialty_license: string | null;
  graduation_university: string | null;
  contact_phone: string | null;
  office_location: string | null;
  institution_id: number | null;
  clearance_level: number;
  is_active?: boolean;
  created_at: string;
};

export type DoctorActiveResponse = {
  doctor_id: number;
  user_id: number;
  is_active: boolean;
};

export type DoctorListQuery = PageQuery & {
  institution_id?: number;
};

export type DoctorShift = {
  id: number;
  doctor_id: number;
  institution_id: number | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  shift_type: string | null;
  created_at?: string;
};

export type DoctorShiftCreate = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  location?: string | null;
  shift_type?: string | null;
  institution_id?: number | null;
};

type DoctorShiftApi = {
  id: number;
  doctor_id: number;
  institution_id?: number | null;
  weekday?: number;
  day_of_week?: number;
  start_time: string;
  end_time: string;
  assigned_office?: string | null;
  location?: string | null;
  shift_type?: string | null;
  created_at?: string;
};

function normalizeShift(raw: DoctorShiftApi): DoctorShift {
  return {
    id: raw.id,
    doctor_id: raw.doctor_id,
    institution_id: raw.institution_id ?? null,
    day_of_week: raw.day_of_week ?? raw.weekday ?? 0,
    start_time: raw.start_time,
    end_time: raw.end_time,
    location: raw.location ?? raw.assigned_office ?? null,
    shift_type: raw.shift_type ?? "Consulta",
    created_at: raw.created_at
  };
}

export type DoctorUpdate = Partial<Pick<
  Doctor,
  | "first_name"
  | "last_name"
  | "specialty_license"
  | "graduation_university"
  | "contact_phone"
  | "office_location"
>>;

export function fetchDoctors(query: DoctorListQuery = {}): Promise<ListResponse<Doctor>> {
  return authedRequest<ListResponse<Doctor>>(`/api/v1/doctors/${toQueryString(query)}`, {
    method: "GET"
  });
}

export function fetchAvailableDoctors(
  query: PageQuery = {}
): Promise<ListResponse<Doctor>> {
  return authedRequest<ListResponse<Doctor>>(
    `/api/v1/doctors/available${toQueryString(query)}`,
    { method: "GET" }
  );
}

export function fetchDoctorsList(query: DoctorListQuery = {}): Promise<ListResponse<Doctor>> {
  return fetchDoctors(query);
}

export function fetchDoctor(doctorId: number): Promise<Doctor> {
  return authedRequest<Doctor>(`/api/v1/doctors/${doctorId}`, { method: "GET" });
}

export function updateDoctor(doctorId: number, payload: DoctorUpdate): Promise<Doctor> {
  return authedRequest<Doctor>(`/api/v1/doctors/${doctorId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deactivateDoctor(doctorId: number): Promise<void> {
  return authedRequest<void>(`/api/v1/doctors/${doctorId}`, { method: "DELETE" });
}

export function setDoctorActive(doctorId: number, isActive: boolean): Promise<DoctorActiveResponse> {
  return authedRequest<DoctorActiveResponse>(`/api/v1/doctors/${doctorId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive })
  });
}

export function unlinkDoctorFromInstitution(doctorId: number): Promise<void> {
  return authedRequest<void>(`/api/v1/doctors/${doctorId}/institution`, { method: "DELETE" });
}

export async function fetchDoctorShifts(doctorId: number): Promise<DoctorShift[]> {
  const raw = await authedRequest<DoctorShiftApi[]>(`/api/v1/doctors/${doctorId}/shifts`, {
    method: "GET"
  });
  return raw.map(normalizeShift);
}

export async function createDoctorShift(doctorId: number, payload: DoctorShiftCreate): Promise<DoctorShift> {
  const raw = await authedRequest<DoctorShiftApi>(`/api/v1/doctors/${doctorId}/shifts`, {
    method: "POST",
    body: JSON.stringify({
      institution_id: payload.institution_id ?? null,
      weekday: payload.day_of_week,
      start_time: payload.start_time,
      end_time: payload.end_time,
      assigned_office: payload.location ?? "Consultorio Propio",
      shift_type: payload.shift_type ?? "Consulta"
    })
  });
  return normalizeShift(raw);
}
