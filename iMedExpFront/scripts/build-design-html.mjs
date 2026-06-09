import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const prototypeDir = path.join(root, "prototype");
const indexPath = path.join(prototypeDir, "index.html");
const tokensPath = path.join(prototypeDir, "tokens.css");
const generatedDir = path.join(root, "src", "design", "generated");
const registryPath = path.join(generatedDir, "registry.ts");
const htmlPath = path.join(generatedDir, "designHtml.ts");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const tokensCss = fs.readFileSync(tokensPath, "utf8");

fs.mkdirSync(generatedDir, { recursive: true });

function readAssetDataUri(assetPath) {
  const fullPath = path.join(root, assetPath);
  const prototypePath = path.join(prototypeDir, assetPath);
  if (!fs.existsSync(fullPath)) {
    if (!fs.existsSync(prototypePath)) {
      return assetPath;
    }
    const ext = path.extname(assetPath).toLowerCase();
    const mime = ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "application/octet-stream";
    const data = fs.readFileSync(prototypePath).toString("base64");
    return `data:${mime};base64,${data}`;
  }
  const ext = path.extname(assetPath).toLowerCase();
  const mime = ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "application/octet-stream";
  const data = fs.readFileSync(fullPath).toString("base64");
  return `data:${mime};base64,${data}`;
}

const assetMap = {
  "assets/logo-wordmark.svg": readAssetDataUri("assets/logo-wordmark.svg"),
  "assets/logo-mark.svg": readAssetDataUri("assets/logo-mark.svg"),
  "assets/favicon.svg": readAssetDataUri("assets/favicon.svg")
};

function replaceAssets(value) {
  let next = value;
  for (const [source, target] of Object.entries(assetMap)) {
    next = next.split(source).join(target);
  }
  return next;
}

const scriptFiles = [...indexHtml.matchAll(/<script\s+type="text\/babel"\s+src="([^"]+)"><\/script>/g)].map((match) => match[1]);
const sourceScripts = scriptFiles
  .map((file) => fs.readFileSync(path.join(prototypeDir, file), "utf8"))
  .map(replaceAssets)
  .map((src) => src.split("</script>").join("<\\/script>"))
  .map((src) => `<script type="text/babel">\n${src}\n</script>`)
  .join("\n");

const screens = [];
const sectionPattern = /<DCSection\s+id="([^"]+)"\s+title="([^"]*)"\s+subtitle="([^"]*)"[^>]*>([\s\S]*?)(?=<DCSection\s+id=|<\/DesignCanvas>)/g;
for (const sectionMatch of indexHtml.matchAll(sectionPattern)) {
  const [, sectionId, sectionTitle, sectionSubtitle, sectionBody] = sectionMatch;
  const artboardPattern = /<DCArtboard\s+id="([^"]+)"\s+label="([^"]+)"\s+width=\{(\d+)\}\s+height=\{(\d+)\}[^>]*>\s*<window\.([A-Za-z0-9_]+)\s*\/>/g;
  for (const artboardMatch of sectionBody.matchAll(artboardPattern)) {
    const [, id, label, width, height, componentName] = artboardMatch;
    screens.push({
      id,
      label,
      width: Number(width),
      height: Number(height),
      componentName,
      sectionId,
      sectionTitle,
      sectionSubtitle
    });
  }
}

const registrySource = `export type DesignScreenMeta = {
  id: string;
  label: string;
  width: number;
  height: number;
  componentName: string;
  sectionId: string;
  sectionTitle: string;
  sectionSubtitle: string;
};

export const designScreens = ${JSON.stringify(screens, null, 2)} as const satisfies readonly DesignScreenMeta[];

export const defaultDesignScreenId = ${JSON.stringify(screens[0]?.id ?? "home")};

export function findDesignScreen(id: string | undefined): DesignScreenMeta {
  return designScreens.find((screen) => screen.id === id) ?? designScreens[0];
}
`;

const designCss = replaceAssets(tokensCss);

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <style>
${designCss}
html, body { margin: 0; padding: 0; background: #FFFFFF; font-family: 'Geist', system-ui, sans-serif; overflow-x: hidden; }
#root { min-height: 100vh; overflow: hidden; background: #FFFFFF; }
#imed-screen-scale { transform-origin: top left; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
${sourceScripts}
  <script type="text/babel">
const screenConfig = __IMED_SCREEN_CONFIG__;

function sendToNative(payload) {
  var message = JSON.stringify(payload);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(message);
  } else if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, "*");
  }
}

