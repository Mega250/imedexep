import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { fetchConsultations } from "@/services/api/consultationsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { fetchPatient } from "@/services/api/patientsApi";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { silentOrNull } from "@/services/api/silent";
import {
  fetchPrescriptionsByConsultation,
  Prescription,
  sendPrescriptionToPatient
} from "@/services/api/prescriptionsApi";
import { printCurrentDocument } from "@/utils/downloadCsv";
import { ApiError } from "@/services/api/client";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type RecetaView = {
  prescription: Prescription;
  patientName: string;
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Hoy · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) {
    return `Ayer · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const mon = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()];
  return `${d.getDate()} ${mon}`;
}

function RecetaCard({ r }: { r: RecetaView }) {
  const signed = Boolean(r.prescription.signed_at);
  const folio = `RX·${String(r.prescription.id).padStart(6, "0")}`;
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSend() {
    if (sendStatus === "sending") return;
    setSendStatus("sending");
    setSendError(null);
    try {
      await sendPrescriptionToPatient(r.prescription.id);
      setSendStatus("sent");
    } catch (err) {
      setSendStatus("error");
      setSendError(err instanceof ApiError ? err.message : "No pudimos enviar la receta.");
    }
  }
  return (
    <View style={styles.recetaCard}>
      <View style={styles.recetaHead}>
        <View style={styles.flex}>
          <Text style={styles.recetaPatient} numberOfLines={1} ellipsizeMode="tail">{r.patientName}</Text>
          <Text style={styles.recetaFolio} numberOfLines={1} ellipsizeMode="tail">
            {folio} · {formatRelative(r.prescription.created_at)}
          </Text>
        </View>
        <View
          style={[
            styles.statePill,
            { backgroundColor: signed ? "rgba(28,140,90,0.12)" : colors.paper3 }
          ]}
        >
          {signed ? <Icon kind="check" size={10} color={colors.ok} /> : null}
          <Text style={[styles.statePillText, { color: signed ? colors.ok : colors.accentDeep }]}>
            {signed ? "firmada" : "pendiente"}
          </Text>
        </View>
      </View>

      <View style={styles.drugList}>
        {r.prescription.items.length === 0 ? (
          <Text style={styles.emptyText}>Sin fármacos</Text>
        ) : null}
        {r.prescription.items.map((d) => (
          <View key={d.id} style={styles.drugRow}>
            <Icon kind="pill" size={13} color={colors.ink3} />
            <Text style={styles.drugName} numberOfLines={1} ellipsizeMode="tail">{d.medication_name}</Text>
            <Text style={styles.drugDose} numberOfLines={1} ellipsizeMode="tail">{d.dose ?? "—"}</Text>
            <Text style={styles.drugFreq} numberOfLines={1} ellipsizeMode="tail">{d.frequency ?? "—"}</Text>
          </View>
        ))}
      </View>

      <View style={styles.recetaFoot}>
        <Tappable onPress={printCurrentDocument} scaleTo={0.97} style={styles.miniBtn}>
          <Icon kind="download" size={12} color={colors.ink2} />
          <Text style={styles.miniBtnText}>Imprimir / PDF</Text>
        </Tappable>
        <Tappable
          onPress={handleSend}
          disabled={sendStatus === "sending"}
          scaleTo={0.97}
          style={styles.miniBtn}
        >
          <Icon kind="send" size={12} color={colors.ink2} />
          <Text style={styles.miniBtnText}>
            {sendStatus === "sending"
              ? "Enviando…"
              : sendStatus === "sent"
              ? "Enviada"
              : "Enviar al paciente"}
          </Text>
        </Tappable>
        {sendError ? <Text style={styles.recetaValid} numberOfLines={1} ellipsizeMode="tail">{sendError}</Text> : null}
        <View style={styles.flex} />
        {r.prescription.notes ? <Text style={styles.recetaValid} numberOfLines={1} ellipsizeMode="tail">{r.prescription.notes}</Text> : null}
      </View>
    </View>
  );
}

export function DskRecetasDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RecetaView[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  useEffect(() => {
    getSelectedPatientId().then(setSelectedPatientId).catch(() => setSelectedPatientId(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const doctorId = await getCurrentDoctorId();
        const cons = await fetchConsultations({ doctor_id: doctorId, page: 1, limit: 25 });
        if (cancelled) {
          return;
        }
        const recent = [...cons.items]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 15);
        const results: RecetaView[] = [];
        await Promise.all(
          recent.map(async (c) => {
            try {
              const [prescriptions, patient] = await Promise.all([
                fetchPrescriptionsByConsultation(c.id),
                silentOrNull(fetchPatient(c.patient_id), `DskRecetasDesktopPage.fetchPatient(${c.patient_id})`)
              ]);
              const patientName = patient ? `${patient.first_name} ${patient.last_name}`.trim() : `Paciente #${c.patient_id}`;
              for (const p of prescriptions) {
                results.push({ prescription: p, patientName });
              }
            } catch {
              return;
            }
          })
        );
        if (cancelled) {
          return;
        }
        results.sort((a, b) => new Date(b.prescription.created_at).getTime() - new Date(a.prescription.created_at).getTime());
        setItems(results);
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "No pudimos cargar las recetas.");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const todayCount = items.filter((r) => new Date(r.prescription.created_at).toDateString() === now.toDateString()).length;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekCount = items.filter((r) => new Date(r.prescription.created_at) >= weekStart).length;
  const signedCount = items.filter((r) => r.prescription.signed_at).length;

  const stats: [string, string, string, boolean][] = [
    ["Hoy", String(todayCount), "recetas registradas", true],
    ["Semana", String(weekCount), "últimos 7 días", false],
    ["Firmadas", String(signedCount), `de ${items.length}`, false],
    ["Totales", String(items.length), "en pantalla", false]
  ];

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-recetas"
      role="médico"
      roleBadge="Médico"
      title="Recetas médicas"
      eyebrow={`${items.length} en últimas consultas`}
      topBarRight={
        <View style={styles.ctaWrap}>
          <Button
            label="Nueva receta"
            iconLeft="plus"
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            disabled={selectedPatientId === null}
            style={selectedPatientId === null ? styles.ctaBtnDisabled : undefined}
            onPress={() => goToScreen("doctor-active")}
          />
          {selectedPatientId === null ? (
            <Text style={styles.ctaHint}>Selecciona un paciente primero</Text>
          ) : null}
        </View>
      }
    >
      <FadeIn>
        <View style={styles.statsGrid}>
          {stats.map(([k, n, sub, on]) => (
            <View key={k} style={styles.statCell}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: on ? colors.paper3 : colors.white,
                    borderColor: on ? colors.accentRule : colors.rule
                  }
                ]}
              >
                <Text style={styles.eyebrow}>{k}</Text>
                <Text style={styles.statValue}>{n}</Text>
                <Text style={styles.statSub}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <View style={styles.sectionHead}>
          <Text style={styles.eyebrow}>Recetas recientes</Text>
        </View>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accentDeep} />
            <Text style={styles.loadingText}>Cargando recetas…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>Sin recetas en consultas recientes</Text>
            <Text style={styles.emptySub}>Al firmar recetas aparecerán aquí.</Text>
          </View>
        ) : (
          <View style={styles.recetaGrid}>
            {items.map((r) => (
              <View key={r.prescription.id} style={styles.recetaCell}>
                <RecetaCard r={r} />
              </View>
            ))}
          </View>
        )}
      </FadeIn>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  ctaWrap: {
    alignItems: "flex-end",
    gap: 4
  },
  ctaBtnDisabled: {
    opacity: 0.45
  },
  ctaHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  statCell: {
    flexBasis: "23%",
    flexGrow: 1,
    minWidth: 200
  },
  statCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 30,
    letterSpacing: -0.9,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 30
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10
  },
  recetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  recetaCell: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 320
  },
  recetaCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  recetaHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10
  },
  recetaPatient: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  recetaFolio: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 3,
    letterSpacing: 0.4
  },
  statePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  statePillText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  drugList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.rule2,
    paddingTop: 10,
    gap: 6
  },
  drugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  drugName: {
    flex: 1.5,
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  drugDose: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  drugFreq: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "right"
  },
  recetaFoot: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.rule2,
    paddingTop: 10
  },
  miniBtn: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  miniBtnText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  recetaValid: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  emptyText: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    paddingVertical: 6
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.alert
  },
  emptyPanel: {
    padding: 32,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
  }
});
