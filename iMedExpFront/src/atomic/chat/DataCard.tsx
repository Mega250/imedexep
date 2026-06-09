import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/theme/tokens";

export type AgentBlock = { tool: string; data: unknown };

function fmtFecha(iso: string): string {
  try {
    const d = new Date(new Date(iso).getTime() - 6 * 3600 * 1000);
    return (
      d.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
      }) + " h"
    );
  } catch {
    return iso;
  }
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "alert" | "neutral" }) {
  const bg = tone === "ok" ? colors.okSoft : tone === "alert" ? colors.alertSoft : colors.paper3;
  const fg = tone === "ok" ? colors.ok : tone === "alert" ? colors.alert : colors.ink;
  return (
    <View style={[styles.stat, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color: fg }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function bpTone(sys?: number, dia?: number): "ok" | "alert" | "neutral" {
  if (!sys || !dia) return "neutral";
  if (sys >= 140 || dia >= 90) return "alert";
  if (sys < 130 && dia < 85) return "ok";
  return "neutral";
}

function VitalsCard({ v }: { v: Record<string, number | string> }) {
  const num = (x: unknown) => (typeof x === "number" ? x : typeof x === "string" ? parseFloat(x) : undefined);
  const sys = num(v.systolic_bp);
  const dia = num(v.diastolic_bp);
  const spo2 = num(v.oxygen_saturation);
  const fecha = typeof v.recorded_at === "string" ? fmtFecha(v.recorded_at) : "";
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>Signos vitales</Text>
        {fecha ? <Text style={styles.cardMeta}>{fecha}</Text> : null}
      </View>
      <View style={styles.grid}>
        {sys && dia ? <Stat label="Presión (mmHg)" value={`${sys}/${dia}`} tone={bpTone(sys, dia)} /> : null}
        {num(v.heart_rate) ? <Stat label="Frecuencia (lpm)" value={String(num(v.heart_rate))} /> : null}
        {spo2 ? <Stat label="Saturación" value={`${spo2}%`} tone={spo2 >= 95 ? "ok" : "alert"} /> : null}
        {num(v.body_temperature) ? <Stat label="Temp (°C)" value={String(num(v.body_temperature))} /> : null}
        {num(v.weight) ? <Stat label="Peso (kg)" value={String(num(v.weight))} /> : null}
        {num(v.imc) ? <Stat label="IMC" value={String(num(v.imc))} /> : null}
      </View>
    </View>
  );
}

function DoctorsCard({ docs, onAction }: { docs: Record<string, unknown>[]; onAction?: (send: string, display: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Médicos disponibles</Text>
      <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
        {docs.slice(0, 8).map((d, i) => {
          const nombre = `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || `Doctor ${d.id ?? ""}`;
          return (
            <View key={i} style={styles.docRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{nombre}</Text>
                {d.general_license ? <Text style={styles.docMeta}>Céd. {String(d.general_license)}</Text> : null}
              </View>
              {onAction && d.id != null ? (
                <Pressable
                  style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                  onPress={() =>
                    onAction(
                      `Muestrame los horarios y turnos disponibles del doctor de doctor_id ${d.id} (consulta sus turnos) para que yo elija y agende una cita.`,
                      `Ver horarios de ${nombre}`
                    )
                  }
                >
                  <Text style={styles.ctaText}>Ver horarios</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AppointmentCard({ a }: { a: Record<string, unknown> }) {
  const fecha = typeof a.scheduled_at === "string" ? fmtFecha(a.scheduled_at) : "";
  const estado = String(a.status ?? "agendada");
  return (
    <View style={[styles.card, styles.cardOk]}>
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, { color: colors.ok }]}>✓ Cita {estado === "scheduled" ? "agendada" : estado}</Text>
      </View>
      <Text style={styles.apptLine}>{fecha}</Text>
      {a.doctor_name ? <Text style={styles.docMeta}>Con {String(a.doctor_name)}</Text> : a.doctor_id ? <Text style={styles.docMeta}>Médico #{String(a.doctor_id)}</Text> : null}
      {a.reason ? <Text style={styles.docMeta}>Motivo: {String(a.reason)}</Text> : null}
    </View>
  );
}

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function proximaFechaISO(weekday: number, hora: string): string {
  const jsDay = ((weekday % 7) + 7) % 7;
  const partes = hora.split(":");
  const h = parseInt(partes[0], 10) || 0;
  const m = parseInt(partes[1], 10) || 0;
  const now = new Date();
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  let add = (jsDay - now.getDay() + 7) % 7;
  if (add === 0 && d.getTime() <= now.getTime()) add = 7;
  d.setDate(now.getDate() + add);
  return d.toISOString();
}

function horasEntre(start: string, end: string): string[] {
  const h0 = parseInt(start.split(":")[0], 10);
  const h1 = parseInt(end.split(":")[0], 10);
  const slots: string[] = [];
  if (Number.isNaN(h0) || Number.isNaN(h1)) return slots;
  for (let h = h0; h <= h1; h += 1) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

function ShiftsCard({ shifts, onAction }: { shifts: Record<string, unknown>[]; onAction?: (send: string, display: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Elige día y hora</Text>
      <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
        {shifts.slice(0, 7).map((s, i) => {
          const wd = Number(s.weekday);
          const start = String(s.start_time ?? "").slice(0, 5);
          const end = String(s.end_time ?? "").slice(0, 5);
          const nombre = DIAS[((wd % 7) + 7) % 7] ?? `Día ${wd}`;
          const slots = horasEntre(start, end);
          return (
            <View key={i} style={styles.shiftBlock}>
              <Text style={styles.docName}>
                {nombre} <Text style={styles.docMeta}>({start}–{end} h)</Text>
              </Text>
              <View style={styles.slotRow}>
                {slots.map((hora) => (
                  <Pressable
                    key={hora}
                    style={({ pressed }) => [styles.slot, pressed && styles.ctaPressed]}
                    disabled={!onAction || s.doctor_id == null}
                    onPress={() =>
                      onAction?.(
                        `Agenda mi cita con el doctor de doctor_id ${s.doctor_id} para el ${proximaFechaISO(wd, hora)} (usa ese valor exacto como scheduled_at en formato ISO 8601), motivo: consulta.`,
                        `Agendar ${nombre} a las ${hora} h`
                      )
                    }
                  >
                    <Text style={styles.slotText}>{hora}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DataCard({ block, onAction }: { block: AgentBlock; onAction?: (send: string, display: string) => void }) {
  const { tool, data } = block;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if ("systolic_bp" in obj || "oxygen_saturation" in obj || "heart_rate" in obj) {
      return <VitalsCard v={obj as Record<string, number | string>} />;
    }
    if ("scheduled_at" in obj && ("doctor_id" in obj || "doctor_name" in obj)) {
      return <AppointmentCard a={obj} />;
    }
  }
  const list = Array.isArray(data) ? data : (data as { items?: unknown[] })?.items;
  if (Array.isArray(list) && list.length > 0 && typeof list[0] === "object") {
    const first = list[0] as Record<string, unknown>;
    if ("weekday" in first && "start_time" in first) {
      return <ShiftsCard shifts={list as Record<string, unknown>[]} onAction={onAction} />;
    }
    if ("general_license" in first || ("first_name" in first && "specialty_id" in first)) {
      return <DoctorsCard docs={list as Record<string, unknown>[]} onAction={onAction} />;
    }
  }
  return null;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.xs, gap: 2 },
  cardOk: { borderColor: colors.okRule, backgroundColor: colors.okSoft },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.ink },
  cardMeta: { fontSize: 11, color: colors.ink3 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  stat: { minWidth: "30%", flexGrow: 1, borderRadius: radii.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, alignItems: "flex-start" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, color: colors.ink3, marginTop: 1 },
  docRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.rule },
  docName: { fontSize: 14, fontWeight: "600", color: colors.ink },
  docMeta: { fontSize: 12, color: colors.ink3 },
  cta: { backgroundColor: colors.accent, borderRadius: radii.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  ctaPressed: { opacity: 0.7 },
  ctaText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  apptLine: { fontSize: 15, fontWeight: "600", color: colors.ink, marginTop: 2 },
  shiftBlock: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.rule, paddingTop: spacing.xs },
  slotRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  slot: { borderWidth: 1, borderColor: colors.accent, borderRadius: radii.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  slotText: { color: colors.accent, fontWeight: "700", fontSize: 13 },
});
