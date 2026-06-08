import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { usePatientExtraTabs } from "@/navigation/patientNavVisibility";

type PatientExtrasTabBarProps = {
  activeScreen: string;
};

export function PatientExtrasTabBar({ activeScreen }: PatientExtrasTabBarProps) {
  const tabs = usePatientExtraTabs();
  return <IconTabBar tabs={tabs} activeScreen={activeScreen} />;
}
