# iMedExp Backend Contract

## Runtime

The repository uses `docker-compose.yaml` as the main Compose file. There is no `docker-compose.yml` in the workspace.

Run the development stack:

```bash
docker compose -f docker-compose.yaml up --build
```

Run the deterministic test stack:

```bash
docker compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
```

Run collected tests one by one in Docker:

```bash
bash scripts/linux/run_docker_tests_individual.sh
```

On Windows PowerShell:

```powershell
.\scripts\windows\run_docker_tests_individual.ps1
```

## Configuration

Set `POSTGRES_USER=app_api` and `POSTGRES_PASSWORD` to the password assigned by the database init scripts. The SQL bootstrap creates `app_api` as a login role and grants only the required application permissions.

Development CORS defaults allow:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Production must set `CORS_ALLOW_ORIGINS` explicitly. Email delivery is disabled unless `MAIL_ENABLED=true`.

The previously exposed mail password in local examples must be rotated.

## Authentication

Use `Authorization: Bearer <access_token>` for protected endpoints. Refresh tokens are accepted only by `/api/v1/auth/refresh`.

### Auth Routes

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | Public | `TokenResponse` |
| POST | `/api/v1/auth/refresh` | Public | `TokenResponse` |
| GET | `/api/v1/auth/me` | Any authenticated user | `UserMeResponse` |
| POST | `/api/v1/auth/register` | Public | `MessageResponse` |
| POST | `/api/v1/auth/verify-email` | Public | `TokenResponse` |
| POST | `/api/v1/auth/resend-code` | Public | `MessageResponse` |
| POST | `/api/v1/auth/register-doctor` | Public bootstrap | `MessageResponse` |

Secretary creation is canonical only at `POST /api/v1/secretary/`.

## Canonical Endpoint Map

### Appointments

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/appointments/` | Authenticated staff |
| GET | `/api/v1/appointments/` | Authenticated user with RLS access |
| GET | `/api/v1/appointments/{appointment_id}` | Authenticated user with RLS access |
| PATCH | `/api/v1/appointments/{appointment_id}` | Authenticated user with RLS access |
| DELETE | `/api/v1/appointments/{appointment_id}` | doctor, secretary, institution_admin, superadmin |

### Consultations

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/consultations/` | doctor |
| GET | `/api/v1/consultations/` | Authenticated user with RLS access |
| GET | `/api/v1/consultations/{consultation_id}` | Authenticated user with RLS access |
| POST | `/api/v1/consultations/{consultation_id}/diagnosis` | doctor |
| GET | `/api/v1/consultations/{consultation_id}/diagnosis` | Authenticated user with RLS access |

Prescription routes under `/api/v1/consultations/...` were removed. Use `/api/v1/prescriptions/...`.

### Prescriptions

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/prescriptions/consultation/{consultation_id}` | doctor |
| GET | `/api/v1/prescriptions/consultation/{consultation_id}` | Authenticated user with RLS access |
| GET | `/api/v1/prescriptions/{prescription_id}` | Authenticated user with RLS access |
| POST | `/api/v1/prescriptions/{prescription_id}/treatments` | doctor |
| GET | `/api/v1/prescriptions/{prescription_id}/treatments` | Authenticated user with RLS access |
| PATCH | `/api/v1/prescriptions/{prescription_id}/sign` | doctor |

### Patients

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/patients/` | Authenticated user with RLS access |
| GET | `/api/v1/patients/` | Authenticated user with RLS access |
| GET | `/api/v1/patients/{patient_id}` | Authenticated user with RLS access |
| GET | `/api/v1/patients/{patient_id}/full` | Authenticated user with RLS access |
| PATCH | `/api/v1/patients/{patient_id}` | Authenticated user with RLS access |
| DELETE | `/api/v1/patients/{patient_id}` | doctor, institution_admin, superadmin |

