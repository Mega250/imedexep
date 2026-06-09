import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { ApiError } from "@/services/api/client";
import { Doctor } from "@/services/api/doctorsApi";
import {
  Secretary,
  SecretaryDoctorAssignment,
  assignSecretaryToDoctor,
  fetchInstitutionDoctors,
  fetchSecretaries,
  fetchSecretaryAssignments,
  unassignSecretaryFromDoctor
} from "@/services/api/secretaryApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function secInitials(s: Secretary) {
  return `${s.first_name?.[0] ?? ""}${s.last_name?.[0] ?? ""}`.toUpperCase();
}

function docInitial(d: Doctor) {
  return (d.last_name?.[0] ?? d.first_name?.[0] ?? "?").toUpperCase();
}

export function DirAssignsDesktopPage(): ReactNode {
  const [secs, setSecs] = useState<Secretary[] | null>(null);
  const [docs, setDocs] = useState<Doctor[] | null>(null);
  const [assigns, setAssigns] = useState<SecretaryDoctorAssignment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyCell, setBusyCell] = useState<string | null>(null);

  async function reload() {
    try {
      const [s, d, a] = await Promise.all([
        fetchSecretaries(),
        fetchInstitutionDoctors(),
        fetchSecretaryAssignments()
      ]);
      setSecs(s);
      setDocs(d);
      setAssigns(a);
    } catch {
      setError("No pudimos cargar las asignaciones.");
    }
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, d, a] = await Promise.all([
          fetchSecretaries(),
          fetchInstitutionDoctors(),
          fetchSecretaryAssignments()
        ]);
        if (!alive) return;
        setSecs(s);
        setDocs(d);
        setAssigns(a);
      } catch {
        if (alive) setError("No pudimos cargar las asignaciones.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const cellMap = useMemo(() => {
    const set = new Set<string>();
    (assigns ?? []).forEach((a) => set.add(`${a.doctor_id}-${a.secretary_id}`));
    return set;
  }, [assigns]);

  async function toggleCell(doctorId: number, secretaryId: number) {
    const key = `${doctorId}-${secretaryId}`;
    if (busyCell) return;
    setBusyCell(key);
    setError(null);
    try {
      if (cellMap.has(key)) {
        await unassignSecretaryFromDoctor(secretaryId, doctorId);
      } else {
        await assignSecretaryToDoctor(secretaryId, { doctor_id: doctorId });
      }
      await reload();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No pudimos actualizar la asignación.");
      }
    } finally {
      setBusyCell(null);
    }
  }

  const totalAssigns = assigns?.length ?? 0;
  const noneCount = (secs ?? []).filter((s) => !(assigns ?? []).some((a) => a.secretary_id === s.id)).length;

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-assigns"
      role="director"
      roleBadge="Director"
      title="Asignaciones doctor ↔ secretaria"
      eyebrow={`${totalAssigns} pares activos · ${noneCount} secretarias sin asignar`}
      searchPlaceholder="Buscar médico o secretaria…"
    >
      <FadeIn>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Pares activos</Text>
            <Text style={styles.statValue}>{totalAssigns}</Text>
            <Text style={styles.statSub}>vínculos directos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Secretarias</Text>
            <Text style={styles.statValue}>{secs?.length ?? 0}</Text>
            <Text style={styles.statSub}>en la clínica</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Médicos</Text>
            <Text style={styles.statValue}>{docs?.length ?? 0}</Text>
            <Text style={styles.statSub}>en la clínica</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Sin asignar</Text>
            <Text style={[styles.statValue, noneCount > 0 && { color: colors.alert }]}>{noneCount}</Text>
            <Text style={styles.statSub}>secretarias</Text>
          </View>
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !secs || !docs || secs.length === 0 || docs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Faltan datos</Text>
          <Text style={styles.emptyText}>Necesitas al menos un médico y una secretaria.</Text>
          <Button
            label="Crear secretaria"
            variant="ghost"
            size="sm"
            iconLeft="plus"
            onPress={() => goToScreen("dir-secs", { openCreate: 1 })}
          />
        </View>
      ) : (
        <View style={styles.matrixCard}>
          <View style={styles.matrixHead}>
            <Text style={styles.matrixTitle}>Matriz de asignación</Text>
            <Text style={styles.matrixSub}>Toca cualquier celda para vincular o desvincular</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixScroll}>
            <View style={[styles.matrixGrid, { minWidth: 220 + secs.length * SEC_COL }]}>
              <View style={styles.headerRow}>
                <View style={styles.docHeadCell} />
                {secs.map((s) => (
                  <View key={s.id} style={styles.secHeadCell}>
                    <View style={styles.secAvatar}>
                      <Text style={styles.secAvatarText}>{secInitials(s)}</Text>
                    </View>
                    <Text style={styles.secName} numberOfLines={2} ellipsizeMode="tail">{`${s.first_name} ${s.last_name}`}</Text>
                  </View>
                ))}
              </View>
              {docs.map((d) => (
                <View key={d.id} style={styles.docRow}>
                  <View style={styles.docCell}>
                    <View style={styles.docAvatar}>
                      <Text style={styles.docAvatarText}>{docInitial(d)}</Text>
                    </View>
                    <Text style={styles.docName} numberOfLines={1} ellipsizeMode="tail">{`${d.first_name} ${d.last_name}`}</Text>
                  </View>
                  {secs.map((s) => {
                    const key = `${d.id}-${s.id}`;
                    const on = cellMap.has(key);
                    const busy = busyCell === key;
                    return (
                      <View key={s.id} style={styles.matrixCellWrap}>
                        <Tappable
                          onPress={() => toggleCell(d.id, s.id)}
                          accessibilityLabel={`${on ? "Quitar" : "Asignar"} ${d.first_name} ${d.last_name} a ${s.first_name} ${s.last_name}`}
                          accessibilityState={{ selected: on, disabled: busy }}
                        >
                          <View
                            accessibilityRole="button"
                            accessibilityState={{ checked: on, busy }}
                            style={[
                              styles.matrixCell,
                              on ? styles.matrixCellOn : styles.matrixCellOff
                            ]}
                          >
                            {busy ? (
                              <ActivityIndicator size="small" color={colors.ink} />
                            ) : on ? (
                              <Icon kind="check" size={16} color={colors.ink} />
                            ) : (
                              <Icon kind="plus" size={14} color={colors.ink3} />
                            )}
                          </View>
                        </Tappable>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </DesktopShell>
  );
}

const SEC_COL = 132;

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.ink3
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.84,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 28
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  matrixCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 18
  },
  matrixHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  matrixTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  matrixSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  matrixScroll: {
    padding: 20
  },
  matrixGrid: {
    minWidth: 700
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  docHeadCell: {
    width: 220
  },
  secHeadCell: {
    width: SEC_COL,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 6
  },
  secAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  secAvatarText: {
    fontFamily: family.serif,
    fontSize: 14,
    color: colors.accentDeep
  },
  secName: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink,
    textAlign: "center"
  },
  docRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  docCell: {
    width: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  docAvatar: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  docAvatarText: {
    fontFamily: family.serif,
    fontSize: 12,
    color: colors.ink
  },
  docName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1
  },
  matrixCellWrap: {
    width: SEC_COL,
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.rule3,
    alignItems: "center",
    justifyContent: "center"
  },
  matrixCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  matrixCellOn: {
    backgroundColor: colors.accentBright,
    borderWidth: 1,
    borderColor: colors.accent
  },
  matrixCellOff: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.rule
  },
  center: {
    paddingVertical: 60,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingVertical: 24,
    textAlign: "center"
  },
  emptyCard: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  }
});
