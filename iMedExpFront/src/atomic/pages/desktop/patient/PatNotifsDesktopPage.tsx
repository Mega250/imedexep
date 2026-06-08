import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { getCurrentPatient } from "@/services/api/currentPatient";
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

export function PatNotifsDesktopPage() {
  const nav = usePatientDesktopNav();
  const [feed, setFeed] = useState<Feed[] | null>(null);
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patient = await getCurrentPatient();
        if (!cancelled) setBloodType(patient.blood_type ?? null);
      } catch {
        if (!cancelled) setBloodType(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  const eyebrow = feed ? `${count} aviso${count === 1 ? "" : "s"}` : "Cargando…";
  const roleLabel = bloodType ? `paciente · ${bloodType}` : "paciente";

  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-notifs"
      role={roleLabel}
      roleBadge="Paciente"
      title="Avisos · tu bandeja"
      eyebrow={eyebrow}
      searchPlaceholder="Buscar aviso…"
    >
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {feed === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : feed.length === 0 ? (
        <FadeIn>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon kind="check" size={26} color={colors.accentDeep} />
            </View>
            <Text style={styles.emptyTitle}>Sin avisos por ahora.</Text>
            <Text style={styles.emptyNote}>
              Te avisaremos aquí cuando tu médico, tu cita o tus medicamentos necesiten algo de ti.
            </Text>
          </View>
        </FadeIn>
      ) : (
        <FadeIn>
          <View style={styles.list}>
            {feed.map((f, i) => (
              <FadeIn key={f.id} delay={i * 50}>
                <View style={styles.row}>
                  <View style={styles.rowIcon}>
                    <Icon kind={f.icon} size={18} color={colors.accentDeep} />
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
        </FadeIn>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 18,
    alignItems: "center"
  },
  errorBanner: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 12
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  list: {
    gap: 10,
    maxWidth: 720
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  rowTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  rowMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 4
  },
  rowWhen: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 32,
    alignItems: "flex-start",
    maxWidth: 640
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
    marginTop: 18
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink3,
    marginTop: 10
  }
});
