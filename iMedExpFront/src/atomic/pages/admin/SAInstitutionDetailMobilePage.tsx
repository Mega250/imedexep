import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { goBack } from "@/navigation/screenRouter";
import {
  fetchInstitution,
  fetchInstitutionAdmins,
  Institution,
  InstitutionAdmin,
  updateInstitution
} from "@/services/api/institutionsApi";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { InstitutionStats, fetchInstitutionStats } from "@/services/api/adminApi";
import { getSelectedInstitutionId } from "@/state/selectedInstitution";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function lastTwoInitials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .slice(-2)
    .map((s) => s[0] ?? "")
    .join("") || name.slice(0, 2).toUpperCase();
}

function instInitials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .filter((s) => s[0] && s[0] >= "A" && s[0] <= "Z")
    .slice(0, 2)
    .map((s) => s[0])
    .join("") || name.slice(0, 2).toUpperCase();
}

export function SAInstitutionDetailMobilePage() {
  const insets = useSafeAreaInsets();
  const selectedId = getSelectedInstitutionId();
  const [inst, setInst] = useState<Institution | null>(null);
  const [admins, setAdmins] = useState<InstitutionAdmin[]>([]);
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (selectedId === null) {
      setError("Selecciona una institución desde el listado.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [i, adm, st] = await Promise.all([
          fetchInstitution(selectedId),
          fetchInstitutionAdmins(selectedId).catch(() => [] as InstitutionAdmin[]),
          fetchInstitutionStats(selectedId).catch(() => null)
        ]);
        if (!cancelled) {
          setInst(i);
          setAdmins(Array.isArray(adm) ? adm : []);
          setStats(st);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar la institución.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function toggleActive() {
    if (!inst) return;
    setError(null);
    try {
      const updated = await updateInstitution(inst.id, { is_active: inst.is_active === false });
      setInst(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar la institución.");
    }
  }

  async function handleEdit(values: Record<string, string>) {
    if (!inst) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await updateInstitution(inst.id, {
        name: values.name,
        address: values.address,
        phone: values.phone
      });
      setInst(updated);
      setEditOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar.");
    } finally {
      setSubmitting(false);
    }
  }

  const name = inst?.name ?? "—";
  const city = inst?.city ?? "—";
  const idLabel = inst?.id ?? selectedId ?? "—";
  const ini = instInitials(name);
  const isActive = inst?.is_active !== false;

  const STATS: [string, string, string][] = [
    ["Estado", isActive ? "Activa" : "Inactiva", inst?.created_at ? `desde ${inst.created_at.slice(0, 10)}` : "—"],
    ["Admins", String(admins.length), "vinculados a la BD"],
    ["Médicos", stats ? String(stats.doctors) : "—", "en la clínica"],
    ["Pacientes", stats ? String(stats.patients) : "—", "vinculados"]
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <RadialBlob size={240} color="rgba(0,180,216,0.3)" style={{ top: -90, right: -70 }} />
          <Tappable onPress={() => goBack("sa-inst-mob")} scaleTo={0.95} style={styles.backRow}>
            <Icon kind="chev-l" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Instituciones</Text>
          </Tappable>
          <View style={styles.heroMain}>
            <Avatar
              initials={ini}
              size={56}
              radius={14}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={22}
            />
            <View style={styles.flex}>
              <Text style={styles.heroEyebrow}>{isActive ? "Activa" : "Inactiva"}</Text>
              <Text style={styles.heroName} numberOfLines={2}>
                {name}
              </Text>
            </View>
          </View>
          <Text style={styles.heroMeta}>
            id {idLabel} · {city}
          </Text>
          <View style={styles.heroButtons}>
            <View style={styles.flex}>
              <Button label="Editar" variant="bright" height={36} onPress={() => setEditOpen(true)} />
            </View>
            <View style={styles.flex}>
              <Button
                label={isActive ? "Pausar" : "Activar"}
                variant="darkGhost"
                height={36}
                onPress={toggleActive}
              />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accentDeep} />
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <FadeIn>
            <View style={styles.statGrid}>
              {STATS.map(([k, n, s]) => (
                <StatTile key={k} label={k} value={n} sub={s} style={styles.statCell} />
              ))}
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <Section title={`Administradores · ${admins.length}`}>
              {admins.length === 0 && !loading ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Sin administradores</Text>
                  <Text style={styles.emptySub}>Agrega el primer administrador.</Text>
                </View>
              ) : (
                admins.map((a) => {
                  const full = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || a.email || "Sin nombre";
                  return (
                    <View key={a.id} style={styles.row}>
                      <Avatar
                        initials={lastTwoInitials(full)}
                        size={30}
                        radius={8}
                        bg={colors.paper3}
                        fg={colors.accentDeep}
                        serif
                        fontSize={12}
                      />
                      <View style={styles.flex}>
                        <View style={styles.nameRow}>
                          <Text style={styles.rowName} numberOfLines={1}>
                            {full}
                          </Text>
                        </View>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {a.email ?? "—"} · {a.role ?? "admin"}
                        </Text>
                      </View>
                      <Icon kind="chev" size={14} color={colors.ink3} />
                    </View>
                  );
                })
              )}
            </Section>
          </FadeIn>

          <FadeIn delay={130}>
            <Section title="Resumen de la clínica">
              {([
                ["Médicos", stats?.doctors],
                ["Secretarias", stats?.secretaries],
                ["Pacientes", stats?.patients]
              ] as [string, number | undefined][]).map(([k, n]) => (
                <View key={k} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{k}</Text>
                  <Text style={styles.metricValue}>{stats ? String(n ?? 0) : "—"}</Text>
                </View>
              ))}
            </Section>
          </FadeIn>
        </View>
      </ScrollView>

      <RecordFormModal
        visible={editOpen}
        title="Editar institución"
        submitting={submitting}
        error={formError}
        fields={[
          { key: "name", label: "Nombre", placeholder: name, required: true },
          { key: "address", label: "Dirección", placeholder: "Calle y número" },
          { key: "phone", label: "Teléfono", placeholder: "10 dígitos", keyboardType: "phone-pad" }
        ]}
        onClose={() => {
          setEditOpen(false);
          setFormError(null);
        }}
        onSubmit={handleEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper
  },
  scroll: {
    paddingBottom: 30
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingBottom: 22,
    overflow: "hidden"
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14
  },
  backText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)"
  },
  heroMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 24,
    color: colors.paper,
    marginTop: 4
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 12
  },
  heroButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statCell: {
    width: "48%",
    maxWidth: "48%",
    flexBasis: "48%",
    flexGrow: 0,
    flexShrink: 0
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  rowName: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  rowSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  metricLabel: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  metricValue: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    alignItems: "center"
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4,
    textAlign: "center"
  }
});
