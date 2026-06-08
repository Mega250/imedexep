import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { PatientFull, fetchPatientFull } from "@/services/api/patientsApi";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import {
  clearSelectedAppointmentId,
  getSelectedAppointmentId
} from "@/services/api/selectedAppointment";
import { patchAppointment } from "@/services/api/appointmentsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const TABS = ["Resumen", "Dx", "Meds", "Cx", "Labs", "Notas"];

function Header(): ReactNode {
  return (
    <View style={styles.nav}>
      <Tappable onPress={() => goBack("dash-mob")} scaleTo={0.95}>
        <View style={styles.backBtn}>
          <Icon kind="arrow-l" size={13} color={colors.ink2} />
          <Text style={styles.backText}>Agenda</Text>
        </View>
      </Tappable>
      <Text style={styles.timer}>CONSULTA · EN VIVO</Text>
      <View style={styles.liveTag}>
        <Text style={styles.liveText}>EN VIVO</Text>
      </View>
    </View>
  );
}

function BentoCell({ k, body, n }: { k: string; body: string; n: string }) {
  return (
    <View style={styles.bentoCell}>
      <View style={styles.bentoTop}>
        <Text style={styles.bentoKey}>{k}</Text>
        <Text style={styles.bentoNum}>{n}</Text>
      </View>
      <Text style={styles.bentoBody}>{body}</Text>
    </View>
  );
}

function initialsFromName(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "··";
}

