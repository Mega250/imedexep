import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { listMyNotifications, PatientNotification } from "@/services/api/clinicalExtrasApi";
import {
  getReminderPreferences,
  ReminderPreference,
  runMyReminders,
  updateReminderPreferences
} from "@/services/api/recordatoriosApi";
import { colors, radii, spacing } from "@/theme/tokens";

function Stepper({ value, onChange, suffix, min, max }: { value: number; onChange: (n: number) => void; suffix: string; min: number; max: number }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <TextInput
        style={styles.stepInput}
        value={String(value)}
        keyboardType="number-pad"
        onChangeText={(t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
      />
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))}>
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
      <Text style={styles.suffix}>{suffix}</Text>
    </View>
  );
}

export function RemindersConfig() {
  const [pref, setPref] = useState<ReminderPreference | null>(null);
  const [notifs, setNotifs] = useState<PatientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifs = useCallback(async () => {
    try {
      const list = await listMyNotifications();
      setNotifs(list.filter((n) => n.kind.includes("reminder")).slice(0, 8));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getReminderPreferences();
        if (active) setPref(data);
        await loadNotifs();
      } catch (e) {
        if (active) setError("No pudimos cargar tus recordatorios.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadNotifs]);

  const patch = (changes: Partial<ReminderPreference>) => {
    setPref((p) => (p ? { ...p, ...changes } : p));
    setSavedAt(false);
  };

  const save = useCallback(async () => {
    if (!pref) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateReminderPreferences({
        medication_enabled: pref.medication_enabled,
        medication_every_hours: pref.medication_every_hours,
        appointment_enabled: pref.appointment_enabled,
        appointment_hours_before: pref.appointment_hours_before,
        email_enabled: pref.email_enabled
      });
      setPref(updated);
      setSavedAt(true);
    } catch {
      setError("No pudimos guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [pref]);

  const generateNow = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      await runMyReminders();
      await loadNotifs();
    } catch {
      setError("No se pudieron generar los recordatorios.");
    } finally {
      setRunning(false);
    }
  }, [loadNotifs]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!pref) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error ?? "Sin datos de recordatorios."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>Recordatorio de medicación</Text>
            <Text style={styles.itemDesc}>Te avisamos para que no olvides tu tratamiento.</Text>
          </View>
          <Switch
            value={pref.medication_enabled}
            onValueChange={(v) => patch({ medication_enabled: v })}
            trackColor={{ true: colors.accent, false: colors.rule }}
          />
        </View>
        {pref.medication_enabled ? (
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>Cada</Text>
            <Stepper value={pref.medication_every_hours} onChange={(n) => patch({ medication_every_hours: n })} suffix="horas" min={1} max={168} />
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>Recordatorio de citas</Text>
            <Text style={styles.itemDesc}>Te avisamos antes de cada cita agendada.</Text>
          </View>
          <Switch
            value={pref.appointment_enabled}
            onValueChange={(v) => patch({ appointment_enabled: v })}
            trackColor={{ true: colors.accent, false: colors.rule }}
          />
        </View>
        {pref.appointment_enabled ? (
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>Avisar</Text>
            <Stepper value={pref.appointment_hours_before} onChange={(n) => patch({ appointment_hours_before: n })} suffix="horas antes" min={1} max={168} />
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>También por correo</Text>
            <Text style={styles.itemDesc}>Recibe los recordatorios en tu email, no solo en la app.</Text>
          </View>
          <Switch
            value={pref.email_enabled}
            onValueChange={(v) => patch({ email_enabled: v })}
            trackColor={{ true: colors.accent, false: colors.rule }}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.primary, pressed && styles.pressed]} onPress={save} disabled={saving}>
          <Text style={styles.primaryText}>{saving ? "Guardando…" : "Guardar"}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.ghost, pressed && styles.pressed]} onPress={generateNow} disabled={running}>
          <Text style={styles.ghostText}>{running ? "Generando…" : "Generar ahora"}</Text>
        </Pressable>
        {savedAt ? <Text style={styles.ok}>✓ Guardado</Text> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {notifs.length > 0 ? (
        <View style={styles.notifs}>
          <Text style={styles.notifsTitle}>Recordatorios recientes</Text>
          {notifs.map((n) => (
            <View key={n.id} style={styles.notifItem}>
              <View style={[styles.dot, { backgroundColor: n.kind === "medication_reminder" ? colors.accent : colors.ok }]} />
              <Text style={styles.notifText}>{n.message.replace(/\s*\[cita:\d+\]\s*$/, "")}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, padding: spacing.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  muted: { color: colors.ink3, fontSize: 14 },
  flex: { flex: 1 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  itemTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  itemDesc: { fontSize: 12.5, color: colors.ink3, marginTop: 2 },
  subRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.rule, paddingTop: spacing.sm },
  subLabel: { fontSize: 13, color: colors.ink2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  stepBtn: { width: 34, height: 34, borderRadius: radii.md, backgroundColor: colors.paper3, alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontSize: 20, fontWeight: "700", color: colors.ink },
  stepInput: { minWidth: 46, textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.ink, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.md, paddingVertical: 4 },
  suffix: { fontSize: 13, color: colors.ink3 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  primary: { backgroundColor: colors.accent, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  primaryText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  ghost: { borderWidth: 1, borderColor: colors.accent, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  ghostText: { color: colors.accent, fontWeight: "700", fontSize: 14 },
  pressed: { opacity: 0.7 },
  ok: { color: colors.ok, fontWeight: "600", fontSize: 13 },
  error: { color: colors.alert, fontSize: 13, paddingHorizontal: spacing.xs },
  notifs: { marginTop: spacing.sm, gap: spacing.xs },
  notifsTitle: { fontSize: 13, fontWeight: "700", color: colors.ink2, textTransform: "uppercase", letterSpacing: 0.5 },
  notifItem: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: colors.paper2, borderRadius: radii.md, padding: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  notifText: { flex: 1, fontSize: 13.5, color: colors.ink, lineHeight: 19 }
});
