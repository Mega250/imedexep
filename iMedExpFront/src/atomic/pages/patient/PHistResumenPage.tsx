import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Badge } from "@/atomic/atoms/Badge";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { HistChips } from "@/atomic/organisms/HistChips";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { PatientFull, fetchPatientFull } from "@/services/api/patientsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function calcAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function genderGlyph(value: string | null): string {
  if (!value) {
    return "·";
  }
  const v = value.toLowerCase();
  if (v.startsWith("m")) {
    return "♂";
  }
  if (v.startsWith("f")) {
    return "♀";
  }
  return "·";
}

const DETAIL: { icon: IconKind; title: string; sub: string; screen?: string }[] = [
  { icon: "vax", title: "Vacunas", sub: "ver historial", screen: "pat-vacunas" },
  { icon: "cut", title: "Cirugías", sub: "antecedentes quirúrgicos", screen: "pat-cirugias" },
  { icon: "tree", title: "Antecedentes", sub: "familiares", screen: "pat-familia" }
];

export function PHistResumenPage() {
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const data = await fetchPatientFull(patientId);
        if (!cancelled) {
          setPatient(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu historial.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : "—";
  const initials = patient
    ? `${patient.first_name?.[0] ?? ""}${patient.last_name?.[0] ?? ""}`.toUpperCase()
    : "··";

  function HistHeader(): ReactNode {
    return (
      <>
        <ScreenTopBar
          sub={patient ? `Mi historial · ${patient.first_name}` : "Mi historial"}
          title="Resumen"
        />
        <HistChips active={0} />
      </>
    );
  }

  const idMeta = patient
    ? `${genderGlyph(patient.gender)} ${calcAge(patient.date_of_birth)} años · ${patient.blood_type ?? "—"}${patient.height_cm ? ` · ${patient.height_cm} cm` : ""}${patient.weight_kg ? ` · ${patient.weight_kg} kg` : ""}`
    : "—";

  const signs: [IconKind, string, string | number | null, string][] = patient
    ? [
        ["heart", "Frecuencia", patient.heart_rate, "bpm"],
        ["drop", "Glucosa", patient.glucose_mg_dl, "mg/dL"],
        ["scale", "IMC", patient.bmi, ""],
        ["lung", "Saturación", patient.oxygen_saturation, "%"]
      ]
    : [];

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-hist" />}
      header={<HistHeader />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {patient ? (
        <>
          <FadeIn>
            <Card radius={radii.lg} style={styles.identity}>
              <Avatar
                initials={initials}
                size={42}
                radius={12}
                bg={colors.accentBright}
                fg={colors.ink}
                serif
                fontSize={20}
              />
              <View style={styles.flex}>
                <Text style={styles.idName} numberOfLines={1}>{fullName}</Text>
                <Text style={styles.idMeta} numberOfLines={2}>{idMeta}</Text>
              </View>
              <Badge
                label={patient.glucose_risk ? patient.glucose_risk.toUpperCase() : "SIN DATOS"}
                bg={colors.paper3}
                fg={colors.accentDeep}
                border={colors.paper3}
                fontSize={9.5}
                letterSpacing={0.8}
              />
            </Card>
          </FadeIn>

          <FadeIn delay={190}>
            <SectionLabel label="Última toma" style={styles.section} />
            <View style={styles.signGrid}>
              {signs.map(([icon, label, value, unit]) => (
                <Card key={label} radius={radii.md} style={styles.signCard}>
                  <View style={styles.signHead}>
                    <Icon kind={icon} size={13} color={colors.accentDeep} />
                    <Text style={styles.signLabel}>{label}</Text>
                  </View>
                  <View style={styles.signValueRow}>
                    <Text style={styles.signValue}>
                      {value === null || value === undefined ? "—" : value}
                    </Text>
                    {unit && value !== null ? <Text style={styles.signUnit}>{unit}</Text> : null}
                  </View>
                </Card>
              ))}
            </View>
          </FadeIn>

          <FadeIn delay={250}>
            <SectionLabel label="Más detalle" style={styles.section} />
            <Card radius={radii.lg}>
              {DETAIL.map((item, index) => (
                <Tappable
                  key={item.title}
                  scaleTo={0.99}
                  onPress={() => item.screen && goToScreen(item.screen)}
                  style={[styles.detailRow, index < DETAIL.length - 1 ? styles.rowBorder : null]}
                >
                  <View style={styles.detailIcon}>
                    <Icon kind={item.icon} size={14} color={colors.accentDeep} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.detailTitle}>{item.title}</Text>
                    <Text style={styles.detailSub}>{item.sub}</Text>
                  </View>
                  <Icon kind="chev" size={13} color={colors.ink3} />
                </Tappable>
              ))}
            </Card>
          </FadeIn>
        </>
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 120
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  idName: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  idMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  signGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  signCard: {
    width: "48.5%",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  signHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  signLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  signValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 6
  },
  signValue: {
    fontFamily: family.medium,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink
  },
  signUnit: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  detailTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  detailSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  }
});
