import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/services/api/client";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FormField } from "@/atomic/molecules/FormField";
import { SelectField } from "@/atomic/molecules/SelectField";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { superadminNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import {
  createInstitution,
  fetchInstitutions,
  fetchInstitutionAdmins,
  Institution,
  InstitutionAdmin,
  InstitutionType,
  updateInstitution
} from "@/services/api/institutionsApi";
import { setSelectedInstitutionId } from "@/state/selectedInstitution";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const TYPE_LABELS: Record<InstitutionType, string> = {
  private_clinic: "Clínica privada",
  hospital: "Hospital",
  school_dispensary: "Dispensario escolar"
};

const TYPE_VALUES: InstitutionType[] = ["private_clinic", "hospital", "school_dispensary"];

function typeFromLabel(label: string): InstitutionType {
  const found = TYPE_VALUES.find((v) => TYPE_LABELS[v] === label);
  return found ?? "private_clinic";
}

function instInitials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .filter((s) => s[0] && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(s[0]))
    .slice(0, 2)
    .map((s) => s[0])
    .join("") || name.slice(0, 2).toUpperCase();
}

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

function stateColors(active: boolean) {
  if (active) {
    return { bg: colors.okSoft, fg: colors.ok };
  }
  return { bg: colors.alertSoft, fg: colors.alert };
}

function FilterPill({ label, count, on }: { label: string; count: number; on: boolean }) {
  return (
    <View
      style={[
        styles.pill,
        {
          borderColor: on ? colors.ink : colors.rule,
          backgroundColor: on ? colors.ink : colors.white
        }
      ]}
    >
      <Text style={[styles.pillText, { color: on ? colors.paper : colors.ink2 }]}>{label}</Text>
      <Text style={[styles.pillCount, { color: on ? colors.paper : colors.ink2, opacity: 0.65 }]}>
        {count}
      </Text>
    </View>
  );
}

