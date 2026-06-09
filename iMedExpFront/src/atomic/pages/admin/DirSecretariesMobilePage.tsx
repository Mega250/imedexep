import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { FormField } from "@/atomic/molecules/FormField";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { directorTabs } from "@/navigation/tabConfigs";
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
import { family } from "@/theme/typography";

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

export function DirSecretariesMobilePage() {
  const [secs, setSecs] = useState<Secretary[] | null>(null);
  const [assigns, setAssigns] = useState<SecretaryDoctorAssignment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
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
    } catch {
      setFormError("No pudimos crear la secretaria. Revisa los datos.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(secretary: Secretary) {
    if (actingId) return;
    setActingId(secretary.id);
    setActionMessage(null);
    try {
      const updated = await updateSecretary(secretary.id, { is_active: !secretary.is_active });
      setSecs((prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? null);
      setActionMessage(updated.is_active ? "Secretaria activada." : "Secretaria desactivada.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No se pudo actualizar la secretaria.");
    } finally {
      setActingId(null);
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

  const assignmentsBySec = useMemo(() => {
    const map = new Map<number, SecretaryDoctorAssignment[]>();
    (assigns ?? []).forEach((a) => {
      const list = map.get(a.secretary_id) ?? [];
      list.push(a);
      map.set(a.secretary_id, list);
    });
    return map;
  }, [assigns]);

  const totalSecs = secs?.length ?? 0;
  const activeSecs = (secs ?? []).filter((s) => s.is_active).length;
  const totalAssigns = assigns?.length ?? 0;
  const noneCount = (secs ?? []).filter((s) => (assignmentsBySec.get(s.id) ?? []).length === 0).length;

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={directorTabs} active={2} />}
      header={<ScreenTopBar sub={`${totalSecs} cuenta${totalSecs === 1 ? "" : "s"} · ${totalAssigns} asignaciones`} title="Secretarias" />}
      floating={formOpen ? null : <FAB icon="plus" label="Crear" onPress={toggleForm} />}
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
              <StatTile label="Activas" value={String(activeSecs)} sub={`${totalSecs - noneCount} con doctores`} />
              <StatTile
                label="Sin asignar"
                value={String(noneCount)}
                sub={noneCount > 0 ? "requieren acción" : "todas vinculadas"}
                valueColor={noneCount > 0 ? colors.alert : colors.ink}
              />
            </View>
          </FadeIn>

          {formOpen ? (
            <FadeIn>
              <View style={styles.formCard}>
                <View style={styles.formHead}>
                  <Text style={styles.formTitle}>Crear secretaria</Text>
                  <Tappable onPress={toggleForm} hitSlop={8} scaleTo={0.9}>
                    <Icon kind="x" size={16} color={colors.ink3} />
                  </Tappable>
                </View>
                <FormField
                  label="Nombre"
                  placeholder="Ana"
                  value={form.first_name}
                  onChangeText={(v) => updateField("first_name", v)}
                />
                <FormField
                  label="Apellidos"
                  placeholder="García López"
                  value={form.last_name}
                  onChangeText={(v) => updateField("last_name", v)}
                />
                <FormField
                  label="Correo"
                  placeholder="ana@clinica.mx"
                  icon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(v) => updateField("email", v)}
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
                />
                <FormField
                  label="Teléfono de contacto"
                  placeholder="opcional"
                  icon="phone"
                  keyboardType="phone-pad"
                  value={form.contact_phone}
                  onChangeText={(v) => updateField("contact_phone", v)}
                />
                <FormField
                  label="Número de empleado"
                  placeholder="opcional"
                  icon="badge"
                  autoCapitalize="none"
                  value={form.employee_number}
                  onChangeText={(v) => updateField("employee_number", v)}
                />
                {formError ? <Text style={styles.formError}>{formError}</Text> : null}
                <View style={styles.formActions}>
                  <View style={styles.flex}>
                    <Button
                      label="Cancelar"
                      variant="ghost"
                      size="sm"
                      height={40}
                      onPress={toggleForm}
                      disabled={submitting}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Button
                      label={submitting ? "Creando…" : "Crear"}
                      variant="accent"
                      size="sm"
                      height={40}
                      iconLeft="plus"
                      onPress={submitForm}
                      disabled={submitting}
                    />
                  </View>
                </View>
              </View>
            </FadeIn>
          ) : null}

          {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}

          {totalSecs === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aún no hay secretarias</Text>
              <Text style={styles.emptyText}>Crea la primera para asignar pacientes y agendas.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {(secs ?? []).map((s, index) => {
                const docs = assignmentsBySec.get(s.id) ?? [];
                const none = docs.length === 0;
                return (
                  <FadeIn key={s.id} delay={index * 60}>
                    <View style={[styles.card, { borderColor: colors.rule }]}>
                      <View style={styles.cardHead}>
                        <Avatar
                          initials={initials(s.first_name, s.last_name)}
                          size={40}
                          radius={11}
                          bg={colors.paper4}
                          fg={colors.ink}
                          serif
                          fontSize={15}
                        />
                        <View style={styles.flex}>
                          <Text style={styles.name}>{`${s.first_name} ${s.last_name}`}</Text>
                          <Text style={styles.email} numberOfLines={1}>
                            {s.email}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cardFoot}>
                        {none ? (
                          <View style={styles.noneTag}>
                            <Text style={styles.noneText}>SIN ASIGNAR</Text>
                          </View>
                        ) : (
                          <View style={styles.docsTag}>
                            <Text style={styles.docsText}>{docs.length} médicos</Text>
                          </View>
                        )}
                        {!s.is_active ? (
                          <View style={styles.inactiveTag}>
                            <Text style={styles.inactiveText}>INACTIVA</Text>
                          </View>
                        ) : null}
                        <View style={styles.flex} />
                        <Button
                          label="Asignar"
                          variant="ghost"
                          size="sm"
                          block={false}
                          height={26}
                          onPress={() => goToScreen("dir-assigns-mob")}
                        />
                        <Button
                          label={s.is_active ? "Pausar" : "Activar"}
                          variant={s.is_active ? "ghost" : "accent"}
                          size="sm"
                          block={false}
                          height={26}
                          disabled={actingId === s.id}
                          onPress={() => handleToggleActive(s)}
                        />
                      </View>
                    </View>
                  </FadeIn>
                );
              })}
            </View>
          )}
        </>
      )}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 130
  },
  flex: {
    flex: 1
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  list: {
    gap: 8,
    marginTop: 14
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  name: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  email: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10
  },
  noneTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.alertSoft
  },
  noneText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.alert,
    letterSpacing: 0.5
  },
  docsTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  docsText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep
  },
  inactiveTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.rule2
  },
  inactiveText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.5
  },
  actionMessage: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 10
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
  },
  formCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12
  },
  formHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  formTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  }
});
