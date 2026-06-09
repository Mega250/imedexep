# Ejemplos de implementacion frontend

## Proposito

Este apartado documenta una forma practica y segura de consumir el backend de iMedExp desde una aplicacion frontend. Los ejemplos estan orientados a un proyecto React con TypeScript, aunque el mismo contrato HTTP puede aplicarse en Angular, Vue, React Native o una aplicacion movil nativa.

La integracion debe conservar tres reglas principales: centralizar la URL base de la API, adjuntar el token de acceso solo cuando el endpoint lo requiera y manejar errores de validacion sin exponer informacion clinica sensible en consola o pantallas publicas.

## Variables de entorno frontend

El frontend debe mantener su propia configuracion de entorno. En Vite se recomienda definir la URL base con el prefijo `VITE_`.

```env
VITE_API_BASE_URL=http://localhost:8000
```

En despliegue productivo, el valor debe apuntar al dominio HTTPS publicado por el ingress o balanceador de carga.

## Cliente HTTP base

El cliente HTTP centraliza encabezados, serializacion JSON, lectura de errores y autorizacion por token.

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type ApiErrorBody = {
  detail?: string;
};

export type ApiRequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({} as ApiErrorBody));
    throw new Error(body.detail ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
```

## Inicio de sesion

El endpoint de autenticacion retorna token de acceso, token de renovacion y tipo de token. El frontend debe almacenar los tokens en un mecanismo definido por la politica del proyecto, preferentemente con controles de expiracion y cierre de sesion.

```ts
import { apiRequest } from "./apiRequest";

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export function login(payload: LoginRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
```

## Consulta del usuario autenticado

La pantalla principal puede usar `/api/v1/auth/me` para obtener identidad, rol, institucion activa y estado de la cuenta antes de mostrar modulos clinicos.

```ts
import { apiRequest } from "./apiRequest";

export type CurrentUser = {
  id: number;
  email: string;
  role: string;
  institution_id: number | null;
  is_active: boolean;
};

export function getCurrentUser(token: string): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/api/v1/auth/me", {
    method: "GET",
    token
  });
}
```

## Registro de ciclo menstrual

El modulo de salud menstrual puede enviar registros manuales al endpoint `/api/v1/menstrual-cycles/`. Las fechas deben enviarse en formato ISO `YYYY-MM-DD`.

```ts
import { apiRequest } from "./apiRequest";

export type MenstrualCycleCreate = {
  patient_id: number;
  period_start_date: string;
  period_end_date?: string;
  flow?: "spotting" | "light" | "medium" | "heavy";
  symptoms: Record<string, string | number | boolean | string[]>;
  notes?: string;
  source: string;
};

export type MenstrualCycleResponse = MenstrualCycleCreate & {
  id: number;
  created_at: string;
  duration_days: number | null;
};

export function createMenstrualCycle(token: string, payload: MenstrualCycleCreate): Promise<MenstrualCycleResponse> {
  return apiRequest<MenstrualCycleResponse>("/api/v1/menstrual-cycles/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}
```

## Prediccion menstrual

La prediccion se consulta por paciente y puede alimentar una tarjeta de calendario o una vista de metricas personales.

```ts
import { apiRequest } from "./apiRequest";

export type MenstrualPrediction = {
  patient_id: number;
  as_of: string;
  regularity: string;
  average_cycle_length_days: number | null;
  cycle_length_stddev_days: number | null;
  predicted_cycle_length_days: number;
  predicted_period_duration_days: number;
  predicted_next_period_start: string;
  predicted_next_period_end: string;
  prediction_window_start: string;
  prediction_window_end: string;
  confidence: number;
  recent_cycle_lengths_days: number[];
  warnings: string[];
  model: {
    name: string;
    version: string;
    training_sample_size: number;
    features: string[];
  };
};

export function getMenstrualPrediction(token: string, patientId: number): Promise<MenstrualPrediction> {
  return apiRequest<MenstrualPrediction>(`/api/v1/menstrual-cycles/patient/${patientId}/prediction`, {
    method: "GET",
    token
  });
}
```

## Generacion de acceso QR

El acceso QR permite generar un codigo temporal para consultar datos resumidos del expediente segun las reglas del backend.

```ts
import { apiRequest } from "./apiRequest";

export type QRAccessResponse = {
  id: number;
  patient_id: number;
  verification_code: string;
  expires_at: string;
  created_at: string;
};

export function generateQrAccess(token: string, institutionId: number): Promise<QRAccessResponse> {
  return apiRequest<QRAccessResponse>("/api/v1/qr-access/generate", {
    method: "POST",
    token,
    body: JSON.stringify({
      institution_id: institutionId
    })
  });
}
```

## Redencion de acceso QR

El personal autorizado puede redimir un codigo y recibir un resumen del paciente cuando el codigo es valido y no ha expirado.

```ts
import { apiRequest } from "./apiRequest";

export type QrPatientSummary = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string | null;
  blood_type: string | null;
  city: string | null;
  state: string | null;
};

export type QrRedeemResponse = {
  message: string;
  patient: QrPatientSummary;
};

export function redeemQrAccess(token: string, verificationCode: string, institutionId?: number): Promise<QrRedeemResponse> {
  return apiRequest<QrRedeemResponse>("/api/v1/qr-access/redeem", {
    method: "POST",
    token,
    body: JSON.stringify({
      verification_code: verificationCode,
      institution_id: institutionId
    })
  });
}
```

## Creacion de cita

El modulo de agenda debe enviar la fecha de cita en formato ISO completo. La validacion del backend rechaza fechas pasadas.

```ts
import { apiRequest } from "./apiRequest";

export type AppointmentCreate = {
  patient_id: number;
  doctor_id: number;
  institution_id: number;
  scheduled_at: string;
  reason?: string;
};

export type AppointmentResponse = AppointmentCreate & {
  id: number;
  created_by_user_id: number;
  status: string;
  created_at: string;
};

export function createAppointment(token: string, payload: AppointmentCreate): Promise<AppointmentResponse> {
  return apiRequest<AppointmentResponse>("/api/v1/appointments/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}
```

## Manejo de estado en una pantalla React

El siguiente ejemplo muestra una pantalla simple de consulta del usuario actual. El estado de carga y el error se mantienen separados para facilitar mensajes claros al usuario final.

```tsx
import { useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "./authService";

type CurrentUserPanelProps = {
  token: string;
};

export function CurrentUserPanel({ token }: CurrentUserPanelProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getCurrentUser(token)
      .then((response) => {
        if (active) {
          setUser(response);
          setError(null);
        }
      })
      .catch((requestError: Error) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <p>Cargando usuario...</p>;
  }

  if (error) {
    return <p>No fue posible cargar la sesion.</p>;
  }

  if (!user) {
    return <p>Sesion no disponible.</p>;
  }

  return (
    <section>
      <h2>{user.email}</h2>
      <p>{user.role}</p>
    </section>
  );
}
```

## Recomendaciones de integracion

- Usar HTTPS en todos los ambientes compartidos.
- Renovar el token de acceso mediante `/api/v1/auth/refresh` antes de forzar un nuevo inicio de sesion.
- Evitar registrar en consola respuestas completas de expedientes, codigos QR o datos clinicos.
- Centralizar validaciones de formularios con los mismos limites principales del backend.
- Separar vistas por rol para que paciente, doctor, secretaria, administrador institucional y superadmin solo vean las operaciones autorizadas.
- Mostrar mensajes de error funcionales sin revelar detalles internos de infraestructura, SQL, tokens o reglas de seguridad.