function ageFrom(dob: string): number | null {
  if (!dob) {
    return null;
  }
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

function sexSymbol(gender: string | null): string {
  if (!gender) {
    return "·";
  }
  const g = gender.toLowerCase();
  if (g.startsWith("f")) {
    return "♀";
  }
  if (g.startsWith("m")) {
    return "♂";
  }
  return "·";
}

export function DoctorActiveMobilePage() {
  const insets = useSafeAreaInsets();
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getSelectedPatientId();
        const selectedAppointmentId = await getSelectedAppointmentId();
        if (id === null) {
          if (!cancelled) {
            setError("Selecciona un paciente desde Pacientes o tu Agenda.");
            setLoading(false);
          }
          return;
        }
        const full = await fetchPatientFull(id);
        if (!cancelled) {
          setPatientId(id);
          setAppointmentId(selectedAppointmentId);
          setPatient(full);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar al paciente.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCloseConsultation() {
    if (closing) {
      return;
    }
    setClosing(true);
    setError(null);
    try {
      if (appointmentId !== null) {
        await patchAppointment(appointmentId, { status: "completed" });
        await clearSelectedAppointmentId();
      }
      goBack("dash-mob");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cerrar la consulta.");
    } finally {
      setClosing(false);
    }
  }

  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : "—";
  const ini = patient ? initialsFromName(patient.first_name, patient.last_name) : "··";
  const age = patient ? ageFrom(patient.date_of_birth) : null;
  const meta = patient
    ? `${sexSymbol(patient.gender)} ${age !== null ? age : "—"}${patient.blood_type ? ` · ${patient.blood_type}` : ""}${
        patient.weight_kg ? ` · ${patient.weight_kg} kg` : ""
      }${patient.height_cm ? ` · ${(patient.height_cm / 100).toFixed(2)} m` : ""}${patient.city ? ` · ${patient.city}` : ""}`
    : "";

  const BENTO: [string, string, string][] = patient
    ? [
        ["IMC", patient.bmi !== null ? String(patient.bmi) : "—", "kg/m²"],
        ["T/A", patient.systolic_bp && patient.diastolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp}` : "—", "mmHg"],
        ["FC", patient.heart_rate !== null ? String(patient.heart_rate) : "—", "lpm"],
        ["Glucosa", patient.glucose_mg_dl !== null ? String(patient.glucose_mg_dl) : "—", "mg/dL"]
      ]
    : [];

  return (
    <MobileScreen
      header={<Header />}
      contentStyle={styles.content}
      floating={
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Tappable scaleTo={0.93} onPress={() => (patientId ? goToScreen("doc-vitals-mob") : undefined)}>
            <View style={styles.penBtn}>
              <Icon kind="pen" size={18} color={colors.ink2} />
            </View>
          </Tappable>
          <View style={styles.flex}>
            <Button
              label={closing ? "Cerrando…" : "Cerrar consulta"}
              iconRight="arrow"
              height={48}
              onPress={handleCloseConsultation}
              disabled={closing}
            />
          </View>
        </View>
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {patient ? (
        <>
          <FadeIn>
            <View style={styles.patientHead}>
              <Avatar
                initials={ini}
                size={52}
                radius={16}
                bg={colors.accent}
                fg={colors.white}
                serif
                fontSize={22}
              />
              <View style={styles.flex}>
                <Text style={styles.eyebrow}>EXPEDIENTE</Text>
                <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{fullName}</Text>
                <Text style={styles.patientMeta} numberOfLines={1} ellipsizeMode="tail">{meta}</Text>
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={70}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabs}
              contentContainerStyle={styles.tabsContent}
            >
              {TABS.map((t, i) => {
                const on = i === 0;
                return (
                  <View
                    key={t}
                    style={[
                      styles.tab,
                      {
                        backgroundColor: on ? colors.ink : colors.white,
                        borderColor: on ? colors.ink : colors.rule
                      }
                    ]}
                  >
                    <Text style={[styles.tabText, { color: on ? colors.paper : colors.ink2 }]}>
                      {t}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </FadeIn>

          <FadeIn delay={130}>
            <View style={styles.bento}>
              <View style={styles.bentoRow}>
                <BentoCell k={BENTO[0][0]} body={BENTO[0][2]} n={BENTO[0][1]} />
                <BentoCell k={BENTO[1][0]} body={BENTO[1][2]} n={BENTO[1][1]} />
              </View>
              <View style={styles.bentoRow}>
                <BentoCell k={BENTO[2][0]} body={BENTO[2][2]} n={BENTO[2][1]} />
                <BentoCell k={BENTO[3][0]} body={BENTO[3][2]} n={BENTO[3][1]} />
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={190}>
            <View style={styles.noteHead}>
              <SectionLabel label="Acciones rápidas" />
            </View>
            <View style={styles.actionsCard}>
              <Tappable scaleTo={0.96} onPress={() => goToScreen("doc-vitals-mob")}>
                <View style={styles.actionRow}>
                  <Icon kind="heart" size={16} color={colors.accentDeep} />
                  <Text style={styles.actionText}>Ver signos vitales</Text>
                  <Icon kind="chev" size={13} color={colors.ink3} />
                </View>
              </Tappable>
              <Tappable scaleTo={0.96} onPress={() => goToScreen("doc-full-mob")}>
                <View style={styles.actionRow}>
                  <Icon kind="doc" size={16} color={colors.accentDeep} />
                  <Text style={styles.actionText}>Ver expediente completo</Text>
                  <Icon kind="chev" size={13} color={colors.ink3} />
                </View>
              </Tappable>
              <Tappable scaleTo={0.96} onPress={() => goToScreen("mob-recetas")}>
                <View style={styles.actionRow}>
                  <Icon kind="pill" size={16} color={colors.accentDeep} />
                  <Text style={styles.actionText}>Recetas</Text>
                  <Icon kind="chev" size={13} color={colors.ink3} />
                </View>
              </Tappable>
            </View>
          </FadeIn>
        </>
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 110
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  loading: {
    paddingVertical: 24,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10,
    textAlign: "center"
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: colors.paper
  },
  backBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  backText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  timer: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.6
  },
  liveTag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accentSoft
  },
  liveText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.accentDeep,
    letterSpacing: 0.5
  },
  patientHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  eyebrow: {
    ...text.eyebrow,
    fontSize: 9.5,
    color: colors.ink3
  },
  patientName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 4
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 3
  },
  tabs: {
    marginTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  tabsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  tab: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  tabText: {
    fontFamily: family.medium,
    fontSize: 11
  },
  bento: {
    marginTop: 14,
    backgroundColor: colors.rule,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    gap: 1
  },
  bentoRow: {
    flexDirection: "row",
    gap: 1
  },
  bentoCell: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  bentoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  bentoKey: {
    ...text.eyebrow,
    fontSize: 9.5,
    color: colors.ink3
  },
  bentoNum: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep
  },
  bentoBody: {
    fontFamily: family.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.ink2,
    marginTop: 4
  },
  noteHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 14,
    marginBottom: 6
  },
  actionsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  actionText: {
    flex: 1,
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: "rgba(241,250,254,0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  penBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  }
});
