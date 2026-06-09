import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FAB } from "@/atomic/molecules/FAB";
import { FormField } from "@/atomic/molecules/FormField";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { Section } from "@/atomic/molecules/Section";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import {
  EmergencyContact,
  deleteEmergencyContact,
  fetchEmergencyContacts,
  patchEmergencyContact,
  postEmergencyContact
} from "@/services/api/emergencyContactsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

export function PatEmergencyMobilePage() {
  const [contacts, setContacts] = useState<EmergencyContact[] | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
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
      const id = await getCurrentPatientId();
      setPatientId(id);
      const data = await fetchEmergencyContacts(id);
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

  const primary = contacts?.find((c) => c.is_primary) ?? contacts?.[0] ?? null;
  const others = primary ? (contacts ?? []).filter((c) => c.id !== primary.id) : contacts ?? [];

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-emergency-mob" />}
      header={
        <ScreenTopBar
          sub={contacts ? `${contacts.length} contacto${contacts.length === 1 ? "" : "s"}` : "Cargando…"}
          title="Emergencia"
        />
      }
      floating={<FAB icon="plus" label="Agregar" onPress={() => setShowForm((v) => !v)} />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {contacts === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {primary ? (
        <FadeIn>
          <DarkPanel radius={radii.lg} padding={18} blobSize={220} blobTop={-80} blobRight={-50}>
            <Text style={styles.heroEyebrow}>A quién avisamos primero</Text>
            <Text style={styles.heroName} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
              {primary.full_name}
              {"\n"}
              <Text style={styles.heroAccent}>· {primary.relationship}</Text>
            </Text>
            <Text style={styles.heroPhone}>{primary.phone}</Text>
            <View style={styles.heroButtons}>
              <Tappable
                scaleTo={0.95}
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${primary.phone}`)}
              >
                <Icon kind="phone" size={13} color={colors.ink} />
                <Text style={styles.callText}>Llamar</Text>
              </Tappable>
              <Tappable
                scaleTo={0.92}
                style={styles.mailBtn}
                onPress={() => Linking.openURL(`sms:${primary.phone}`)}
              >
                <Icon kind="send" size={14} color={colors.white} />
              </Tappable>
              <Tappable
                scaleTo={0.92}
                style={styles.mailBtn}
                onPress={() => setEditing(primary)}
              >
                <Icon kind="edit" size={14} color={colors.white} />
              </Tappable>
              <Tappable
                scaleTo={0.92}
                style={styles.mailBtn}
                onPress={() => handleDelete(primary.id)}
              >
                <Icon kind="trash" size={14} color={colors.white} />
              </Tappable>
            </View>
          </DarkPanel>
        </FadeIn>
      ) : contacts && contacts.length === 0 ? (
        <FadeIn>
          <View style={styles.empty}>
            <Icon kind="alert" size={18} color={colors.accentDeep} />
            <Text style={styles.emptyTitle}>Aún no tienes contactos de emergencia.</Text>
            <Text style={styles.emptyNote}>
              Agrega al menos uno para que paramédicos puedan avisar a alguien.
            </Text>
          </View>
        </FadeIn>
      ) : null}

      {showForm ? (
        <FadeIn>
          <View style={styles.form}>
            <FormField
              label="Nombre completo"
              placeholder="ej. María López"
              value={formName}
              onChangeText={setFormName}
            />
            <FormField
              label="Teléfono · 10 dígitos"
              placeholder="ej. 5512345678"
              keyboardType="phone-pad"
              value={formPhone}
              onChangeText={setFormPhone}
            />
            <FormField
              label="Parentesco"
              placeholder="ej. Madre"
              value={formRelationship}
              onChangeText={setFormRelationship}
            />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <Button
              label={submitting ? "Guardando…" : "Guardar contacto"}
              onPress={handleCreate}
              disabled={submitting}
            />
          </View>
        </FadeIn>
      ) : null}

      {others.length > 0 ? (
        <Section title={`Mis contactos · ${others.length}`}>
          {others.map((c, index) => (
            <FadeIn key={c.id} delay={index * 70}>
              <View
                style={[
                  styles.card,
                  { borderColor: c.is_primary ? colors.accent : colors.rule }
                ]}
              >
                <View style={styles.cardBody}>
                  <View style={styles.cardHead}>
                    <Avatar
                      initials={initials(c.full_name)}
                      size={40}
                      radius={11}
                      bg={c.is_primary ? colors.accentBright : colors.paper4}
                      fg={colors.ink}
                      serif
                      fontSize={16}
                    />
                    <View style={styles.flex}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{c.full_name}</Text>
                        {c.is_primary ? (
                          <View style={styles.princTag}>
                            <Text style={styles.princText}>PRINC</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.role} numberOfLines={1}>{c.relationship}</Text>
                    </View>
                  </View>
                  <View style={styles.phoneBox}>
                    <Icon kind="phone" size={12} color={colors.ink3} />
                    <Text style={styles.phoneText}>{c.phone}</Text>
                  </View>
                </View>
                <View style={styles.cardFoot}>
                  <Tappable
                    style={[styles.footBtn, styles.footBorder]}
                    onPress={() => Linking.openURL(`tel:${c.phone}`)}
                  >
                    <Icon kind="phone" size={11} color={colors.ink2} />
                    <Text style={styles.footText}>Llamar</Text>
                  </Tappable>
                  <Tappable
                    style={[styles.footBtn, styles.footBorder]}
                    onPress={() => setEditing(c)}
                  >
                    <Icon kind="edit" size={11} color={colors.ink2} />
                    <Text style={styles.footText}>Editar</Text>
                  </Tappable>
                  <Tappable
                    style={[styles.footBtn, styles.footBorder]}
                    onPress={() => handleMakePrimary(c)}
                  >
                    <Icon kind="check" size={11} color={colors.accentDeep} />
                    <Text style={styles.footText}>Principal</Text>
                  </Tappable>
                  <Tappable
                    style={styles.footBtn}
                    onPress={() => handleDelete(c.id)}
                    accessibilityLabel={`Eliminar ${c.full_name}`}
                  >
                    <Icon kind="trash" size={11} color={colors.alert} />
                    <Text style={[styles.footText, { color: colors.alert }]}>Quitar</Text>
                  </Tappable>
                </View>
              </View>
            </FadeIn>
          ))}
        </Section>
      ) : null}

      <FadeIn delay={210}>
        <View style={styles.infoNote}>
          <Icon kind="shield-2" size={16} color={colors.accentDeep} />
          <Text style={styles.infoText}>
            Tus contactos sólo aparecen al personal médico durante una emergencia o cuando
            autorices con tu QR.
          </Text>
        </View>
      </FadeIn>

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
    flex: 1,
    minWidth: 0
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 28,
    lineHeight: 34,
    color: colors.paper,
    marginTop: 6
  },
  heroAccent: {
    color: colors.accentBright
  },
  heroPhone: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  heroButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  callBtn: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: colors.accentBright,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  callText: {
    fontFamily: family.semibold,
    fontSize: 12,
    color: colors.ink
  },
  mailBtn: {
    width: 40,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center"
  },
  empty: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.lg,
    padding: 18,
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 18,
    color: colors.ink,
    marginTop: 8
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  form: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 14,
    gap: 12,
    marginTop: 12
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 10
  },
  cardBody: {
    padding: 14
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  name: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  princTag: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  princText: {
    fontFamily: family.mono,
    fontSize: 8.5,
    color: colors.ink,
    letterSpacing: 0.5
  },
  role: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  phoneBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.paper,
    borderRadius: 8
  },
  phoneText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  cardFoot: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  footBtn: {
    flex: 1,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5
  },
  footBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.rule3
  },
  footText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  infoNote: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md
  },
  infoText: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.accentDeep
  }
});
