import { useEffect, useMemo, useState } from "react";
import { TabItem } from "@/atomic/organisms/IconTabBar";
import { DesktopNavItem, patientNav } from "@/navigation/desktopNavConfigs";
import { patientExtrasTabs } from "@/navigation/tabConfigs";
import { getCurrentPatient } from "@/services/api/currentPatient";

export function isFemaleGender(gender: string | null | undefined): boolean {
  if (!gender) return false;
  const value = gender.trim().toLowerCase();
  return value === "f" || value === "female" || value === "femenino" || value === "mujer";
}

export function patientDesktopNavForGender(
  gender: string | null | undefined
): DesktopNavItem[] {
  return isFemaleGender(gender)
    ? patientNav
    : patientNav.filter((tab) => tab.screen !== "pat-cycle");
}

export function patientExtraTabsForGender(gender: string | null | undefined): TabItem[] {
  return isFemaleGender(gender)
    ? patientExtrasTabs
    : patientExtrasTabs.filter((tab) => tab.screen !== "pat-cycle-mob");
}

export function useCurrentPatientGender(): string | null {
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patient = await getCurrentPatient();
        if (!cancelled) {
          setGender(patient.gender ?? null);
        }
      } catch {
        if (!cancelled) {
          setGender(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return gender;
}

export function usePatientDesktopNav(): DesktopNavItem[] {
  const gender = useCurrentPatientGender();
  return useMemo(() => patientDesktopNavForGender(gender), [gender]);
}

export function usePatientExtraTabs(): TabItem[] {
  const gender = useCurrentPatientGender();
  return useMemo(() => patientExtraTabsForGender(gender), [gender]);
}
