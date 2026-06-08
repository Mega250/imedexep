import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { ConsultationSummary, fetchConsultations } from "@/services/api/consultationsApi";
import { Prescription, fetchPrescriptionsByConsultation } from "@/services/api/prescriptionsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type EnrichedRx = {
  rx: Prescription;
  consultation: ConsultationSummary;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const now = new Date();
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return `Hoy · ${hh}:${mm}`;
  }
  return `${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function Header(): ReactNode {
  return (
    <ScreenTopBar
      sub="Recetas firmadas"
      title="Mis Recetas"
      right={<RoundIconButton icon="search" variant="ghost" />}
    />
  );
}

export function MRecetasPage() {
  const [enriched, setEnriched] = useState<EnrichedRx[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doctorId = await getCurrentDoctorId();
        const [cons, plist] = await Promise.all([
          fetchConsultations({ doctor_id: doctorId, page: 1, limit: 30 }),
          fetchPatientsList({ page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 }))
        ]);
        const map: Record<number, Patient> = {};
        for (const p of plist.items ?? []) {
          map[p.id] = p;
        }
        const recent = (cons.items ?? [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 15);
        const results: EnrichedRx[] = [];
        await Promise.all(
          recent.map(async (c) => {
            try {
              const rxs = await fetchPrescriptionsByConsultation(c.id);
              for (const rx of rxs) {
                results.push({ rx, consultation: c });
              }
            } catch {
              return;
            }
          })
        );
        results.sort((a, b) => new Date(b.rx.created_at).getTime() - new Date(a.rx.created_at).getTime());
        if (!cancelled) {
          setPatients(map);
          setEnriched(results);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus recetas.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const todayCount = enriched.filter(({ rx }) => {
    const d = new Date(rx.created_at);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={4} />}
      header={<Header />}
      floating={<FAB icon="plus" label="Nueva receta" />}
      contentStyle={styles.content}
    >
      <View style={styles.statRow}>
        <Card radius={radii.lg} background={colors.paper3} border={colors.accentRule} style={styles.statCard}>
          <SectionLabel label="Hoy" />
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statSub}>recetas</Text>
        </Card>
        <Card radius={radii.lg} style={styles.statCard}>
          <SectionLabel label="Recientes" />
          <Text style={styles.statValue}>{enriched.length}</Text>
          <Text style={styles.statSub}>cargadas</Text>
        </Card>
        <Card radius={radii.lg} style={styles.statCard}>
          <SectionLabel label="Firma" />
          <Text style={styles.statValue}>✓</Text>
          <Text style={styles.statSub}>activa</Text>
        </Card>
      </View>

      <SectionLabel label="Recientes" style={styles.recentLabel} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {!loading && !error && enriched.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin recetas aún.</Text>
          <Text style={styles.emptyMeta}>Las recetas que firmes aparecerán aquí.</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {enriched.map(({ rx }, index) => {
          const patient = patients[rx.patient_id];
          const name = patient ? `${patient.first_name} ${patient.last_name}` : `Paciente #${rx.patient_id}`;
          const signed = !!rx.signed_at;
          return (
            <FadeIn key={rx.id} delay={index * 40}>
              <Card radius={radii.md} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.flex}>
                    <Text style={styles.patient} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
                    <Text style={styles.folio} numberOfLines={1} ellipsizeMode="tail">
                      RX·{rx.id} · {formatDateTime(rx.created_at)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusTag,
                      { backgroundColor: signed ? colors.paper3 : colors.paper2 }
                    ]}
                  >
                    {signed ? <Icon kind="check" size={10} color={colors.accentDeep} /> : null}
                    <Text
                      style={[
                        styles.statusText,
                        { color: signed ? colors.accentDeep : colors.ink2 }
                      ]}
                    >
                      {signed ? "firmada" : "borrador"}
                    </Text>
                  </View>
                </View>
                <View style={styles.drugs}>
                  {rx.items.length === 0 ? (
                    <Text style={styles.drugFreq}>sin medicamentos</Text>
                  ) : (
                    rx.items.map((d) => (
                      <View key={d.id} style={styles.drugRow}>
                        <Icon kind="pill" size={12} color={colors.ink3} />
                        <Text style={styles.drugName} numberOfLines={1} ellipsizeMode="tail">
                          {d.medication_name}{" "}
                          {d.dose ? <Text style={styles.drugDose}>{d.dose}</Text> : null}
                        </Text>
                        <Text style={styles.drugFreq} numberOfLines={1} ellipsizeMode="tail">{d.frequency ?? ""}</Text>
                      </View>
                    ))
                  )}
                </View>
                <View style={styles.cardFoot}>
                  <Tappable scaleTo={0.94}>
                    <View style={styles.footBtn}>
                      <Icon kind="download" size={11} color={colors.ink2} />
                      <Text style={styles.footBtnText}>PDF</Text>
                    </View>
                  </Tappable>
                  <Tappable scaleTo={0.94}>
                    <View style={styles.footBtn}>
                      <Icon kind="share" size={11} color={colors.ink2} />
                      <Text style={styles.footBtnText}>Enviar</Text>
                    </View>
                  </Tappable>
                  <View style={styles.flex} />
                  <Text style={styles.valid} numberOfLines={1} ellipsizeMode="tail">{rx.notes ?? ""}</Text>
                </View>
              </Card>
            </FadeIn>
          );
        })}
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 26,
    letterSpacing: -0.8,
    color: colors.ink,
    marginTop: 4
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 4
  },
  recentLabel: {
    marginTop: 18,
    marginBottom: 8
  },
  loading: {
    paddingVertical: 18,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  emptyMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  list: {
    gap: 8
  },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8
  },
  patient: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  folio: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2,
    letterSpacing: 0.3
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  statusText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  drugs: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.rule2,
    gap: 4
  },
  drugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  drugName: {
    flex: 1,
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  drugDose: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  drugFreq: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10
  },
  footBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  footBtnText: {
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink2
  },
  valid: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  }
});
