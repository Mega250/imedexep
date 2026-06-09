import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { Pagination } from "@/atomic/molecules/Pagination";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { fetchPatientFull, fetchPatientsList, Patient, PatientFull } from "@/services/api/patientsApi";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const PAGE_SIZE = 25;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function computeAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function genderSym(g: string | null): string {
  if (!g) {
    return "";
  }
  const l = g.toLowerCase();
  if (l.startsWith("f") || l.startsWith("muj")) {
    return "♀";
  }
  if (l.startsWith("m") || l.startsWith("h") || l.startsWith("hom")) {
    return "♂";
  }
  return "";
}

function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) {
    return "hoy";
  }
  if (days === 1) {
    return "ayer";
  }
  if (days < 30) {
    return `hace ${days} d`;
  }
  if (days < 365) {
    return `hace ${Math.floor(days / 30)} m`;
  }
  return `hace ${Math.floor(days / 365)} a`;
}

export function DskPatientsDesktopPage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [detail, setDetail] = useState<PatientFull | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPatients = patients
    ? patients.filter((p) => {
        if (!normalizedQuery) return true;
        const haystack = [
          p.first_name,
          p.last_name,
          p.blood_type,
          p.city,
          p.state,
          String(p.id)
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await fetchPatientsList({ page, limit: PAGE_SIZE });
        if (cancelled) {
          return;
        }
        setPatients(list.items);
        setTotal(list.total);
        setSelected((curr) => {
          if (!list.items.length) return null;
          if (curr && list.items.find((p) => p.id === curr.id)) return curr;
          return list.items[0];
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "No pudimos cargar los pacientes.");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    fetchPatientFull(selected.id)
      .then((d) => {
        if (!cancelled) {
          setDetail(d);
          setDetailLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setDetailLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const stats: [string, string, string][] = [
    ["Total cartera", String(total), `${patients?.length ?? 0} en pantalla`],
    ["Mujeres", String(patients?.filter((p) => (p.gender ?? "").toLowerCase().startsWith("f")).length ?? 0), "del listado"],
    ["Hombres", String(patients?.filter((p) => (p.gender ?? "").toLowerCase().startsWith("m") || (p.gender ?? "").toLowerCase().startsWith("h")).length ?? 0), "del listado"],
    ["Con tipo sanguíneo", String(patients?.filter((p) => p.blood_type).length ?? 0), "registrado"]
  ];

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-patients"
      role="médico"
      roleBadge="Médico"
      title="Mis pacientes"
      eyebrow={`${total} vinculados`}
      searchPlaceholder="Buscar paciente, ciudad…"
      searchValue={query}
      onSearchChange={setQuery}
      topBarRight={
        <Button
          label="Vincular paciente"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="qr"
          onPress={() => goToScreen("doc-qr")}
        />
      }
    >
      <FadeIn>
        <View style={styles.statRow}>
          {stats.map(([k, n, sub]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{k}</Text>
              <Text style={styles.statValue}>{n}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando pacientes…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !patients || patients.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>Aún no tienes pacientes vinculados</Text>
          <Text style={styles.emptySub}>Usa el botón de vincular para acceder a un expediente.</Text>
        </View>
      ) : (
        <View style={styles.mainCols}>
          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.headCell, styles.colPatient]}>Paciente</Text>
              <Text style={[styles.headCell, styles.colDx]}>Datos</Text>
              <Text style={[styles.headCell, styles.colLast]}>Vinculado</Text>
              <Text style={[styles.headCell, styles.colNext]}>Sensib.</Text>
              <View style={styles.colMore} />
            </View>
            {(filteredPatients ?? []).length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptySub}>Sin coincidencias para "{query.trim()}".</Text>
              </View>
            ) : null}
            {(filteredPatients ?? []).map((p, i) => {
              const isSel = selected?.id === p.id;
              const fullName = `${p.first_name} ${p.last_name}`.trim();
              const sex = genderSym(p.gender);
              const age = computeAge(p.date_of_birth);
              const lastIndex = (filteredPatients?.length ?? 1) - 1;
              return (
                <Tappable key={p.id} onPress={() => setSelected(p)} scaleTo={0.995}>
                  <View
                    style={[
                      styles.tableRow,
                      { borderBottomWidth: i < lastIndex ? 1 : 0 },
                      isSel && styles.tableRowSelected
                    ]}
                  >
                    <View style={[styles.colPatient, styles.patientCell]}>
                      <View style={[styles.rowAvatar, { backgroundColor: isSel ? colors.accentBright : colors.paper4 }]}>
                        <Text style={styles.rowAvatarText}>{initials(fullName)}</Text>
                      </View>
                      <View style={styles.flexShrink}>
                        <View style={styles.nameLine}>
                          <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{fullName}</Text>
                        </View>
                        <Text style={styles.patientMeta} numberOfLines={1} ellipsizeMode="tail">
                          {sex} {age}a · #{p.id}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.colDx, styles.dxText]} numberOfLines={1} ellipsizeMode="tail">
                      {p.blood_type ?? "—"} · {p.city ?? "sin ciudad"}
                    </Text>
                    <Text style={[styles.colLast, styles.lastText]} numberOfLines={1} ellipsizeMode="tail">{daysAgo(p.created_at)}</Text>
                    <Text style={[styles.colNext, styles.nextText, { color: colors.ink2 }]}>nivel {p.sensitivity_level}</Text>
                    <View style={styles.colMore}>
                      <Icon kind="chev" size={14} color={colors.ink3} />
                    </View>
                  </View>
                </Tappable>
              );
            })}
          </View>

          {selected ? (
            <View style={styles.previewCard}>
              <View style={styles.previewHead}>
                <View style={styles.previewBlob} />
                <View style={styles.previewHeadRow}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>{initials(`${selected.first_name} ${selected.last_name}`)}</Text>
                  </View>
                  <View style={styles.flexShrink}>
                    <Text style={styles.previewName} numberOfLines={2} ellipsizeMode="tail">{`${selected.first_name} ${selected.last_name}`}</Text>
                    <Text style={styles.previewMeta}>
                      {genderSym(selected.gender)} {computeAge(selected.date_of_birth)}a · vinculado {daysAgo(selected.created_at)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.previewBody}>
                <Text style={[styles.eyebrow, styles.previewSection]}>Datos clínicos</Text>
                {detailLoading ? (
                  <ActivityIndicator color={colors.accentDeep} />
                ) : detail ? (
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryCell}>
                      <Text style={styles.eyebrow}>Sangre</Text>
                      <Text style={styles.summaryValue}>{detail.blood_type ?? "—"}</Text>
                      <Text style={styles.summaryBody}>tipo</Text>
                    </View>
                    <View style={styles.summaryCell}>
                      <Text style={styles.eyebrow}>IMC</Text>
                      <Text style={styles.summaryValue}>{detail.bmi ?? "—"}</Text>
                      <Text style={styles.summaryBody}>
                        {detail.weight_kg ? `${detail.weight_kg} kg` : "sin peso"}
                      </Text>
                    </View>
                    <View style={styles.summaryCell}>
                      <Text style={styles.eyebrow}>T/A</Text>
                      <Text style={styles.summaryValue}>
                        {detail.systolic_bp && detail.diastolic_bp ? `${detail.systolic_bp}/${detail.diastolic_bp}` : "—"}
                      </Text>
                      <Text style={styles.summaryBody}>mmHg</Text>
                    </View>
                    <View style={styles.summaryCell}>
                      <Text style={styles.eyebrow}>Glucosa</Text>
                      <Text style={styles.summaryValue}>{detail.glucose_mg_dl ?? "—"}</Text>
                      <Text style={styles.summaryBody}>{detail.glucose_risk ?? "mg/dL"}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.emptySub}>No hay datos clínicos disponibles.</Text>
                )}

                <View style={styles.previewActions}>
                  <Button
                    label="Empezar consulta"
                    variant="accent"
                    size="sm"
                    onPress={async () => {
                      await setSelectedPatientId(selected.id);
                      goToScreen("doctor-active");
                    }}
                    style={styles.previewBtn}
                  />
                  <Button
                    label="Ver expediente"
                    variant="ghost"
                    size="sm"
                    onPress={async () => {
                      await setSelectedPatientId(selected.id);
                      goToScreen("doc-full");
                    }}
                    style={styles.previewBtn}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {!error && total > 0 ? (
        <Pagination
          page={page}
          limit={PAGE_SIZE}
          total={total}
          onChange={setPage}
          disabled={loading}
        />
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
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
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14
  },
  tableCard: {
    flexGrow: 3,
    flexBasis: 460,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    borderLeftWidth: 3,
    borderLeftColor: "transparent"
  },
  headCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: colors.rule3,
    borderLeftWidth: 3,
    borderLeftColor: "transparent"
  },
  tableRowSelected: {
    backgroundColor: colors.paper3,
    borderLeftColor: colors.accent
  },
  colPatient: {
    flexGrow: 1.8,
    flexBasis: 0,
    minWidth: 0
  },
  colDx: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colLast: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colNext: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  patientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  patientName: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  },
  dxText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  lastText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3
  },
  nextText: {
    fontSize: 11.5,
    fontFamily: family.mono
  },
  previewCard: {
    flexGrow: 2,
    flexBasis: 320,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  previewHead: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  previewBlob: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.18)",
    top: -60,
    right: -50
  },
  previewHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  previewAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  previewAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.ink
  },
  previewName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.48,
    color: colors.paper
  },
  previewMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  previewBody: {
    padding: 16
  },
  previewSection: {
    marginBottom: 8
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  summaryCell: {
    flexGrow: 1,
    flexBasis: "45%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  summaryValue: {
    fontFamily: family.medium,
    fontSize: 18,
    letterSpacing: -0.36,
    color: colors.ink,
    marginTop: 4
  },
  summaryBody: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    marginTop: 4,
    lineHeight: 13
  },
  previewActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12
  },
  previewBtn: {
    flex: 1
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.alert
  },
  emptyPanel: {
    marginTop: 18,
    padding: 32,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
  },
  emptyRow: {
    padding: 24,
    alignItems: "center"
  }
});
