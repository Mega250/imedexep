import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { FAB } from "@/atomic/molecules/FAB";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { superadminTabs } from "@/navigation/tabConfigs";
import { AdminStats, AuditEvent, fetchAdminStats, fetchAuditEvents } from "@/services/api/adminApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

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

function toCsv(events: AuditEvent[]): string {
  const head =
    "event_time,operation,table_schema,table_name,record_id,app_user_id,app_user_role,institution_id";
  const rows = events.map((e) =>
    [
      e.event_time,
      e.operation,
      e.table_schema,
      e.table_name,
      e.record_id ?? "",
      e.app_user_id ?? "",
      e.app_user_role ?? "",
      e.institution_id ?? ""
    ].join(",")
  );
  return [head, ...rows].join("\n");
}

export function SAAuditMobilePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

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

  async function exportCsv() {
    if (!events || events.length === 0) return;
    const csv = toCsv(events);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "auditoria.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      await Clipboard.setStringAsync(csv);
    }
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  const cards: [string, string][] = [
    ["Eventos · 24 h", stats ? String(stats.events_24h) : "…"],
    ["Eventos · total", stats ? String(stats.events_total) : "…"]
  ];

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={superadminTabs} active={4} />}
      header={<ScreenTopBar sub="Bitácora del sistema" title="Auditoría" />}
      floating={<FAB icon="copy" label={exported ? "Listo ✓" : "CSV"} onPress={exportCsv} />}
      contentStyle={styles.content}
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

      <FadeIn delay={80}>
        <View style={styles.listCard}>
          {events === null ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accentDeep} />
            </View>
          ) : events.length === 0 ? (
            <Text style={styles.empty}>Sin eventos registrados todavía.</Text>
          ) : (
            events.map((e, i) => (
              <View key={i} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                <View style={styles.rowTop}>
                  <Text style={[styles.op, { color: OP_COLOR[e.operation] ?? colors.ink }]}>
                    {e.operation}
                  </Text>
                  <Text style={styles.time}>{fmtTime(e.event_time)}</Text>
                </View>
                <Text style={styles.detail} numberOfLines={1}>
                  {e.table_schema}.{e.table_name} · #{e.record_id ?? "—"} · {e.app_user_role ?? "sistema"}
                </Text>
              </View>
            ))
          )}
        </View>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statKey: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink3
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 26,
    letterSpacing: -0.8,
    color: colors.ink,
    marginTop: 4
  },
  listCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    overflow: "hidden"
  },
  loading: {
    paddingVertical: 30,
    alignItems: "center"
  },
  empty: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3,
    padding: 24,
    textAlign: "center"
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  rowAlt: {
    backgroundColor: colors.paper
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  op: {
    fontFamily: family.monoMedium,
    fontSize: 11.5
  },
  time: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  detail: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2,
    marginTop: 4
  }
});
