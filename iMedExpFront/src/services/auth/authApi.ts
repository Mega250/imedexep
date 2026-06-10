import { apiRequest } from "@/services/api/client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type MessageResponse = {
  message: string;
};

export type VerificationStatusResponse = {
  message: string;
  expires_at: string;
  next_resend_at: string;
  attempts_in_window: number;
  debug_code?: string | null;
};

export type CurrentUser = {
  id: number;
  email: string;
  role: string;
  institution_id: number | null;
  is_active: boolean;
  display_name?: string | null;
  access_attributes?: Record<string, unknown> | null;
};

export type UserProfileUpdate = {
  display_name?: string | null;
  phone?: string | null;
};

export type PatientRegisterRequest = {
  email: string;
  password: string;
  registrado: boolean;
  curp: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string | null;
  blood_type?: string | null;
  phone?: string | null;
  street_address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  health_questionnaire?: Record<string, unknown> | null;
};

export type DoctorRegisterRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  general_license: string;
  specialty_license?: string | null;
  specialty_id: number;
  sub_specialty_id?: number | null;
  graduation_university?: string | null;
  contact_phone?: string | null;
  office_location?: string | null;
  institution_id?: number | null;
  clearance_level?: number;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type ResendCodeRequest = {
  email: string;
};

export type RefreshRequest = {
  refresh_token?: string;
};

export function login(payload: LoginRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(token: string): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/api/v1/auth/me", {
    method: "GET",
    token
  });
}

export function updateCurrentUser(token: string, payload: UserProfileUpdate): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/api/v1/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function registerPatient(payload: PatientRegisterRequest): Promise<VerificationStatusResponse> {
  return apiRequest<VerificationStatusResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function registerDoctor(payload: DoctorRegisterRequest): Promise<VerificationStatusResponse> {
  return apiRequest<VerificationStatusResponse>("/api/v1/auth/register-doctor", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function verifyEmail(payload: VerifyEmailRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resendCode(payload: ResendCodeRequest): Promise<VerificationStatusResponse> {
  return apiRequest<VerificationStatusResponse>("/api/v1/auth/resend-code", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function refreshTokens(payload: RefreshRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export type CurpCheckResponse = { available: boolean };

export function checkCurpAvailability(curp: string): Promise<CurpCheckResponse> {
  return apiRequest<CurpCheckResponse>(
    `/api/v1/auth/check-curp?curp=${encodeURIComponent(curp)}`,
    { method: "GET" }
  );
}

export function logoutSession(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/logout", {
    method: "POST"
  });
}

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  new_password: string;
};

export function requestPasswordRecovery(
  payload: ForgotPasswordRequest
): Promise<VerificationStatusResponse> {
  return apiRequest<VerificationStatusResponse>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export type CedulaVerifyStatus = "found" | "not_found" | "unverified";
export type CedulaArea = "health" | "non_health" | "unknown";

export type CedulaVerifyResponse = {
  status: CedulaVerifyStatus;
  titulo?: string | null;
  area?: CedulaArea;
  nombre?: string | null;
  paterno?: string | null;
  materno?: string | null;
  institucion?: string | null;
  anio?: string | null;
};

export function verifyCedula(cedula: string): Promise<CedulaVerifyResponse> {
  return apiRequest<CedulaVerifyResponse>(
    `/api/v1/doctors/verify-cedula?cedula=${encodeURIComponent(cedula)}`,
    { method: "GET" }
  );
}