function collectLoginPayload() {
  const inputs = Array.from(document.querySelectorAll("input"));
  const email = inputs.find((input) => input.type === "email" || String(input.placeholder || "").toLowerCase().includes("correo"))?.value || "";
  const password = inputs.find((input) => input.type === "password")?.value || "";
  return { email, password };
}

function detectIntent(text) {
  const value = text.trim().toLowerCase();
  const compact = screenConfig.width < 720;
  const id = screenConfig.id;
  const choose = (mobile, desktop) => compact ? mobile : desktop;
  const inPatient = id.startsWith("pat-") || id.startsWith("pd-") || id === "patient";
  const inDoctor = id.startsWith("mob-") || id.startsWith("dsk-") || id.startsWith("doc-") || id === "doctor-dash" || id === "doctor-active" || id === "dash-mob" || id === "active-mob";
  const inSuperadmin = id.startsWith("sa-");
  const inDirector = id.startsWith("dir-");
  const inSecretary = id.startsWith("sec-");
  const route = (target) => ({ type: "navigate", target });
  if (value.includes("iniciar sesión") || value.includes("iniciar sesion")) {
    return { type: "login", payload: collectLoginPayload() };
  }
  if (value.includes("crear cuenta") || value.includes("registrarse")) {
    return route(compact ? "reg-role-mob" : "reg-role");
  }
  if (value.includes("volver al sitio")) {
    return route(compact ? "home-mob" : "home");
  }
  if (value.includes("recuperar")) {
    return route(compact ? "recover-mob" : "recover");
  }
  if (value.includes("paciente") && (id.includes("reg") || id.includes("role"))) {
    return route(compact ? "reg-patient-mob" : "reg-patient");
  }
  if ((value.includes("médico") || value.includes("medico")) && (id.includes("reg") || id.includes("role"))) {
    return route(compact ? "reg-doctor-mob" : "reg-doctor");
  }
  if (value.includes("verificar correo")) {
    return route(compact ? "verify-email-mob" : "verify-email");
  }
  const marketing = !inPatient && !inDoctor && !inSuperadmin && !inDirector && !inSecretary;
  if (marketing) {
    if (value.includes("acceder") || value.includes("ingresar") || value.includes("entrar")) {
      return route(compact ? "login-mob" : "login");
    }
    if (value.includes("comenzar") || value.includes("empezar") || value.includes("registr") || value.includes("gratis")) {
      return route(compact ? "reg-role-mob" : "reg-role");
    }
  }
  if (inPatient) {
    if (value.includes("inicio")) return route(choose("pat-inicio", "pd-inicio"));
    if (value.includes("historial")) return route(choose("pat-hist", "pd-hist"));
    if (value.includes("alergia")) return route(choose("pat-alergias", "pd-alergias"));
    if (value.includes("enfermed")) return route(choose("pat-enf", "pd-enf"));
    if (value.includes("cirugía") || value.includes("cirugia")) return route(choose("pat-cirugias", "pd-cirugias"));
    if (value.includes("familia")) return route(choose("pat-familia", "pd-familia"));
    if (value.includes("vacuna")) return route(choose("pat-vacunas", "pd-vacunas"));
    if (value.includes("peso") || value.includes("imc")) return route(choose("pat-peso", "pd-peso"));
    if (value.includes("glucosa")) return route(choose("pat-glucosa", "pd-glucosa"));
    if (value.includes("agendar")) return route(choose("pat-agendar", "pd-agendar"));
    if (value.includes("cita")) return route(choose("pat-citas", "pd-citas"));
    if (value.includes("medicamento")) return route(choose("pat-meds", "pd-meds"));
    if (value.includes("emergencia")) return route(choose("pat-emergency-mob", "pat-emergency"));
    if (value.includes("ciclo")) return route(choose("pat-cycle-mob", "pat-cycle"));
    if (value.includes("qr")) return route(choose("pat-qr-mob", "pat-qr"));
    if (value.includes("signos") || value.includes("vital")) return route(choose("pat-vitals-mob", "pat-vitals"));
    if (value.includes("clínica") || value.includes("clinica")) return route(choose("pat-clinics-mob", "pat-clinics"));
    if (value.includes("aviso") || value.includes("notific")) return route(choose("pat-notifs-mob", "pat-notifs"));
    if (value.includes("perfil")) return route(choose("pat-perfil", "pd-perfil"));
  }
  if (inDoctor) {
    if (value.includes("dashboard") || value.includes("inicio")) return route(choose("dash-mob", "doctor-dash"));
    if (value.includes("paciente")) return route(choose("mob-patients", "dsk-patients"));
    if (value.includes("agenda")) return route(choose("mob-agenda", "dsk-agenda"));
    if (value.includes("consulta")) return route(choose("mob-consultas", "dsk-consultas"));
    if (value.includes("receta")) return route(choose("mob-recetas", "dsk-recetas"));
    if (value.includes("validacion") || value.includes("validación")) return route(choose("mob-validaciones", "dsk-validaciones"));
    if (value.includes("invitacion") || value.includes("invitación")) return route(choose("doc-invites-mob", "doc-invites"));
    if (value.includes("turno") || value.includes("horario")) return route(choose("doc-shifts-mob", "doc-shifts"));
    if (value.includes("qr")) return route(choose("doc-qr-mob", "doc-qr"));
    if (value.includes("signos") || value.includes("vital")) return route(choose("doc-vitals-mob", "doc-vitals"));
    if (value.includes("expediente")) return route(choose("doc-full-mob", "doc-full"));
    if (value.includes("perfil")) return route(choose("mob-profile", "dsk-profile"));
  }
  if (inSuperadmin) {
    if (value.includes("inicio")) return route(choose("sa-dash-mob", "sa-dash"));
    if (value.includes("institucion") || value.includes("institución")) return route(choose("sa-inst-mob", "sa-inst"));
    if (value.includes("administrador")) return route(choose("sa-admins-mob", "sa-admins"));
    if (value.includes("auditor")) return route(choose("sa-audit-mob", "sa-audit"));
    if (value.includes("perfil")) return route(choose("sa-profile-mob", "sa-profile"));
  }
  if (inDirector) {
    if (value.includes("inicio")) return route(choose("dir-dash-mob", "dir-dash"));
    if (value.includes("médico") || value.includes("medico")) return route(choose("dir-doctors-mob", "dir-doctors"));
    if (value.includes("secretaria")) return route(choose("dir-secs-mob", "dir-secs"));
    if (value.includes("invitacion") || value.includes("invitación")) return route(choose("dir-invites-mob", "dir-invites"));
    if (value.includes("asignacion") || value.includes("asignación")) return route(choose("dir-assigns-mob", "dir-assigns"));
    if (value.includes("paciente")) return route(choose("dir-patients-mob", "dir-patients"));
    if (value.includes("config")) return route(choose("dir-settings-mob", "dir-settings"));
    if (value.includes("perfil")) return route(choose("dir-profile-mob", "dir-profile"));
  }
  if (inSecretary) {
    if (value.includes("recepción") || value.includes("recepcion") || value.includes("inicio")) return route(choose("sec-reception-mob", "sec-reception"));
    if (value.includes("paciente")) return route(choose("sec-patients-mob", "sec-patients"));
    if (value.includes("agenda")) return route(choose("sec-agenda-mob", "sec-agenda"));
    if (value.includes("vincular")) return route(choose("sec-link-mob", "sec-link"));
    if (value.includes("perfil")) return route(choose("sec-profile-mob", "sec-profile"));
  }
  return null;
}

