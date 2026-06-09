import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Tappable } from "@/atomic/atoms/Tappable";
import { fetchManagedBlocks, setScreenBlock } from "@/services/api/screenAccessApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export type PermRoleGroup = {
  role: string;
  label: string;
  screens: { screen: string; label: string }[];
};

function keyOf(role: string, screen: string): string {
  return `${role}::${screen}`;
}

export function ScreenPermissionsPanel({ groups }: { groups: PermRoleGroup[] }) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchManagedBlocks();
        setBlocked(new Set(rows.map((r) => keyOf(r.role, r.screen_id))));
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos cargar los permisos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggle(role: string, screen: string) {
    const k = keyOf(role, screen);
    const willBlock = !blocked.has(k);
    setSavingKey(k);
    setError(null);
    try {
      await setScreenBlock(role, screen, willBlock);
      setBlocked((prev) => {
        const next = new Set(prev);
        if (willBlock) next.add(k);
        else next.delete(k);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el cambio.");
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accentDeep} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {groups.map((g) => (
        <View key={g.role} style={styles.card}>
          <Text style={styles.cardTitle}>{g.label}</Text>
          <Text style={styles.cardSub}>Toca para mostrar u ocultar cada pantalla</Text>
          <View style={styles.rows}>
            {g.screens.map((s) => {
              const k = keyOf(g.role, s.screen);
              const isBlocked = blocked.has(k);
              return (
                <Tappable key={s.screen} onPress={() => toggle(g.role, s.screen)} style={styles.row}>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {s.label}
                  </Text>
                  <View
                    style={[
                      styles.tag,
                      { backgroundColor: isBlocked ? colors.alertSoft : colors.okSoft }
                    ]}
                  >
                    <Text style={[styles.tagText, { color: isBlocked ? colors.alert : colors.ok }]}>
                      {savingKey === k ? "…" : isBlocked ? "OCULTA" : "VISIBLE"}
                    </Text>
                  </View>
                </Tappable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  loading: { paddingVertical: 40, alignItems: "center" },
  error: { fontFamily: family.mono, fontSize: 11, color: colors.alert },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 18
  },
  cardTitle: { fontFamily: family.medium, fontSize: 16, color: colors.ink },
  cardSub: { fontFamily: family.mono, fontSize: 10.5, color: colors.ink3, marginTop: 2, marginBottom: 12 },
  rows: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  rowLabel: { flex: 1, minWidth: 0, fontFamily: family.medium, fontSize: 13.5, color: colors.ink },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginLeft: 10 },
  tagText: { fontFamily: family.mono, fontSize: 9.5, letterSpacing: 0.6 }
});
