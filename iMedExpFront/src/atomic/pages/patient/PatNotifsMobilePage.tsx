import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { listMyCertificates, listMyNotifications } from "@/services/api/clinicalExtrasApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Feed = { id: string; icon: IconKind; title: string; meta: string; ts: number; when: string };

function fmt(value: string): string {
  try {
    return new Date(value).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return value;
  }
}

export function PatNotifsMobilePage() {
  const [feed, setFeed] = useState<Feed[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [notifs, certs] = await Promise.all([
          listMyNotifications().catch(() => []),
          listMyCertificates().catch(() => [])
        ]);
        const items: Feed[] = [
          ...notifs.map((n) => ({
            id: `n-${n.id}`,
            icon: "send" as IconKind,
            title: n.message,
            meta: `${n.kind} · ${n.status === "pending" ? "pendiente" : n.status}`,
            ts: new Date(n.created_at).getTime(),
            when: fmt(n.created_at)
          })),
          ...certs.map((c) => ({
            id: `c-${c.id}`,
            icon: "doc" as IconKind,
            title: `Certificado: ${c.title}`,
            meta: "emitido por tu médico",
            ts: new Date(c.issued_at).getTime(),
            when: fmt(c.issued_at)
          }))
        ].sort((a, b) => b.ts - a.ts);
        if (!cancelled) setFeed(items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus avisos.");
          setFeed([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const count = feed?.length ?? 0;

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-notifs-mob" />}
      header={
        <ScreenTopBar
          sub={feed ? `${count} aviso${count === 1 ? "" : "s"}` : "Cargando…"}
          title="Avisos"
        />
      }
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {feed === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : feed.length === 0 ? (
        <FadeIn>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon kind="check" size={20} color={colors.accentDeep} />
            </View>
            <Text style={styles.emptyTitle}>Sin avisos por ahora.</Text>
            <Text style={styles.emptyNote}>
              te avisaremos aquí cuando tu médico, tu cita o tus medicamentos necesiten algo de ti.
            </Text>
          </View>
        </FadeIn>
      ) : (
        <View style={styles.list}>
          {feed.map((f, i) => (
            <FadeIn key={f.id} delay={i * 50}>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Icon kind={f.icon} size={16} color={colors.accentDeep} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {f.title}
                  </Text>
                  <Text style={styles.rowMeta}>{f.meta}</Text>
                </View>
                <Text style={styles.rowWhen}>{f.when}</Text>
              </View>
            </FadeIn>
          ))}
        </View>
      )}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 30,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  list: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  rowTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  rowMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 3
  },
  rowWhen: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 22,
    alignItems: "flex-start"
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 14
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    lineHeight: 16,
    color: colors.ink3,
    marginTop: 8
  }
});
