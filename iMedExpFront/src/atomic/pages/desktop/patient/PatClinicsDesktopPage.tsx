import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { goToScreen } from "@/navigation/screenRouter";
import { getCurrentPatient, getCurrentPatientId } from "@/services/api/currentPatient";
import {
  PatientInstitution,
  fetchPatientInstitutions,
  setMyInstitutionAccess
} from "@/services/api/patientInstitutionApi";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";

function formatLinkDate(value: string): string {
  try {
    const d = new Date(value);
    return d.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

function shortInitials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function PatClinicsDesktopPage() {
  const nav = usePatientDesktopNav();
  const [items, setItems] = useState<PatientInstitution[] | null>(null);
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const patientId = await getCurrentPatientId();
    const data = await fetchPatientInstitutions(patientId);
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus clínicas.");
          setItems([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patient = await getCurrentPatient();
        if (!cancelled) setBloodType(patient.blood_type ?? null);
      } catch {
        if (!cancelled) setBloodType(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function changeAccess(institutionId: number, active: boolean) {
    setError(null);
    try {
      await setMyInstitutionAccess(institutionId, active);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el acceso.");
    }
  }

  async function handleUnlink(institutionId: number) {
    const ok = await confirmAction(
      "Desvincular clínica",
      "Perderás el acceso compartido con esta clínica. ¿Continuar?",
      { confirmLabel: "Desvincular", destructive: true }
    );
    if (ok) {
      await changeAccess(institutionId, false);
    }
  }

  const totalActive = items ? items.filter((c) => !c.unlinked_at).length : 0;
  const total = items?.length ?? 0;
  const eyebrow = items
    ? total === 0
      ? "Aún sin instituciones vinculadas"
      : `${total} ${total === 1 ? "institución" : "instituciones"} · ${totalActive} activa${totalActive === 1 ? "" : "s"}`
    : "Cargando…";
  const roleLabel = bloodType ? `paciente · ${bloodType}` : "paciente";

  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-clinics"
      role={roleLabel}
      roleBadge="Paciente"
      title="Mis clínicas vinculadas"
      eyebrow={eyebrow}
      searchPlaceholder="Buscar clínica…"
      topBarRight={
        <Button
          label="Mostrar mi QR"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="qr"
          onPress={() => goToScreen("pat-qr")}
        />
      }
    >
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.hero}>
          <View style={styles.heroIntro}>
            <Text style={styles.heroEyebrow}>Tu expediente es tuyo</Text>
            <Text style={styles.heroTitle}>
              Aquí se ve cada clínica que tiene acceso{"\n"}a tu información. Puedes revocar cuando
              quieras.
            </Text>
          </View>
          <Button
            label="Mostrar mi QR"
            variant="primary"
            size="sm"
            block={false}
            height={44}
            iconLeft="qr"
            onPress={() => goToScreen("pat-qr")}
          />
        </View>
      </FadeIn>

      {items === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {items !== null && items.length === 0 ? (
        <FadeIn delay={60}>
          <View style={styles.empty}>
            <Icon kind="shield-2" size={22} color={colors.accentDeep} />
            <View style={styles.emptyBody}>
              <Text style={styles.emptyTitle}>Aún no hay clínicas vinculadas.</Text>
              <Text style={styles.emptySub}>
                Cuando una clínica te lea por QR aparecerá aquí y podrás revocar el acceso cuando
                quieras.
              </Text>
            </View>
          </View>
        </FadeIn>
      ) : null}

      {items && items.length > 0 ? (
        <FadeIn delay={80}>
          <View style={styles.list}>
            {items.map((c, index) => {
              const paused = !!c.unlinked_at;
              const principal = !paused && index === 0;
              const name = c.institution_name ?? `Institución #${c.institution_id}`;
              const since = formatLinkDate(c.linked_at);
              return (
                <View
                  key={c.id}
                  style={[
                    styles.clinicCard,
                    { borderColor: principal ? colors.accent : colors.rule },
                    principal ? shadow.soft : null,
                    paused ? styles.paused : null
                  ]}
                >
                  <View style={styles.clinicRow}>
                    <View
                      style={[
                        styles.clinicLogo,
                        {
                          backgroundColor: principal ? colors.accentBright : colors.paper4
                        }
                      ]}
                    >
                      <Text style={styles.clinicLogoText}>{shortInitials(name)}</Text>
                    </View>
                    <View style={styles.colName}>
                      <View style={styles.clinicTitleRow}>
                        <Text style={styles.clinicName}>{name}</Text>
                        {principal ? (
                          <View style={styles.tagPrincipal}>
                            <Text style={styles.tagPrincipalText}>PRINCIPAL</Text>
                          </View>
                        ) : null}
                        {paused ? (
                          <View style={styles.tagArchived}>
                            <Text style={styles.tagArchivedText}>ARCHIVADA</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.clinicCity}>
                        {c.record_number ? `expediente ${c.record_number}` : "expediente sin folio"}
                      </Text>
                      <Text style={styles.clinicSince}>vinculada desde {since}</Text>
                    </View>
                    <View style={styles.colPerms}>
                      <Text style={styles.eyebrow}>Permisos</Text>
                      <Text style={styles.permsText}>
                        {paused ? "archivada · sólo lectura" : "expediente completo"}
                      </Text>
                      {paused && c.unlinked_at ? (
                        <Text style={styles.lastVisit}>
                          desvinculada {formatLinkDate(c.unlinked_at)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.colActions}>
                      <Button
                        label="Mostrar mi QR"
                        variant="ghost"
                        size="sm"
                        block={false}
                        height={32}
                        iconLeft="qr"
                        style={styles.actionBtn}
                        onPress={() => goToScreen("pat-qr")}
                      />
                      {paused ? (
                        <Button
                          label="Reactivar"
                          variant="ghost"
                          size="sm"
                          block={false}
                          height={32}
                          style={styles.actionBtn}
                          onPress={() => changeAccess(c.institution_id, true)}
                        />
                      ) : (
                        <Tappable scaleTo={0.97} onPress={() => handleUnlink(c.institution_id)}>
                          <View style={styles.unlinkBtn}>
                            <Icon kind="x" size={12} color={colors.alert} />
                            <Text style={styles.unlinkText}>Desvincular</Text>
                          </View>
                        </Tappable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </FadeIn>
      ) : null}

      <FadeIn delay={160}>
        <View style={styles.note}>
          <Icon kind="shield-2" size={20} color={colors.accentBright} />
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>
              Tu QR es la única manera de que nuevos médicos te lean
            </Text>
            <Text style={styles.noteBody}>
              Si te atiende un médico distinto al de tus clínicas, te pedirá un QR temporal — tú
              decides qué compartir y por cuánto tiempo.
            </Text>
          </View>
          <Button
            label="Mostrar mi QR"
            variant="bright"
            size="sm"
            block={false}
            iconLeft="qr"
            onPress={() => goToScreen("pat-qr")}
          />
        </View>
      </FadeIn>
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
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 22
  },
  heroIntro: {
    flexShrink: 1,
    minWidth: 0,
    flexGrow: 1,
    flexBasis: 320
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  heroTitle: {
    fontFamily: family.serif,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.56,
    color: colors.ink,
    marginTop: 6
  },
  empty: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
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
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3,
    marginTop: 6,
    lineHeight: 17
  },
  list: {
    gap: 12,
    marginTop: 18
  },
  clinicCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  paused: {
    opacity: 0.7
  },
  clinicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 22,
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  clinicLogo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  clinicLogoText: {
    fontFamily: family.serif,
    fontSize: 24,
    color: colors.ink
  },
  colName: {
    flexGrow: 1.4,
    flexBasis: 200,
    minWidth: 0
  },
  clinicTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  clinicName: {
    fontFamily: family.medium,
    fontSize: 18,
    color: colors.ink
  },
  tagPrincipal: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  tagPrincipalText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink,
    letterSpacing: 0.76
  },
  tagArchived: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.paper
  },
  tagArchivedText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.76
  },
  clinicCity: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 4
  },
  clinicSince: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  colPerms: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 0
  },
  permsText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 6
  },
  lastVisit: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  colActions: {
    gap: 6
  },
  actionBtn: {
    paddingHorizontal: 12
  },
  unlinkBtn: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.white
  },
  unlinkText: {
    fontFamily: family.medium,
    fontSize: 11,
    color: colors.alert,
    letterSpacing: -0.1
  },
  note: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14
  },
  noteText: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 0
  },
  noteTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.paper
  },
  noteBody: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
    lineHeight: 16
  }
});
