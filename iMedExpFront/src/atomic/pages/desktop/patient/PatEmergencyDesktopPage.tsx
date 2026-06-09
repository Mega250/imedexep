import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FormField } from "@/atomic/molecules/FormField";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { getCurrentPatient } from "@/services/api/currentPatient";
import {
  EmergencyContact,
  deleteEmergencyContact,
  fetchEmergencyContacts,
  patchEmergencyContact,
  postEmergencyContact
} from "@/services/api/emergencyContactsApi";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function ContactRow({ icon, value }: { icon: IconKind; value: string }) {
  return (
    <View style={styles.contactRow}>
      <Icon kind={icon} size={13} color={colors.ink3} />
      <Text style={styles.contactRowText}>{value}</Text>
    </View>
  );
}

export function PatEmergencyDesktopPage() {
  const nav = usePatientDesktopNav();
  const [contacts, setContacts] = useState<EmergencyContact[] | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRelationship, setFormRelationship] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function load() {
    try {
      const patient = await getCurrentPatient();
      setPatientId(patient.id);
      setBloodType(patient.blood_type ?? null);
      const data = await fetchEmergencyContacts(patient.id);
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar tus contactos.");
      setContacts([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!patientId || submitting) {
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await postEmergencyContact(patientId, {
        full_name: formName.trim(),
        phone: formPhone.trim(),
        relationship: formRelationship.trim(),
        is_primary: (contacts ?? []).length === 0
      });
      setFormName("");
      setFormPhone("");
      setFormRelationship("");
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar el contacto.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(values: Record<string, string>) {
    if (!editing) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await patchEmergencyContact(editing.id, {
        full_name: values.full_name?.trim() || editing.full_name,
        phone: values.phone?.trim() || editing.phone,
        relationship: values.relationship?.trim() || editing.relationship
      });
      setEditing(null);
      await load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No pudimos guardar.");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function performDelete(id: number) {
    setError(null);
    try {
      await deleteEmergencyContact(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos eliminar el contacto.");
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirmAction("Eliminar contacto", "¿Seguro que quieres eliminarlo?", {
      confirmLabel: "Eliminar",
      destructive: true
    });
    if (ok) {
      await performDelete(id);
    }
  }

  async function handleMakePrimary(contact: EmergencyContact) {
    setError(null);
    try {
      await patchEmergencyContact(contact.id, { is_primary: true });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cambiar el contacto principal.");
    }
  }

  const list = contacts ?? [];
  const primary = list.find((c) => c.is_primary) ?? list[0] ?? null;
  const others = primary ? list.filter((c) => c.id !== primary.id) : list;
  const count = list.length;
  const eyebrow = contacts
    ? `${count} contacto${count === 1 ? "" : "s"}${primary ? " · 1 principal" : ""}`
    : "Cargando…";
  const roleLabel = bloodType ? `paciente · ${bloodType}` : "paciente";

  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-emergency"
      role={roleLabel}
      roleBadge="Paciente"
      title="Contactos de emergencia"
      eyebrow={eyebrow}
      searchPlaceholder="Buscar nombre…"
      topBarRight={
        <Button
          label={showForm ? "Cancelar" : "Agregar contacto"}
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft={showForm ? "x" : "plus"}
          onPress={() => setShowForm((v) => !v)}
        />
      }
    >
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {contacts === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {primary ? (
        <FadeIn>
          <View style={styles.hero}>
            <View pointerEvents="none" style={styles.heroBlob} />
            <View style={styles.heroInner}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroEyebrow}>A quién avisamos primero</Text>
                <Text style={styles.heroTitle}>
                  {primary.full_name}{" "}
                  <Text style={styles.heroTitleAccent}>· {primary.relationship}</Text>
                </Text>
                <Text style={styles.heroMeta}>{primary.phone}</Text>
              </View>
              <View style={styles.heroActions}>
                <Tappable onPress={() => Linking.openURL(`tel:${primary.phone}`)}>
                  <View style={styles.heroCallBtn}>
                    <Icon kind="phone" size={14} color={colors.ink} />
                    <Text style={styles.heroCallText}>Llamar</Text>
                  </View>
                </Tappable>
                <Tappable onPress={() => Linking.openURL(`sms:${primary.phone}`)}>
                  <View style={styles.heroGhostBtn}>
                    <Icon kind="send" size={13} color={colors.paper} />
                    <Text style={styles.heroGhostText}>Mensaje</Text>
                  </View>
                </Tappable>
                <Tappable onPress={() => setEditing(primary)}>
                  <View style={styles.heroGhostBtn}>
                    <Icon kind="edit" size={13} color={colors.paper} />
                    <Text style={styles.heroGhostText}>Editar</Text>
                  </View>
                </Tappable>
                <Tappable onPress={() => handleDelete(primary.id)}>
                  <View style={styles.heroGhostBtn}>
                    <Icon kind="trash" size={13} color={colors.paper} />
                    <Text style={styles.heroGhostText}>Quitar</Text>
                  </View>
                </Tappable>
              </View>
            </View>
          </View>
        </FadeIn>
      ) : null}

      {showForm ? (
        <FadeIn>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nuevo contacto</Text>
            <View style={styles.formGrid}>
              <View style={styles.formCol}>
                <FormField
                  label="Nombre completo"
                  placeholder="ej. María López"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Teléfono · 10 dígitos"
                  placeholder="ej. 5512345678"
                  keyboardType="phone-pad"
                  value={formPhone}
                  onChangeText={setFormPhone}
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Parentesco"
                  placeholder="ej. Madre"
                  value={formRelationship}
                  onChangeText={setFormRelationship}
                />
              </View>
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <View style={styles.formActions}>
              <Button
                label={submitting ? "Guardando…" : "Guardar contacto"}
                variant="accent"
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                onPress={handleCreate}
                disabled={submitting}
              />
            </View>
          </View>
        </FadeIn>
      ) : null}

      {others.length > 0 ? (
        <Text style={styles.sectionLabel}>{`Mis contactos · ${others.length}`}</Text>
      ) : null}

      {count === 0 && contacts !== null && !showForm ? (
        <FadeIn>
          <View style={styles.empty}>
            <Icon kind="alert" size={18} color={colors.accentDeep} />
            <View style={styles.emptyBody}>
              <Text style={styles.emptyTitle}>Aún no tienes contactos de emergencia.</Text>
              <Text style={styles.emptySub}>
                Agrega al menos uno para que el personal médico sepa a quién avisar.
              </Text>
            </View>
          </View>
        </FadeIn>
      ) : null}

      {count > 0 ? (
        <View style={styles.grid}>
          {others.map((c) => (
            <View
              key={c.id}
              style={[
                styles.card,
                { borderColor: c.is_primary ? colors.accent : colors.rule },
                c.is_primary && shadow.soft
              ]}
            >
              <View style={styles.cardHead}>
                <View style={styles.cardHeadRow}>
                  <View
                    style={[
                      styles.cardAvatar,
                      { backgroundColor: c.is_primary ? colors.accentBright : colors.paper4 }
                    ]}
                  >
                    <Text style={styles.cardAvatarText}>{initials(c.full_name)}</Text>
                  </View>
                  <View style={styles.cardHeadInfo}>
                    <Text style={styles.cardName}>{c.full_name}</Text>
                    <Text style={styles.cardRel}>{c.relationship}</Text>
                  </View>
                  {c.is_primary ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>PRINCIPAL</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.cardBody}>
                <ContactRow icon="phone" value={c.phone} />
                <ContactRow icon="user" value={c.relationship} />
              </View>
              <View style={styles.cardActions}>
                <Tappable style={styles.cardActionFill} onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                  <View style={[styles.cardAction, styles.cardActionDivider]}>
                    <Icon kind="phone" size={12} color={colors.ink2} />
                    <Text style={styles.cardActionText}>Llamar</Text>
                  </View>
                </Tappable>
                <Tappable style={styles.cardActionFill} onPress={() => setEditing(c)}>
                  <View style={[styles.cardAction, styles.cardActionDivider]}>
                    <Icon kind="edit" size={12} color={colors.ink2} />
                    <Text style={styles.cardActionText}>Editar</Text>
                  </View>
                </Tappable>
                <Tappable
                  style={styles.cardActionFill}
                  onPress={() => handleMakePrimary(c)}
                >
                  <View style={[styles.cardAction, styles.cardActionDivider]}>
                    <Icon kind="check" size={12} color={colors.accentDeep} />
                    <Text style={styles.cardActionText}>Principal</Text>
                  </View>
                </Tappable>
                <Tappable
                  style={styles.cardActionFill}
                  onPress={() => handleDelete(c.id)}
                  accessibilityLabel={`Eliminar ${c.full_name}`}
                >
                  <View style={styles.cardAction}>
                    <Icon kind="trash" size={12} color={colors.alert} />
                    <Text style={[styles.cardActionText, { color: colors.alert }]}>Quitar</Text>
                  </View>
                </Tappable>
              </View>
            </View>
          ))}

          <Tappable onPress={() => setShowForm(true)} style={styles.addCardFill}>
            <View style={styles.addCard}>
              <View style={styles.addIcon}>
                <Icon kind="plus" size={20} color={colors.accentDeep} />
              </View>
              <Text style={styles.addTitle}>Agregar contacto</Text>
              <Text style={styles.addSub}>
                Familia, médico de cabecera, alguien que pueda decidir por ti
              </Text>
            </View>
          </Tappable>
        </View>
      ) : null}

      <View style={styles.note}>
        <Icon kind="shield-2" size={18} color={colors.accentDeep} />
        <Text style={styles.noteText}>
          Tus contactos sólo se muestran a personal médico durante una emergencia activa o cuando
          autorices con tu QR.
        </Text>
      </View>

      <RecordFormModal
        visible={editing !== null}
        title="Editar contacto"
        submitting={editSubmitting}
        error={editError}
        fields={[
          { key: "full_name", label: "Nombre completo", placeholder: editing?.full_name ?? "", required: true },
          { key: "phone", label: "Teléfono", placeholder: editing?.phone ?? "", keyboardType: "phone-pad", required: true },
          { key: "relationship", label: "Parentesco", placeholder: editing?.relationship ?? "", required: true }
        ]}
        onClose={() => {
          setEditing(null);
          setEditError(null);
        }}
        onSubmit={handleEdit}
      />
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
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 22,
    overflow: "hidden",
    ...shadow.card
  },
  heroBlob: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.18)",
    top: -120,
    right: -80
  },
  heroInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    alignItems: "center",
    justifyContent: "space-between"
  },
  heroLeft: {
    flexGrow: 1,
    flexBasis: 320,
    minWidth: 0
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serifItalic,
    fontSize: 38,
    lineHeight: 39,
    letterSpacing: -0.76,
    color: colors.paper,
    marginTop: 8
  },
  heroTitleAccent: {
    color: colors.accentBright
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 10
  },
  heroActions: {
    flexDirection: "row",
    gap: 8
  },
  heroCallBtn: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  heroCallText: {
    fontFamily: family.semibold,
    fontSize: 13,
    color: colors.ink
  },
  heroGhostBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  heroGhostText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.paper
  },
  formCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 22,
    gap: 14
  },
  formTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  formCol: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 0
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  sectionLabel: {
    ...text.eyebrow,
    color: colors.ink3,
    marginTop: 22,
    marginBottom: 10
  },
  empty: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    flexDirection: "row",
    gap: 14,
    alignItems: "center"
  },
  emptyBody: {
    flex: 1,
    minWidth: 0
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 4
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  card: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 240,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  cardHead: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  cardHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  cardAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    color: colors.ink
  },
  cardHeadInfo: {
    flex: 1,
    minWidth: 0
  },
  cardName: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  cardRel: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  primaryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  primaryBadgeText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    color: colors.ink
  },
  cardBody: {
    padding: 18,
    gap: 8
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  contactRowText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  cardActionFill: {
    flex: 1
  },
  cardAction: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  cardActionDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.rule3
  },
  cardActionText: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  },
  addCardFill: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 240
  },
  addCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.rule,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    minHeight: 260
  },
  addIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  addTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink,
    marginTop: 14
  },
  addSub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 16.5,
    maxWidth: 200
  },
  note: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  noteText: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.accentDeep,
    lineHeight: 17
  }
});
