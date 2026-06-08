import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { StatTile } from "@/atomic/molecules/StatTile";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { Modal, Pressable } from "react-native";
import {
  Secretary,
  SecretaryDoctorAssignment,
  assignSecretaryToDoctor,
  fetchInstitutionDoctors,
  fetchSecretaries,
  fetchSecretaryAssignments,
  unassignSecretaryFromDoctor
} from "@/services/api/secretaryApi";
import { Doctor } from "@/services/api/doctorsApi";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function DirAssignsMobilePage() {
  const [secs, setSecs] = useState<Secretary[] | null>(null);
  const [assigns, setAssigns] = useState<SecretaryDoctorAssignment[] | null>(null);
  const [docs, setDocs] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerSecId, setPickerSecId] = useState<number | null>(null);

  async function reload() {
    const [s, a] = await Promise.all([fetchSecretaries(), fetchSecretaryAssignments()]);
    setSecs(s);
    setAssigns(a);
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, a, d] = await Promise.all([
          fetchSecretaries(),
          fetchSecretaryAssignments(),
          fetchInstitutionDoctors().catch(() => [] as Doctor[])
        ]);
        if (!alive) return;
        setSecs(s);
        setAssigns(a);
        setDocs(d);
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

  async function assignDoctor(doctorId: number) {
    if (!pickerSecId) return;
    try {
      await assignSecretaryToDoctor(pickerSecId, { doctor_id: doctorId });
      setPickerSecId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos asignar el médico.");
      setPickerSecId(null);
    }
  }

  async function unassignDoctor(secretaryId: number, doctorId: number) {
    try {
      await unassignSecretaryFromDoctor(secretaryId, doctorId);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos quitar la asignación.");
    }
  }

  const groups = useMemo(() => {
    const map = new Map<number, SecretaryDoctorAssignment[]>();
    (assigns ?? []).forEach((a) => {
      const list = map.get(a.secretary_id) ?? [];
      list.push(a);
      map.set(a.secretary_id, list);
    });
    return map;
  }, [assigns]);

  const totalAssigns = assigns?.length ?? 0;
  const noneSecs = (secs ?? []).filter((s) => (groups.get(s.id) ?? []).length === 0).length;

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Inicio"
          onBack={() => goBack("dir-dash-mob")}
          sub={`${totalAssigns} pares · ${noneSecs} secretaria${noneSecs === 1 ? "" : "s"} sin asignar`}
          title="Asignaciones"
        />
      }
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <FadeIn>
            <View style={styles.statRow}>
              <StatTile
                label="Pares activos"
                value={String(totalAssigns)}
                sub="médico ↔ sec."
              />
              <StatTile
                label="Sin asignar"
                value={String(noneSecs)}
                sub="secretarias"
                valueColor={noneSecs > 0 ? colors.alert : colors.ink}
              />
            </View>
          </FadeIn>

          {(secs ?? []).length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aún no hay secretarias</Text>
              <Text style={styles.emptyText}>Crea una secretaria para empezar a asignar.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {(secs ?? []).map((s, index) => {
                const docs = groups.get(s.id) ?? [];
                return (
                  <FadeIn key={s.id} delay={index * 60}>
                    <View style={styles.card}>
                      <View style={styles.cardHead}>
                        <Avatar
                          initials={initials(s.first_name, s.last_name)}
                          size={36}
                          radius={10}
                          bg={colors.paper3}
                          fg={colors.accentDeep}
                          serif
                          fontSize={14}
                        />
                        <View style={styles.flex}>
                          <Text style={styles.secName}>{`${s.first_name} ${s.last_name}`}</Text>
                          <Text style={styles.secSub}>{docs.length} médicos asignados</Text>
                        </View>
                        <Button
                          label="+ médico"
                          variant="ghost"
                          size="sm"
                          block={false}
                          height={26}
                          onPress={() => setPickerSecId(s.id)}
                        />
                      </View>
                      {docs.length ? (
                        <View style={styles.chips}>
                          {docs.map((d) => (
                            <Tappable
                              key={d.id}
                              style={styles.docChip}
                              onPress={() => unassignDoctor(s.id, d.doctor_id)}
                            >
                              <Text style={styles.docChipText}>{d.doctor_name}</Text>
                            </Tappable>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.noneTag}>
                          <Text style={styles.noneText}>SIN ASIGNAR</Text>
                        </View>
                      )}
                    </View>
                  </FadeIn>
                );
              })}
            </View>
          )}
        </>
      )}
      <Modal
        visible={pickerSecId !== null}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setPickerSecId(null)}
      >
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerSecId(null)}>
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Asignar médico</Text>
            {docs.length === 0 ? (
              <Text style={styles.pickerEmpty}>No hay médicos en tu institución todavía.</Text>
            ) : (
              docs.map((d) => (
                <Tappable key={d.id} onPress={() => assignDoctor(d.id)} style={styles.pickerRow}>
                  <Text style={styles.pickerRowText}>
                    {d.first_name} {d.last_name}
                  </Text>
                </Tappable>
              ))
            )}
            <Button label="Cerrar" variant="ghost" size="sm" onPress={() => setPickerSecId(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  pickerCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 18,
    gap: 8
  },
  pickerTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4
  },
  pickerEmpty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  pickerRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule2
  },
  pickerRowText: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30
  },
  flex: {
    flex: 1
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  list: {
    gap: 10,
    marginTop: 14
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 14
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  secName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  secSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10
  },
  docChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  docChipText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep
  },
  noneTag: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.alertSoft
  },
  noneText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.alert,
    letterSpacing: 0.5
  },
  center: {
    paddingVertical: 40,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingVertical: 18,
    textAlign: "center"
  },
  emptyBox: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    alignItems: "center",
    gap: 4
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    textAlign: "center"
  }
});