function bindNativeBridge() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target) {
      return;
    }
    const interactive = target.closest("button, a, [role='button']");
    if (!interactive) {
      return;
    }
    const intent = detectIntent(interactive.innerText || interactive.textContent || "");
    if (intent) {
      event.preventDefault();
      sendToNative(intent);
    }
  }, true);
}

function fitScreen() {
  const node = document.getElementById("imed-screen-scale");
  if (!node) {
    return;
  }
  const scale = Math.min(window.innerWidth / screenConfig.width, 1);
  node.style.transform = "scale(" + scale + ")";
  node.style.width = screenConfig.width + "px";
  node.style.height = screenConfig.height + "px";
  document.body.style.height = Math.ceil(screenConfig.height * scale) + "px";
}

function App() {
  const Screen = window[screenConfig.componentName];
  if (!Screen) {
    return <div className="imx" style={{ padding: 24 }}>Pantalla no disponible</div>;
  }
  return (
    <div id="imed-screen-scale">
      <Screen />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
requestAnimationFrame(() => {
  fitScreen();
  bindNativeBridge();
  sendToNative({ type: "ready", screen: screenConfig.id });
});
window.addEventListener("resize", fitScreen);
  </script>
</body>
</html>`;

const htmlSource = `import { DesignScreenMeta } from "./registry";

const baseDesignHtml = ${JSON.stringify(html)};

export function createDesignHtml(screen: DesignScreenMeta): string {
  return baseDesignHtml.replace("__IMED_SCREEN_CONFIG__", JSON.stringify(screen));
}
`;

fs.writeFileSync(registryPath, registrySource, "utf8");
fs.writeFileSync(htmlPath, htmlSource, "utf8");
console.log(`Generated ${screens.length} design screens`);
