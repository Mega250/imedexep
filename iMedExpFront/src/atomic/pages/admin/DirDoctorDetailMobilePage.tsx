import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import {
  Doctor,
  fetchDoctor,
  setDoctorActive,
  unlinkDoctorFromInstitution,
  updateDoctor
} from "@/services/api/doctorsApi";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { confirmAction } from "@/utils/confirm";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function DirDoctorDetailMobilePage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ doctorId?: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleEdit(values: Record<string, string>) {
    if (!doctor) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await updateDoctor(doctor.id, {
        first_name: values.first_name,
        last_name: values.last_name,
        contact_phone: values.contact_phone,
        office_location: values.office_location
      });
      setDoctor(updated);
      setEditOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive() {
    if (!doctor || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await setDoctorActive(doctor.id, !active);
      setActive(res.is_active);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No pudimos actualizar el estado del médico.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink() {
    if (!doctor || busy) return;
    const ok = await confirmAction(
      "Desvincular médico",
      "El médico dejará de pertenecer a tu clínica. ¿Continuar?",
      { confirmLabel: "Desvincular", destructive: true }
    );
    if (!ok) return;
    setBusy(true);
    setActionError(null);
    try {
      await unlinkDoctorFromInstitution(doctor.id);
      goToScreen("dir-doctors-mob");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No pudimos desvincular al médico.");
      setBusy(false);
    }
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const id = params.doctorId ? Number(params.doctorId) : null;
        if (id && !Number.isNaN(id)) {
          const d = await fetchDoctor(id);
          if (alive) {
            setDoctor(d);
            setActive(d.is_active ?? true);
          }
        } else {
          const list = await fetchInstitutionDoctors();
          const first = list[0] ?? null;
          if (alive) {
            setDoctor(first);
            setActive(first?.is_active ?? true);
          }
        }
      } catch {
        if (alive) setError("No pudimos cargar la información del médico.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.doctorId]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <RadialBlob size={240} color="rgba(0,180,216,0.3)" style={{ top: -90, right: -70 }} />
          <Tappable onPress={() => goBack("dir-doctors-mob")} scaleTo={0.95} style={styles.backRow}>
            <Icon kind="chev-l" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Médicos</Text>
          </Tappable>
          <View style={styles.heroMain}>
            <Avatar
              initials={doctor ? initials(doctor.first_name, doctor.last_name) : "··"}
              size={60}
              radius={16}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={26}
            />
            <View style={styles.flex}>
              <Text style={styles.heroEyebrow}>
                cédula {doctor?.general_license ?? "—"}
              </Text>
              <Text style={styles.heroName}>
                {doctor ? `${doctor.first_name} ${doctor.last_name}` : "Médico"}
              </Text>
              <View style={[styles.activeTag, !active && styles.activeTagOff]}>
                <Text style={[styles.activeText, !active && styles.activeTextOff]}>
                  {active ? "ACTIVO" : "SUSPENDIDO"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.accentDeep} />
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : !doctor ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Sin información disponible</Text>
              <Text style={styles.emptyText}>El médico no existe o no tienes acceso.</Text>
            </View>
          ) : (
            <>
              <FadeIn>
                <View style={styles.statGrid}>
                  <StatTile
                    label="Cédula"
                    value={doctor.general_license}
                    sub="general"
                    style={styles.statCell}
                  />
                  <StatTile
                    label="Especialidad"
                    value={doctor.specialty_license ?? "—"}
                    sub="cédula esp."
                    style={styles.statCell}
                  />
                  <StatTile
                    label="Nivel"
                    value={String(doctor.clearance_level)}
                    sub="clearance"
                    style={styles.statCell}
                  />
                  <StatTile
                    label="Teléfono"
                    value={doctor.contact_phone ?? "—"}
                    sub="contacto"
                    style={styles.statCell}
                  />
                </View>
              </FadeIn>

              <FadeIn delay={80}>
                <Section title="Consultorio">
                  <View style={styles.field}>
                    <Text style={styles.fieldKey}>Ubicación</Text>
                    <Text style={styles.fieldValue}>{doctor.office_location ?? "Sin asignar"}</Text>
                  </View>
                </Section>
              </FadeIn>

              <FadeIn delay={130}>
                <Section title="Secretarias asignadas">
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>Asigna desde "Asignaciones".</Text>
                  </View>
                </Section>
              </FadeIn>

              <FadeIn delay={170}>
                <View style={styles.footer}>
                  <View style={styles.flex}>
                    <Button
                      label="Editar"
                      variant="ghost"
                      size="sm"
                      iconLeft="edit"
                      height={36}
                      onPress={() => setEditOpen(true)}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Button
                      label={active ? "Suspender" : "Reactivar"}
                      variant={active ? "ghost" : "accent"}
                      size="sm"
                      height={36}
                      onPress={handleToggleActive}
                      disabled={busy}
                    />
                  </View>
                </View>
                <View style={styles.unlinkRow}>
                  <Button
                    label="Desvincular de la clínica"
                    variant="ghost"
                    size="sm"
                    height={36}
                    iconLeft="trash"
                    onPress={handleUnlink}
                    disabled={busy}
                  />
                </View>
                {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
              </FadeIn>
            </>
          )}
        </View>
      </ScrollView>

      <RecordFormModal
        visible={editOpen}
        title="Editar médico"
        submitting={submitting}
        error={formError}
        fields={[
          { key: "first_name", label: "Nombre(s)", placeholder: doctor?.first_name ?? "" },
          { key: "last_name", label: "Apellidos", placeholder: doctor?.last_name ?? "" },
          { key: "contact_phone", label: "Teléfono", placeholder: "10 dígitos", keyboardType: "phone-pad" },
          { key: "office_location", label: "Consultorio", placeholder: "Ubicación" }
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
    marginBottom: 12
  },
  backText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.3
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
    fontSize: 22,
    color: colors.paper,
    marginTop: 2
  },
  activeTag: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  activeText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink,
    letterSpacing: 0.5
  },
  activeTagOff: {
    backgroundColor: colors.alert
  },
  activeTextOff: {
    color: colors.paper
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
  field: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
  },
  fieldKey: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fieldValue: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink,
    marginTop: 3
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18
  },
  unlinkRow: {
    marginTop: 8
  },
  actionError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
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
    paddingHorizontal: 14,
    paddingVertical: 18,
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
