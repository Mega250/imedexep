import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FormField } from "@/atomic/molecules/FormField";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { ApiError } from "@/services/api/client";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import {
  Secretary,
  SecretaryCreatePayload,
  SecretaryDoctorAssignment,
  createSecretary,
  fetchSecretaries,
  fetchSecretaryAssignments,
  updateSecretary
} from "@/services/api/secretaryApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type CreateFormState = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  contact_phone: string;
  employee_number: string;
};

const EMPTY_FORM: CreateFormState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  contact_phone: "",
  employee_number: ""
};

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function assignedInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
}

export function DirSecsDesktopPage() {
  const params = useLocalSearchParams<{ openCreate?: string }>();
  const [secs, setSecs] = useState<Secretary[] | null>(null);
  const [assigns, setAssigns] = useState<SecretaryDoctorAssignment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function refetch() {
    const [s, a] = await Promise.all([fetchSecretaries(), fetchSecretaryAssignments()]);
    setSecs(s);
    setAssigns(a);
  }

  function updateField(key: keyof CreateFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleForm() {
    if (formOpen) {
      setFormOpen(false);
      setFormError(null);
    } else {
      setForm(EMPTY_FORM);
      setFormError(null);
      setFormOpen(true);
    }
  }

  async function submitForm() {
    if (submitting) return;
    setFormError(null);
    const first = form.first_name.trim();
    const last = form.last_name.trim();
    const email = form.email.trim();
    const phone = form.contact_phone.trim();
    const employee = form.employee_number.trim();
    if (!first || !last || !email || !form.password) {
      setFormError("Completa nombre, apellidos, correo y contraseña.");
      return;
    }
    if (form.password.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (phone && phone.replace(/\D/g, "").length !== 10) {
      setFormError("El teléfono debe tener 10 dígitos.");
      return;
    }
    const payload: SecretaryCreatePayload = {
      first_name: first,
      last_name: last,
      email,
      password: form.password,
      contact_phone: phone ? phone : null,
      employee_number: employee ? employee : null
    };
    setSubmitting(true);
    try {
      await createSecretary(payload);
      await refetch();
      setForm(EMPTY_FORM);
      setFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("No pudimos crear la secretaria. Revisa los datos e intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive() {
    if (!selected || acting) return;
    setActing(true);
    setActionMessage(null);
    try {
      const updated = await updateSecretary(selected.id, { is_active: !selected.is_active });
      setSecs((prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? null);
      setActionMessage(updated.is_active ? "Secretaria activada." : "Secretaria desactivada.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No se pudo actualizar la secretaria.");
    } finally {
      setActing(false);
    }
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, a] = await Promise.all([fetchSecretaries(), fetchSecretaryAssignments()]);
        if (!alive) return;
        setSecs(s);
        setAssigns(a);
        if (s.length > 0) setSelectedId((prev) => prev ?? s[0].id);
      } catch {
        if (alive) setError("No pudimos cargar las secretarias.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (params.openCreate === "1") {
      setForm(EMPTY_FORM);
      setFormError(null);
      setFormOpen(true);
    }
  }, [params.openCreate]);

  const assignmentsBySec = useMemo(() => {
    const map = new Map<number, SecretaryDoctorAssignment[]>();
    (assigns ?? []).forEach((a) => {
      const list = map.get(a.secretary_id) ?? [];
      list.push(a);
      map.set(a.secretary_id, list);
    });
    return map;
  }, [assigns]);

  const selected = (secs ?? []).find((s) => s.id === selectedId) ?? null;
  const selectedDocs = selected ? assignmentsBySec.get(selected.id) ?? [] : [];

  const totalSecs = secs?.length ?? 0;
  const activeSecs = (secs ?? []).filter((s) => s.is_active).length;
  const totalAssigns = assigns?.length ?? 0;
  const unassigned = (secs ?? []).filter((s) => (assignmentsBySec.get(s.id) ?? []).length === 0).length;

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-secs"
      role="director"
      roleBadge="Director"
      title="Secretarias"
      eyebrow={`${totalSecs} cuenta${totalSecs === 1 ? "" : "s"} · ${totalAssigns} asignaciones`}
      searchPlaceholder="Buscar secretaria…"
      topBarRight={
        <Button
          label={formOpen ? "Cerrar formulario" : "Crear secretaria"}
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft={formOpen ? "x" : "plus"}
          onPress={toggleForm}
        />
      }
    >
      <FadeIn>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Secretarias</Text>
            <Text style={styles.statValue}>{activeSecs}</Text>
            <Text style={styles.statSub}>activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Asignaciones</Text>
            <Text style={styles.statValue}>{totalAssigns}</Text>
            <Text style={styles.statSub}>médico ↔ sec.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Promedio</Text>
            <Text style={styles.statValue}>
              {totalSecs > 0 ? (totalAssigns / totalSecs).toFixed(1) : "0"}
            </Text>
            <Text style={styles.statSub}>doctores / sec.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Sin asignar</Text>
            <Text style={[styles.statValue, unassigned > 0 && { color: colors.alert }]}>
              {unassigned}
            </Text>
            <Text style={styles.statSub}>requieren acción</Text>
          </View>
        </View>
      </FadeIn>

      {formOpen ? (
        <FadeIn>
          <View style={styles.formCard}>
            <View style={styles.formHead}>
              <View>
                <Text style={styles.eyebrow}>Nueva cuenta</Text>
                <Text style={styles.formTitle}>Crear secretaria</Text>
              </View>
              <Tappable onPress={toggleForm} hitSlop={8} scaleTo={0.9}>
                <Icon kind="x" size={18} color={colors.ink3} />
              </Tappable>
            </View>
            <View style={styles.formGrid}>
              <FormField
                label="Nombre"
                placeholder="Ana"
                value={form.first_name}
                onChangeText={(v) => updateField("first_name", v)}
                style={styles.formCol}
              />
              <FormField
                label="Apellidos"
                placeholder="García López"
                value={form.last_name}
                onChangeText={(v) => updateField("last_name", v)}
                style={styles.formCol}
              />
              <FormField
                label="Correo"
                placeholder="ana@clinica.mx"
                icon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => updateField("email", v)}
                style={styles.formCol}
              />
              <FormField
                label="Contraseña"
                placeholder="mínimo 8 caracteres"
                icon="lock"
                secureTextEntry
                autoCapitalize="none"
                value={form.password}
                onChangeText={(v) => updateField("password", v)}
                hint="≥ 8 caracteres"
                style={styles.formCol}
              />
              <FormField
                label="Teléfono de contacto"
                placeholder="opcional"
                icon="phone"
                keyboardType="phone-pad"
                value={form.contact_phone}
                onChangeText={(v) => updateField("contact_phone", v)}
                style={styles.formCol}
              />
              <FormField
                label="Número de empleado"
                placeholder="opcional"
                icon="badge"
                autoCapitalize="none"
                value={form.employee_number}
                onChangeText={(v) => updateField("employee_number", v)}
                style={styles.formCol}
              />
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <View style={styles.formActions}>
              <Button
                label="Cancelar"
                variant="ghost"
                size="sm"
                block={false}
                height={40}
                onPress={toggleForm}
                disabled={submitting}
              />
              <Button
                label={submitting ? "Creando…" : "Crear secretaria"}
                variant="accent"
                size="sm"
                block={false}
                height={40}
                iconLeft="plus"
                onPress={submitForm}
                disabled={submitting}
              />
            </View>
          </View>
        </FadeIn>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : totalSecs === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin secretarias registradas</Text>
          <Text style={styles.emptyText}>Crea la primera con el botón superior.</Text>
        </View>
      ) : (
        <View style={styles.mainCols}>
          <View style={styles.listCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.headCell, styles.colSec]}>Secretaria</Text>
              <Text style={[styles.headCell, styles.colDocs]}>Médicos asignados</Text>
              <Text style={[styles.headCell, styles.colAlta]}>Alta</Text>
              <View style={styles.colMore} />
            </View>
            {(secs ?? []).map((s, i) => {
              const docs = assignmentsBySec.get(s.id) ?? [];
              const sel = s.id === selectedId;
              return (
                <Tappable key={s.id} onPress={() => setSelectedId(s.id)} scaleTo={0.995}>
                  <View
                    style={[
                      styles.tableRow,
                      { borderBottomWidth: i < (secs?.length ?? 0) - 1 ? 1 : 0 },
                      sel && styles.tableRowSelected
                    ]}
                  >
                    <View style={[styles.colSec, styles.secCell]}>
                      <View style={styles.rowAvatar}>
                        <Text style={styles.rowAvatarText}>{initials(s.first_name, s.last_name)}</Text>
                      </View>
                      <View style={styles.flexShrink}>
                        <Text style={styles.secName} numberOfLines={1} ellipsizeMode="tail">{`${s.first_name} ${s.last_name}`}</Text>
                        <Text style={styles.secEmail} numberOfLines={1} ellipsizeMode="tail">{s.email}</Text>
                      </View>
                    </View>
                    <View style={[styles.colDocs, styles.docTags]}>
                      {!s.is_active ? (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveText}>INACTIVA</Text>
                        </View>
                      ) : null}
                      {docs.length === 0 ? (
                        <View style={styles.unassignedBadge}>
                          <Text style={styles.unassignedText}>SIN ASIGNAR</Text>
                        </View>
                      ) : (
                        docs.map((d) => (
                          <View key={d.id} style={styles.docTag}>
                            <Text style={styles.docTagText}>{d.doctor_name}</Text>
                          </View>
                        ))
                      )}
                    </View>
                    <Text style={[styles.colAlta, styles.altaText]}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </Text>
                    <View style={styles.colMore}>
                      <Icon kind="chev" size={14} color={colors.ink3} />
                    </View>
                  </View>
                </Tappable>
              );
            })}
          </View>

          {selected ? (
            <View style={styles.detailCard}>
              <View style={styles.detailHead}>
                <RadialBlob size={180} color="rgba(0,180,216,0.3)" style={styles.detailBlob} />
                <View style={styles.detailHeadInner}>
                  <Text style={styles.detailEyebrow}>Secretaria · seleccionada</Text>
                  <Text
                    style={styles.detailName}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >{`${selected.first_name} ${selected.last_name}`}</Text>
                  <Text style={styles.detailMeta}>
                    {selected.email} · {selectedDocs.length} médicos
                  </Text>
                </View>
              </View>
              <View style={styles.detailBody}>
                <Text style={[styles.eyebrow, styles.detailSection]}>Médicos asignados</Text>
                <View style={styles.assignedList}>
                  {selectedDocs.length === 0 ? (
                    <View style={styles.detailEmpty}>
                      <Text style={styles.detailEmptyText}>Sin asignaciones aún.</Text>
                    </View>
                  ) : (
                    selectedDocs.map((d) => (
                      <View key={d.id} style={styles.assignedRow}>
                        <View style={styles.assignedAvatar}>
                          <Text style={styles.assignedAvatarText}>{assignedInitials(d.doctor_name)}</Text>
                        </View>
                        <View style={styles.flexShrink}>
                          <Text style={styles.assignedName} numberOfLines={1} ellipsizeMode="tail">{d.doctor_name}</Text>
                          <Text style={styles.assignedMeta} numberOfLines={1} ellipsizeMode="tail">asignado {new Date(d.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Icon kind="link" size={14} color={colors.ink3} />
                      </View>
                    ))
                  )}
                </View>

                <View style={styles.detailActions}>
                  <Button
                    label="Asignaciones"
                    variant="ghost"
                    size="sm"
                    onPress={() => goToScreen("dir-assigns")}
                    style={styles.detailBtn}
                  />
                  <Button
                    label={selected.is_active ? "Desactivar" : "Activar"}
                    variant={selected.is_active ? "ghost" : "accent"}
                    size="sm"
                    onPress={handleToggleActive}
                    disabled={acting}
                    style={styles.detailBtn}
                  />
                </View>
                {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
              </View>
            </View>
          ) : null}
        </View>
      )}
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
    marginTop: 18
  },
  listCard: {
    flexGrow: 1.4,
    flexBasis: 420,
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
    paddingVertical: 14,
    borderBottomColor: colors.rule3,
    borderLeftWidth: 3,
    borderLeftColor: "transparent"
  },
  tableRowSelected: {
    backgroundColor: colors.paper3,
    borderLeftColor: colors.accent,
    paddingLeft: 15
  },
  colSec: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colDocs: {
    flexGrow: 1.6,
    flexBasis: 0,
    minWidth: 0
  },
  colAlta: {
    flexGrow: 0.7,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  secCell: {
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
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.serif,
    fontSize: 14,
    color: colors.ink
  },
  secName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  secEmail: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  docTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4
  },
  docTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  docTagText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep
  },
  unassignedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.alertSoft
  },
  unassignedText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    color: colors.alert
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.rule2
  },
  inactiveText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    color: colors.ink3
  },
  altaText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  detailCard: {
    flexGrow: 1,
    flexBasis: 300,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  detailHead: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  detailBlob: {
    top: -60,
    right: -50
  },
  detailHeadInner: {
    position: "relative"
  },
  detailEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  detailName: {
    fontFamily: family.serif,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.52,
    color: colors.paper,
    marginTop: 6
  },
  detailMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6
  },
  detailBody: {
    padding: 16
  },
  detailSection: {
    marginBottom: 8
  },
  assignedList: {
    flexDirection: "column",
    gap: 6
  },
  assignedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  assignedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  assignedAvatarText: {
    fontFamily: family.serif,
    fontSize: 12,
    color: colors.accentDeep
  },
  assignedName: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  assignedMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  detailEmpty: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    alignItems: "center"
  },
  detailEmptyText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  detailActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14
  },
  detailBtn: {
    flex: 1
  },
  actionMessage: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 10
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
  },
  formCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14
  },
  formHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  formTitle: {
    fontFamily: family.serif,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.ink,
    marginTop: 4
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  formCol: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 200
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
  }
});
