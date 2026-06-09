import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { superadminNav } from "@/navigation/desktopNavConfigs";
import { AdminStats, AuditEvent, fetchAdminStats, fetchAuditEvents } from "@/services/api/adminApi";
import { downloadCsv, toCsv } from "@/utils/downloadCsv";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type OpFilter = "all" | "INSERT" | "UPDATE" | "DELETE";

const OPS: [OpFilter, string][] = [
  ["all", "Todas"],
  ["INSERT", "INSERT"],
  ["UPDATE", "UPDATE"],
  ["DELETE", "DELETE"]
];

function fmtTime(value: string): string {
  try {
    return new Date(value).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return value;
  }
}

const OP_COLOR: Record<string, string> = {
  INSERT: colors.ok,
  UPDATE: colors.accentDeep,
  DELETE: colors.alert
};

export function SAAuditDesktopPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opFilter, setOpFilter] = useState<OpFilter>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, e] = await Promise.all([fetchAdminStats(), fetchAuditEvents(50)]);
        if (!cancelled) {
          setStats(s);
          setEvents(e);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar la auditoría.");
          setEvents([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = (events ?? []).filter(
    (e) => opFilter === "all" || e.operation === opFilter
  );

  function handleExportCsv(): void {
    if (filteredEvents.length === 0) {
      return;
    }
    const csv = toCsv(
      filteredEvents.map((e) => ({
        fecha: fmtTime(e.event_time),
        operacion: e.operation,
        tabla: `${e.table_schema}.${e.table_name}`,
        registro: e.record_id ?? "",
        rol: e.app_user_role ?? ""
      })),
      [
        { key: "fecha", label: "Fecha" },
        { key: "operacion", label: "Operación" },
        { key: "tabla", label: "Tabla" },
        { key: "registro", label: "Registro" },
        { key: "rol", label: "Rol" }
      ]
    );
    downloadCsv("auditoria.csv", csv);
  }

  const cards: [string, string][] = [
    ["Eventos · 24 h", stats ? String(stats.events_24h) : "…"],
    ["Eventos · total", stats ? String(stats.events_total) : "…"],
    ["Instituciones", stats ? String(stats.institutions) : "…"],
    [
      "Usuarios",
      stats
        ? String(stats.patients + stats.doctors + stats.secretaries + stats.institution_admins + stats.superadmins)
        : "…"
    ]
  ];

  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="sa-audit"
      role="superadmin · root"
      roleBadge="Superadmin"
      title="Auditoría · bitácora del sistema"
      eyebrow="Registro de cambios en la base de datos"
      topBarRight={
        <Button
          label="CSV"
          iconLeft="download"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          disabled={filteredEvents.length === 0}
          onPress={handleExportCsv}
        />
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.statRow}>
          {cards.map(([k, v]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.statKey}>{k}</Text>
              <Text style={styles.statValue}>{v}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <View style={styles.filterRow}>
        {OPS.map(([key, label]) => {
          const on = opFilter === key;
          const count =
            key === "all"
              ? events?.length ?? 0
              : (events ?? []).filter((e) => e.operation === key).length;
          return (
            <Tappable key={key} onPress={() => setOpFilter(key)} scaleTo={0.97}>
              <View
                style={[
                  styles.pill,
                  {
                    borderColor: on ? colors.ink : colors.rule,
                    backgroundColor: on ? colors.ink : colors.white
                  }
                ]}
              >
                <Text style={[styles.pillText, { color: on ? colors.paper : colors.ink2 }]}>
                  {label}
                </Text>
                <Text style={[styles.pillCount, { color: on ? colors.paper : colors.ink3 }]}>
                  {count}
                </Text>
              </View>
            </Tappable>
          );
        })}
      </View>

      <FadeIn delay={80}>
        <View style={styles.tableCard}>
          <View style={styles.tableHead}>
            <Text style={styles.colOp}>Operación</Text>
            <Text style={styles.colTable}>Tabla</Text>
            <Text style={styles.colId}>Registro</Text>
            <Text style={styles.colWho}>Rol</Text>
            <Text style={styles.colTime}>Fecha</Text>
          </View>
          {events === null ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accentDeep} />
            </View>
          ) : filteredEvents.length === 0 ? (
            <Text style={styles.empty}>
              {events.length === 0
                ? "Sin eventos registrados todavía."
                : "Sin eventos para este filtro."}
            </Text>
          ) : (
            filteredEvents.map((e, i) => (
              <View key={i} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                <Text style={[styles.colOp, styles.opText, { color: OP_COLOR[e.operation] ?? colors.ink }]}>
                  {e.operation}
                </Text>
                <Text style={styles.colTable} numberOfLines={1}>
                  {e.table_schema}.{e.table_name}
                </Text>
                <Text style={styles.colId}>{e.record_id ?? "—"}</Text>
                <Text style={styles.colWho} numberOfLines={1}>
                  {e.app_user_role ?? "—"}
                </Text>
                <Text style={styles.colTime}>{fmtTime(e.event_time)}</Text>
              </View>
            ))
          )}
        </View>
      </FadeIn>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: family.mono, fontSize: 11, color: colors.alert, marginBottom: 8 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 18
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  pillText: {
    fontFamily: family.medium,
    fontSize: 12.5
  },
  pillCount: {
    fontFamily: family.mono,
    fontSize: 10
  },
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  statKey: { ...text.eyebrow, color: colors.ink3 },
  statValue: {
    fontFamily: family.medium,
    fontSize: 30,
    letterSpacing: -0.9,
    marginTop: 6,
    lineHeight: 30,
    color: colors.ink
  },
  tableCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  tableHead: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: "center"
  },
  rowAlt: { backgroundColor: colors.paper },
  opText: { fontFamily: family.monoMedium, fontSize: 11.5 },
  colOp: { width: 90, fontFamily: family.mono, fontSize: 10.5, color: colors.ink3 },
  colTable: { flex: 1, minWidth: 0, fontFamily: family.mono, fontSize: 12, color: colors.ink },
  colId: { width: 80, fontFamily: family.mono, fontSize: 12, color: colors.ink2 },
  colWho: { width: 110, fontFamily: family.mono, fontSize: 11, color: colors.ink2 },
  colTime: { width: 130, fontFamily: family.mono, fontSize: 11, color: colors.ink3 },
  loading: { paddingVertical: 30, alignItems: "center" },
  empty: { fontFamily: family.mono, fontSize: 11.5, color: colors.ink3, padding: 24, textAlign: "center" }
});