### Doctors

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/doctors/` | Authenticated user with RLS access |
| GET | `/api/v1/doctors/` | Authenticated user with RLS access |
| GET | `/api/v1/doctors/institution` | institution_admin |
| GET | `/api/v1/doctors/{doctor_id}` | Authenticated user with RLS access |
| GET | `/api/v1/doctors/{doctor_id}/full` | Authenticated user with RLS access |
| PATCH | `/api/v1/doctors/{doctor_id}` | Authenticated user with RLS access |
| DELETE | `/api/v1/doctors/{doctor_id}` | institution_admin, superadmin |
| POST | `/api/v1/doctors/{doctor_id}/shifts` | Authenticated user with RLS access |
| GET | `/api/v1/doctors/{doctor_id}/shifts` | Authenticated user with RLS access |

### Institutions And Secretaries

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/institutions/` | superadmin |
| GET | `/api/v1/institutions/` | superadmin |
| GET | `/api/v1/institutions/{institution_id}` | superadmin |
| PATCH | `/api/v1/institutions/{institution_id}` | superadmin |
| DELETE | `/api/v1/institutions/{institution_id}` | superadmin |
| POST | `/api/v1/institutions/{institution_id}/admins` | superadmin |
| GET | `/api/v1/institutions/{institution_id}/admins` | superadmin |
| PATCH | `/api/v1/institutions/{institution_id}/admins/{admin_id}` | superadmin |
| DELETE | `/api/v1/institutions/{institution_id}/admins/{admin_id}` | superadmin |
| POST | `/api/v1/secretary/` | institution_admin |
| GET | `/api/v1/secretary/` | institution_admin |
| DELETE | `/api/v1/secretary/{secretary_id}` | institution_admin |
| POST | `/api/v1/secretary/{secretary_id}/doctors` | institution_admin |
| GET | `/api/v1/secretary/assignments` | institution_admin |

### Other Clinical And Catalog Routes

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/v1/medications/search?q={text}` | Public catalog |
| POST | `/api/v1/menstrual-cycles/` | doctor, institution_admin, superadmin, patient |
| GET | `/api/v1/menstrual-cycles/patient/{patient_id}` | Authenticated user with RLS access |
| GET | `/api/v1/menstrual-cycles/patient/{patient_id}/prediction` | Authenticated user with RLS access |
| DELETE | `/api/v1/menstrual-cycles/{cycle_id}` | doctor, institution_admin, superadmin, patient |
| POST | `/api/v1/vitals/` | doctor, institution_admin, superadmin |
| GET | `/api/v1/vitals/patient/{patient_id}` | Authenticated user with RLS access |
| GET | `/api/v1/vitals/patient/{patient_id}/latest` | Authenticated user with RLS access |
| POST | `/api/v1/emergency-contacts/{patient_id}` | secretary, institution_admin, superadmin, patient |
| GET | `/api/v1/emergency-contacts/{patient_id}` | Authenticated user with RLS access |
| PATCH | `/api/v1/emergency-contacts/{contact_id}` | Authenticated user with RLS access |
| DELETE | `/api/v1/emergency-contacts/{contact_id}` | secretary, institution_admin, superadmin, patient |
| POST | `/api/v1/patient-institution/` | secretary, institution_admin, superadmin |
| GET | `/api/v1/patient-institution/{patient_id}` | Authenticated user with RLS access |
| DELETE | `/api/v1/patient-institution/{patient_id}/{institution_id}` | secretary, institution_admin, superadmin |
| POST | `/api/v1/invitations/` | institution_admin |
| PATCH | `/api/v1/invitations/{invitation_id}` | doctor |
| POST | `/api/v1/qr-access/generate` | patient |
| POST | `/api/v1/qr-access/redeem` | doctor, secretary, institution_admin, superadmin |
| GET | `/health` | Public |

## Medication Search Response

`GET /api/v1/medications/search` returns catalog rows using the database column names:

```json
{
  "id": 1,
  "generic_name": "Paracetamol",
  "commercial_name": "Tempra",
  "presentation": "Tableta 500mg",
  "administration_route": "oral",
  "display_name": "Paracetamol (Tempra) Tableta 500mg oral"
}
```

Search matches `generic_name`, `commercial_name`, `presentation`, and `administration_route`.

## Menstrual Cycle Prediction

`GET /api/v1/menstrual-cycles/patient/{patient_id}/prediction` returns the next expected period dates, a prediction window, regularity classification, confidence, recent cycle lengths, and model metadata.

The prediction model is personalized per patient. It handles regular cycles with narrow windows and irregular cycles with lower confidence and wider windows. The endpoint is clinical decision support, not a diagnostic result.
