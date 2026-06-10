import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";
import { authedRequest } from "@/services/api/authedRequest";
import { CurrentUser } from "@/services/auth/authApi";
import { getSessionSnapshot, saveSession } from "@/state/sessionStore";

export type TourStep = {
  /** id del ancla a resaltar (registrada con useTourTarget). Sin target = tarjeta centrada. */
  target?: string;
  /** id alterno para pantallas anchas (escritorio); si falta, se usa `target`. */
  targetWide?: string;
  title: string;
  body: string;
};

export type TargetRect = { x: number; y: number; width: number; height: number };

/** Nodo nativo con measureInWindow (View / componentes host de RN y RNW). */
type Measurable = { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;

type OnboardingContextValue = {
  active: boolean;
  steps: TourStep[];
  index: number;
  registerTarget: (id: string, node: Measurable) => void;
  measureCurrent: () => Promise<TargetRect | null>;
  measureTarget: (id?: string) => Promise<TargetRect | null>;
  start: (steps: TourStep[]) => void;
  next: () => void;
  back: () => void;
  finish: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** Persiste la bandera en DB (access_attributes.onboarding_completed) y refresca la sesión local. */
async function persistOnboardingComplete(): Promise<void> {
  try {
    const updated = await authedRequest<CurrentUser>("/api/v1/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ onboarding_completed: true })
    });
    const snap = getSessionSnapshot();
    if (snap.tokens) {
      await saveSession(snap.tokens, updated);
    }
  } catch {
    // Best-effort: si la red falla no bloqueamos al usuario; el tour ya se cerró.
  }
}

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const targets = useRef<Map<string, Measurable>>(new Map());

  const registerTarget = useCallback((id: string, node: Measurable) => {
    if (node) {
      targets.current.set(id, node);
    } else {
      targets.current.delete(id);
    }
  }, []);

  const measureTarget = useCallback((id?: string): Promise<TargetRect | null> => {
    const node = id ? targets.current.get(id) : null;
    if (!node) return Promise.resolve(null);
    // Web: getBoundingClientRect da coords de viewport reales y fiables; el
    // measureInWindow de RNW puede quedar desfasado con ancestros posicionados.
    const domNode = node as unknown as { getBoundingClientRect?: () => DOMRect };
    if (typeof domNode.getBoundingClientRect === "function") {
      const r = domNode.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return Promise.resolve(null);
      return Promise.resolve({ x: r.left, y: r.top, width: r.width, height: r.height });
    }
    return new Promise((resolve) => {
      try {
        node.measureInWindow((x, y, width, height) => {
          if (width === 0 && height === 0) {
            resolve(null);
          } else {
            resolve({ x, y, width, height });
          }
        });
      } catch {
        resolve(null);
      }
    });
  }, []);

  const measureCurrent = useCallback(
    (): Promise<TargetRect | null> => measureTarget(steps[index]?.target),
    [steps, index, measureTarget]
  );

  const start = useCallback((nextSteps: TourStep[]) => {
    if (!nextSteps.length) return;
    setSteps(nextSteps);
    setIndex(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    setIndex(0);
    void persistOnboardingComplete();
  }, []);

  const next = useCallback(() => {
    setIndex((curr) => {
      if (curr >= steps.length - 1) {
        finish();
        return curr;
      }
      return curr + 1;
    });
  }, [steps.length, finish]);

  const back = useCallback(() => {
    setIndex((curr) => Math.max(0, curr - 1));
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ active, steps, index, registerTarget, measureCurrent, measureTarget, start, next, back, finish }),
    [active, steps, index, registerTarget, measureCurrent, measureTarget, start, next, back, finish]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding debe usarse dentro de <OnboardingProvider>");
  }
  return ctx;
}

/** Devuelve un callback-ref para marcar un elemento como ancla del tour. */
export function useTourTarget(id: string) {
  const { registerTarget } = useOnboarding();
  return useCallback(
    (node: Measurable) => registerTarget(id, node),
    [id, registerTarget]
  );
}

/** Recorrido del paciente (v1). El paso sin target se muestra centrado. */
export const PATIENT_TOUR_STEPS: TourStep[] = [
  {
    title: "¡Te damos la bienvenida! 👋",
    body: "Este es tu expediente médico. Te mostramos lo esencial en 20 segundos."
  },
  {
    target: "pat-primary",
    title: "Tu salud, de un vistazo",
    body: "Aquí ves tu resumen y tus accesos rápidos. Todo lo que captures vive en tu expediente."
  },
  {
    target: "nav",
    targetWide: "nav-desktop",
    title: "Tu navegación",
    body: "Desde esta barra entras a tu salud, tus citas, tu QR para compartir con un médico y el asistente."
  }
];
