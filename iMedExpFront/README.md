# iMedExp Front

Aplicacion Expo del sistema iMedExp. Los disenos fuente viven en `prototype/` (`screen-*.jsx`, `index.html`, `tokens.css`).

Las pantallas moviles se estan reconstruyendo como componentes React Native nativos siguiendo arquitectura atomic, responsivos y con animaciones. Las pantallas aun no portadas se renderizan via WebView a partir del prototipo (fallback).

## Pantallas nativas

`src/navigation/nativeRegistry.ts` mapea cada `id` de pantalla a su componente nativo. `app/screen/[id].tsx` resuelve el componente nativo o, si no existe, cae al render por WebView.

Avance por fases:

- Fase 1 — Auth movil: `home-mob`, `login-mob`, `reg-role-mob`, `reg-patient-mob`, `reg-doctor-mob`, `recover-mob`, `verify-email-mob`.
- Fase 2 — Paciente movil: `pat-inicio`, `pat-hist`, `pat-alergias`, `pat-enf`, `pat-cirugias`, `pat-familia`, `pat-vacunas`, `pat-peso`, `pat-glucosa`, `pat-citas`, `pat-agendar`, `pat-meds`, `pat-perfil`.
- Fase 3 — Medico movil: `dash-mob`, `active-mob`, `mob-patients`, `mob-agenda`, `mob-consultas`, `mob-recetas`, `mob-validaciones`, `mob-profile`.
- Fase 4 — Extras movil: `doc-invites-mob`, `doc-shifts-mob`, `doc-qr-mob`, `doc-vitals-mob`, `doc-full-mob`, `pat-emergency-mob`, `pat-cycle-mob`, `pat-qr-mob`, `pat-vitals-mob`, `pat-clinics-mob`, `pat-notifs-mob`, `bitacora-mob`, `permisos-mob`.
- Fase 5 — Roles admin movil: director (`dir-*-mob`), secretaria (`sec-*-mob`), superadmin (`sa-*-mob`).

Las 61 pantallas moviles estan portadas a nativo. Las pantallas de escritorio (`*-desktop`, ids sin sufijo `-mob`) siguen via WebView.

## Docker

El flujo diario usa un contenedor ligero con Node 20.19.4 para que Metro y Expo levanten mas rapido en Windows.

```powershell
docker compose up --build
```

Para usar el backend local desde el contenedor:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://host.docker.internal:8000"
docker compose up --build
```

Si Docker Desktop no detecta cambios del volumen montado en Windows:

```powershell
docker compose -f docker-compose.yml -f docker-compose.polling.yml up --build
```

El contenedor con JDK 17 queda separado para tareas nativas o validaciones Android.

```powershell
docker compose -f docker-compose.android.yml build
docker compose -f docker-compose.android.yml run --rm imedexp-front-android
```

Para mayor velocidad en Docker Desktop, la ruta mas rapida suele ser trabajar el repositorio dentro del filesystem de WSL2 y no desde `C:\`.

## Desarrollo local

```powershell
npm install
npm run build:design
npm start
```

## Validacion

```powershell
npm run typecheck
```

## EAS

```powershell
npx eas build --platform android --profile preview
```

## Arquitectura

- `app`: rutas de Expo Router.
- `src/theme`: tokens (`tokens.ts`), tipografia (`typography.ts`) y carga de fuentes (`fonts.ts`).
- `src/atomic/atoms`: elementos base (Icon, Logo, Button, TextField, Badge, Card, Avatar, RadialBlob, FadeIn, Tappable, Switch...).
- `src/atomic/molecules`: componentes compuestos pequenos (FormField, Headline, Stepper, AuthHeader, StatTile, DarkPanel, FAB...).
- `src/atomic/organisms`: componentes funcionales de pantalla (ScreenTopBar, HistChips, PatientTabBar, DoctorTabBar...).
- `src/atomic/templates`: superficies y estructuras (`MobileScreen`).
- `src/atomic/pages`: paginas nativas conectadas a rutas (`auth/`, `patient/`, `doctor/`).
- `src/navigation`: registro de pantallas nativas y helpers de ruteo.
- `src/services`: cliente HTTP y autenticacion.
- `src/state`: persistencia de sesion.
- `src/design/generated`: salida generada desde los disenos originales (WebView fallback).
