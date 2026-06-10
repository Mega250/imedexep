import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { HistChips } from "@/atomic/organisms/HistChips";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import {
  PatientNotification,
  createNotification,
  listMyNotifications
} from "@/services/api/clinicalExtrasApi";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { fetchPatientInstitutions } from "@/services/api/patientInstitutionApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const NO_INSTITUTION_MSG = "Vincula una clínica para avisar a tu médico.";

export function PHistEnfermedadesPage() {
  const [notifs, setNotifs] = useState<PatientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [linked, setLinked] = useState<boolean | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const all = await listMyNotifications();
      setNotifs(all.filter((n) => n.kind === "enfermedad"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar tus notas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const institutions = await fetchPatientInstitutions(patientId);
        if (!cancelled) {
          setLinked(institutions.some((i) => i.unlinked_at === null));
        }
      } catch {
        if (!cancelled) {
          setLinked(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openNotify() {
    if (linked === false) {
      setError(NO_INSTITUTION_MSG);
      return;
    }
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(values: Record<string, string>) {
    if (linked === false) {
      setFormError(NO_INSTITUTION_MSG);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createNotification({ kind: "enfermedad", message: values.message });
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar tu nota.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-hist" />}
      header={
        <>
          <ScreenTopBar
            sub="Mi historial"
            title="Enfermedades"
            right={<RoundIconButton icon="plus" onPress={openNotify} />}
          />
          <HistChips active={2} />
        </>
      }
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : (
        <FadeIn>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon kind="check" size={18} color={colors.ok} />
            </View>
            <Text style={styles.emptyTitle}>Tus diagnósticos los confirma tu médico.</Text>
            <Text style={styles.emptyNote}>
              Si quieres registrar una enfermedad, deja una nota en tu expediente; tu médico la revisará y la validará en tu próxima consulta.
            </Text>
            <Button
              label="Avisar a mi médico"
              variant="ghost"
              block={false}
              height={36}
              size="sm"
              iconLeft="plus"
              style={styles.emptyBtn}
              onPress={openNotify}
            />
            {linked === false ? (
              <Text style={styles.blockHint}>{NO_INSTITUTION_MSG}</Text>
            ) : null}
          </View>

          {notifs.length > 0 ? (
            <View style={styles.list}>
              <Text style={styles.listLabel}>Avisos enviados</Text>
              {notifs.map((n) => (
                <View key={n.id} style={styles.notifCard}>
                  <Text style={styles.notifMsg}>{n.message}</Text>
                  <Text style={styles.notifMeta}>
                    {n.status === "pending" ? "Pendiente" : n.status} ·{" "}
                    {new Date(n.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </FadeIn>
      )}

      <RecordFormModal
        visible={open}
        title="Notificar a mi médico"
        fields={[
          {
            key: "message",
            label: "Mensaje",
            placeholder: "Ej. Creo tener hipertensión, ¿podemos revisarlo?",
            required: true
          }
        ]}
        submitting={submitting}
        error={formError}
        onClose={() => {
          setOpen(false);
          setFormError(null);
        }}
        onSubmit={handleSubmit}
      />
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 120
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 12
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 8
  },
  emptyBtn: {
    marginTop: 14
  },
  list: {
    marginTop: 16,
    gap: 8
  },
  listLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink3
  },
  notifCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: 14
  },
  notifMsg: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  notifMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 4
  },
  blockHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 8
  }
});