export function SAInstDesktopPage() {
  const [list, setList] = useState<Institution[]>([]);
  const [selected, setSelected] = useState<Institution | null>(null);
  const [admins, setAdmins] = useState<InstitutionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [fType, setFType] = useState<InstitutionType>("private_clinic");
  const [fName, setFName] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"nombre" | "id">("nombre");
  const [toggling, setToggling] = useState(false);

  async function refetchList(): Promise<Institution[]> {
    const data = await fetchInstitutions();
    const arr = Array.isArray(data) ? data : [];
    setList(arr);
    return arr;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchInstitutions();
        if (!cancelled) {
          setList(Array.isArray(data) ? data : []);
          setSelected(Array.isArray(data) && data.length > 0 ? data[0] : null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar instituciones.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm(): void {
    setFType("private_clinic");
    setFName("");
    setFAddress("");
    setFPhone("");
    setFormError(null);
  }

  async function handleCreate(): Promise<void> {
    if (busy) {
      return;
    }
    const trimmedName = fName.trim();
    if (trimmedName.length < 2) {
      setFormError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const trimmedPhone = fPhone.trim();
    if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone)) {
      setFormError("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }
    setFormError(null);
    setBusy(true);
    try {
      await createInstitution({
        type: fType,
        name: trimmedName,
        address: fAddress.trim() ? fAddress.trim() : null,
        phone: trimmedPhone ? trimmedPhone : null,
        is_active: true
      });
      const arr = await refetchList();
      setSelected(arr.length > 0 ? arr[arr.length - 1] : null);
      resetForm();
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No pudimos crear la institución.";
      setFormError(msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!selected) {
      setAdmins([]);
      return;
    }
    setLoadingAdmins(true);
    (async () => {
      try {
        const adm = await fetchInstitutionAdmins(selected.id);
        if (!cancelled) {
          setAdmins(Array.isArray(adm) ? adm : []);
          setLoadingAdmins(false);
        }
      } catch {
        if (!cancelled) {
          setAdmins([]);
          setLoadingAdmins(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  function openDetail(inst: Institution): void {
    setSelectedInstitutionId(inst.id);
    goToScreen("sa-inst-detail");
  }

  async function handleToggleActive(): Promise<void> {
    if (!selected || toggling) {
      return;
    }
    setToggling(true);
    try {
      await updateInstitution(selected.id, { is_active: selected.is_active === false });
      const arr = await refetchList();
      setSelected(arr.find((i) => i.id === selected.id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar la institución.");
    } finally {
      setToggling(false);
    }
  }

  const total = list.length;
  const active = list.filter((i) => i.is_active !== false).length;
  const inactive = total - active;

  const displayed = list
    .filter((i) => {
      if (filter === "active") {
        return i.is_active !== false;
      }
      if (filter === "inactive") {
        return i.is_active === false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => (sortBy === "id" ? a.id - b.id : a.name.localeCompare(b.name)));

  const STATS: [string, string, string, boolean][] = [
    ["Instituciones", String(total), "registradas en BD", false],
    ["Activas", String(active), "is_active = true", false],
    ["Inactivas", String(inactive), "pausadas o eliminadas", inactive > 0],
    ["Administradores selección", String(admins.length), selected?.name ?? "—", false]
  ];

  const FILTERS: [string, number, "all" | "active" | "inactive"][] = [
    ["Todas", total, "all"],
    ["Activas", active, "active"],
    ["Inactivas", inactive, "inactive"]
  ];

  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="sa-inst"
      role="superadmin · root"
      roleBadge="Superadmin"
      title="Instituciones"
      eyebrow={`${total} clínicas registradas`}
      topBarRight={
        <Button
          label={showForm ? "Cerrar" : "Nueva institución"}
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft={showForm ? "x" : "plus"}
          onPress={() => {
            setFormError(null);
            setShowForm((v) => !v);
          }}
        />
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {showForm ? (
        <FadeIn>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Nueva institución</Text>
              <Text style={styles.formSub}>
                Crea una clínica, hospital o dispensario escolar.
              </Text>
            </View>
            <View style={styles.formGrid}>
              <View style={styles.formCol}>
                <SelectField
                  label="Tipo"
                  value={TYPE_LABELS[fType]}
                  options={TYPE_VALUES.map((v) => TYPE_LABELS[v])}
                  onValueChange={(label) => setFType(typeFromLabel(label))}
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Nombre"
                  placeholder="Nombre legal de la institución"
                  value={fName}
                  onChangeText={setFName}
                  hint="Mínimo 2 caracteres."
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Dirección"
                  placeholder="Calle, número, ciudad"
                  value={fAddress}
                  onChangeText={setFAddress}
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Teléfono"
                  placeholder="+52 …"
                  keyboardType="phone-pad"
                  value={fPhone}
                  onChangeText={setFPhone}
                />
              </View>
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <View style={styles.formActions}>
              <Button
                label="Cancelar"
                variant="ghost"
                size="sm"
                block={false}
                height={38}
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
              />
              <Button
                label={busy ? "Creando…" : "Crear institución"}
                variant="accent"
                size="sm"
                block={false}
                height={38}
                iconLeft="check"
                disabled={busy}
                onPress={handleCreate}
              />
            </View>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn>
        <View style={styles.statRow}>
          {STATS.map(([k, n, sub, alert]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{k}</Text>
              <Text style={[styles.statValue, alert ? { color: colors.mid } : null]}>{n}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <View style={styles.filterRow}>
        <View style={styles.filterPills}>
          {FILTERS.map(([k, n, key]) => (
            <Tappable key={k} onPress={() => setFilter(key)} scaleTo={0.97}>
              <FilterPill label={k} count={n} on={filter === key} />
            </Tappable>
          ))}
        </View>
        <Tappable
          onPress={() => setSortBy((v) => (v === "nombre" ? "id" : "nombre"))}
          scaleTo={0.97}
        >
          <Text style={styles.sortText}>Ordenar: {sortBy} ▾</Text>
        </Tappable>
      </View>

      <FadeIn delay={80}>
        <View style={styles.mainCols}>
          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.headCell, styles.colInst]}>Institución</Text>
              <Text style={[styles.headCell, styles.colCity]}>Ciudad</Text>
              <Text style={[styles.headCell, styles.colDrs]}>Estado</Text>
              <Text style={[styles.headCell, styles.colPats]}>ID</Text>
              <Text style={[styles.headCell, styles.colState]}>Activa</Text>
              <View style={styles.colMore} />
            </View>
            {displayed.length === 0 && !loading ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  {list.length === 0 ? "Sin instituciones" : "Sin resultados"}
                </Text>
                <Text style={styles.emptySub}>
                  {list.length === 0
                    ? "Crea la primera con el botón."
                    : "Ajusta el filtro para ver más."}
                </Text>
              </View>
            ) : (
              displayed.map((it, i) => {
                const isSel = selected?.id === it.id;
                const isActive = it.is_active !== false;
                const stc = stateColors(isActive);
                return (
                  <Tappable
                    key={it.id}
                    onPress={() => setSelected(it)}
                    scaleTo={0.995}
                  >
                    <View
                      style={[
                        styles.tableRow,
                        { borderBottomWidth: i < displayed.length - 1 ? 1 : 0 },
                        isSel ? styles.tableRowSelected : null
                      ]}
                    >
                      <View style={[styles.colInst, styles.instCell]}>
                        <View
                          style={[
                            styles.rowAvatar,
                            { backgroundColor: colors.ink }
                          ]}
                        >
                          <Text style={[styles.rowAvatarText, { color: colors.paper }]}>
                            {instInitials(it.name)}
                          </Text>
                        </View>
                        <View style={styles.flexShrink}>
                          <Text style={styles.instName} numberOfLines={1}>
                            {it.name}
                          </Text>
                          <Text style={styles.instMeta}>id {it.id}</Text>
                        </View>
                      </View>
                      <Text style={[styles.colCity, styles.cellMono]} numberOfLines={1} ellipsizeMode="tail">{it.city ?? "—"}</Text>
                      <Text style={[styles.colDrs, styles.cellMono]} numberOfLines={1} ellipsizeMode="tail">
                        {isActive ? "activa" : "inactiva"}
                      </Text>
                      <Text style={[styles.colPats, styles.cellMono]}>{it.id}</Text>
                      <View style={styles.colState}>
                        <View style={[styles.statePill, { backgroundColor: stc.bg }]}>
                          <Text style={[styles.statePillText, { color: stc.fg }]}>
                            {isActive ? "activa" : "inactiva"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.colMore}>
                        <Icon kind="chev" size={14} color={colors.ink3} />
                      </View>
                    </View>
                  </Tappable>
                );
              })
            )}
          </View>

          {selected ? (
            <View style={styles.detailCard}>
              <View style={styles.detailHead}>
                <RadialBlob
                  size={200}
                  color="rgba(0,180,216,0.3)"
                  opacity={1}
                  edge={70}
                  style={{ top: -60, right: -50 }}
                />
                <View style={styles.detailHeadInner}>
                  <View style={styles.detailTitleRow}>
                    <View style={styles.detailAvatar}>
                      <Text style={styles.detailAvatarText}>{instInitials(selected.name)}</Text>
                    </View>
                    <View style={styles.flexShrink}>
                      <Text style={styles.detailName} numberOfLines={2}>
                        {selected.name}
                      </Text>
                      <Text style={styles.detailMeta}>
                        id {selected.id} · {selected.city ?? "—"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailTagRow}>
                    <View style={[styles.detailTag, { backgroundColor: colors.accentBright }]}>
                      <Text style={[styles.detailTagText, { color: colors.ink }]}>
                        {selected.is_active === false ? "INACTIVA" : "ACTIVA"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.detailBody}>
                <Text style={[styles.eyebrow, styles.detailSection]}>
                  Administradores · {admins.length}
                </Text>
                <View style={styles.adminList}>
                  {loadingAdmins ? (
                    <ActivityIndicator color={colors.accentDeep} />
                  ) : admins.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyTitle}>Sin administradores</Text>
                      <Text style={styles.emptySub}>Asigna uno con el botón inferior.</Text>
                    </View>
                  ) : (
                    admins.map((a) => {
                      const full = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || a.email || "—";
                      return (
                        <View key={a.id} style={styles.adminRow}>
                          <View style={styles.adminAvatar}>
                            <Text style={styles.adminAvatarText}>{lastTwoInitials(full)}</Text>
                          </View>
                          <View style={styles.flexShrink}>
                            <Text style={styles.adminName} numberOfLines={1}>
                              {full}
                            </Text>
                            <Text style={styles.adminRole} numberOfLines={1}>
                              {a.email ?? "—"} · {a.role ?? "admin"}
                            </Text>
                          </View>
                          <Icon kind="more" size={14} color={colors.ink3} />
                        </View>
                      );
                    })
                  )}
                  <Tappable
                    scaleTo={0.98}
                    onPress={() => {
                      if (selected) {
                        setSelectedInstitutionId(selected.id);
                      }
                      goToScreen("sa-inst-detail", { openAdminForm: 1 });
                    }}
                    style={styles.assignBtn}
                  >
                    <Icon kind="plus" size={12} color={colors.ink} />
                    <Text style={styles.assignBtnText}>Asignar nuevo administrador</Text>
                  </Tappable>
                </View>

                <View style={styles.detailActions}>
                  <Button
                    label="Detalle"
                    variant="accent"
                    size="sm"
                    onPress={() => openDetail(selected)}
                    style={styles.detailBtn}
                  />
                  <Tappable
                    scaleTo={0.98}
                    disabled={toggling}
                    onPress={handleToggleActive}
                    style={styles.pauseBtn}
                  >
                    <Text style={styles.pauseBtnText}>
                      {toggling
                        ? "…"
                        : selected.is_active === false
                          ? "Activar"
                          : "Pausar"}
                    </Text>
                  </Tappable>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </FadeIn>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
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
  formCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginBottom: 16,
    gap: 14
  },
  formHeader: {
    gap: 4
  },
  formTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  formSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  formCol: {
    flexGrow: 1,
    flexBasis: 240,
    minWidth: 0
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  emptyBox: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 6
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
    textAlign: "center"
  },
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18
  },
  filterPills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center"
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
  sortText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
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
    borderBottomColor: colors.rule2
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
  colInst: {
    flexGrow: 2,
    flexBasis: 0,
    minWidth: 0
  },
  colCity: {
    flexGrow: 0.9,
    flexBasis: 0,
    minWidth: 0
  },
  colDrs: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  colPats: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  colState: {
    flexGrow: 0.9,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  instCell: {
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
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.serif,
    fontSize: 14
  },
  instName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  instMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  },
  cellMono: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  statePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start"
  },
  statePillText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.57,
    textTransform: "uppercase"
  },
  detailCard: {
    flexGrow: 2,
    flexBasis: 320,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  detailHead: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  detailHeadInner: {
    position: "relative"
  },
  detailTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  detailAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  detailAvatarText: {
    fontFamily: family.serif,
    fontSize: 22,
    color: colors.ink
  },
  detailName: {
    fontFamily: family.serif,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.48,
    color: colors.paper
  },
  detailMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  detailTagRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14
  },
  detailTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  detailTagText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.57
  },
  detailBody: {
    padding: 16
  },
  detailSection: {
    marginTop: 4,
    marginBottom: 8
  },
  adminList: {
    gap: 6
  },
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  adminAvatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  adminAvatarText: {
    fontFamily: family.semibold,
    fontSize: 10,
    color: colors.accentDeep
  },
  adminName: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  adminRole: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  assignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 32,
    marginTop: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  assignBtnText: {
    fontFamily: family.medium,
    fontSize: 11.5,
    color: colors.ink
  },
  detailActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16
  },
  detailBtn: {
    flex: 1
  },
  pauseBtn: {
    flex: 1,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.white
  },
  pauseBtnText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.alert
  }
});
