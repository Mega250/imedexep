import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  NotAPatientRoleError,
  clearCurrentPatientCache,
  getCurrentPatientFull,
  getCurrentPatientId
} from "@/services/api/currentPatient";
import { ApiError } from "@/services/api/client";
import { PatientFull } from "@/services/api/patientsApi";

type PatientContextValue = {
  patient: PatientFull | null;
  patientId: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (inFlight.current) {
      return inFlight.current;
    }
    setLoading(true);
    setError(null);
    const promise = (async () => {
      try {
        const id = await getCurrentPatientId();
        setPatientId(id);
        const full = await getCurrentPatientFull();
        setPatient(full);
      } catch (err) {
        if (err instanceof NotAPatientRoleError) {
          setPatient(null);
          setPatientId(null);
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
        inFlight.current = null;
      }
    })();
    inFlight.current = promise;
    return promise;
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    clearCurrentPatientCache();
    setPatient(null);
    setPatientId(null);
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<PatientContextValue>(
    () => ({ patient, patientId, loading, error, refresh }),
    [patient, patientId, loading, error, refresh]
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext);
  if (!ctx) {
    return {
      patient: null,
      patientId: null,
      loading: false,
      error: null,
      refresh: async () => {}
    };
  }
  return ctx;
}
