import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { replaceScreen } from "@/navigation/screenRouter";
import { CurrentUser, getCurrentUser, updateCurrentUser } from "@/services/auth/authApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession, saveSession } from "@/state/sessionStore";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function emailInitials(email: string | undefined): string {
  if (!email) return "DR";
  const head = email.split("@")[0] ?? "";
  return head.slice(0, 2).toUpperCase();
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function DirProfileDesktopPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileForm, setProfileForm] = useState({ display_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const session = await loadSession();
        if (!session.tokens) {
          if (alive) setError("Sin sesión activa.");
          return;
        }
        const u = await getCurrentUser(session.tokens.access_token);
        if (alive) {
          setUser(u);
          setProfileForm({
            display_name: u.display_name ?? "",
            phone: typeof u.access_attributes?.phone === "string" ? u.access_attributes.phone : ""
          });
        }
      } catch {
        if (alive) setError("No pudimos cargar el perfil.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function handleLogout() {
    await performLogout();
  }

  async function handleSaveProfile() {
    const session = await loadSession();
    if (!session.tokens) {
      setProfileMessage("Sin sesión activa.");
      return;
    }
    const normalizedPhone = profileForm.phone.replace(/\D/g, "");
    if (normalizedPhone && normalizedPhone.length !== 10) {
      setProfileMessage("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await updateCurrentUser(session.tokens.access_token, {
        display_name: profileForm.display_name.trim() || null,
        phone: normalizedPhone || null
      });
      setUser(updated);
      setProfileForm({
        display_name: updated.display_name ?? "",
        phone: typeof updated.access_attributes?.phone === "string" ? updated.access_attributes.phone : ""
      });
      await saveSession(session.tokens, updated);
      setProfileMessage("Perfil actualizado.");
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "No pudimos guardar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  const personal: [string, string][] = user
    ? [
        ["Correo", user.email],
        ["Rol", user.role],
        ["Institución", user.institution_id ? `ID ${user.institution_id}` : "—"],
        ["Estado", user.is_active ? "activo" : "inactivo"]
      ]
    : [];

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-profile"
      role="director"
      roleBadge="Director"
      title="Mi cuenta"
      eyebrow="Director general · institution_admin"
      topBarRight={
        <Button
          label="Cerrar sesión"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          onPress={handleLogout}
        />
      }
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
            <View style={styles.hero}>
              <RadialBlob
                size={360}
                color={colors.accentBright}
                opacity={0.28}
                edge={70}
                style={{ top: -120, right: -90 }}
              />
              <View style={styles.heroInner}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>{emailInitials(user?.email)}</Text>
                </View>
                <View style={styles.heroMid}>
                  <Text style={styles.heroEyebrow}>Director general · institution_admin</Text>
                  <Text style={styles.heroName}>{user?.display_name || user?.email || "Director"}</Text>
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.heroMeta}>{user?.email ?? "—"}</Text>
                    <View style={styles.heroMetaSep} />
                    <Text style={styles.heroMetaMono}>
                      {user?.institution_id ? `Institución #${user.institution_id}` : "Sin institución"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </FadeIn>

          <View style={styles.cols}>
            <View style={styles.col}>
              <FadeIn delay={100}>
                <PanelCard title="Datos personales">
                  <View style={styles.fieldGrid}>
                    {personal.map(([k, v]) => (
                      <View key={k} style={styles.fieldCell}>
                        <Text style={styles.fieldLabel}>{k}</Text>
                        <Text style={styles.fieldValue}>{v}</Text>
                      </View>
                    ))}
                  </View>
                </PanelCard>
              </FadeIn>

              <FadeIn delay={140}>
                <PanelCard title="Editar perfil">
                  <View style={styles.formWrap}>
                    <Text style={styles.formLabel}>Nombre visible</Text>
                    <TextInput
                      value={profileForm.display_name}
                      onChangeText={(value) => setProfileForm((prev) => ({ ...prev, display_name: value }))}
                      placeholder="Nombre del director"
                      placeholderTextColor={colors.ink3}
                      style={styles.input}
                    />
                    <Text style={styles.formLabel}>Teléfono</Text>
                    <TextInput
                      value={profileForm.phone}
                      onChangeText={(value) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: value.replace(/\D/g, "").slice(0, 10)
                        }))
                      }
                      placeholder="10 dígitos"
                      placeholderTextColor={colors.ink3}
                      keyboardType="phone-pad"
                      style={styles.input}
                    />
                    {profileMessage ? <Text style={styles.formMessage}>{profileMessage}</Text> : null}
                    <Button
                      label={savingProfile ? "Guardando" : "Guardar perfil"}
                      iconLeft="check"
                      variant="primary"
                      size="sm"
                      block={false}
                      disabled={savingProfile}
                      onPress={handleSaveProfile}
                      style={styles.saveBtn}
                    />
                  </View>
                </PanelCard>
              </FadeIn>
            </View>

            <View style={styles.col}>
              <FadeIn delay={200}>
                <PasswordChangePanel />
              </FadeIn>

              <FadeIn delay={240}>
                <View style={styles.logoutCard}>
                  <Text style={styles.logoutTitle}>Sesión</Text>
                  <Text style={styles.logoutMeta}>
                    Cierra sesión para volver al inicio del sitio.
                  </Text>
                  <Button
                    label="Cerrar sesión"
                    variant="primary"
                    size="sm"
                    block={false}
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                  />
                </View>
              </FadeIn>
            </View>
          </View>
        </>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 32,
    paddingVertical: 28,
    overflow: "hidden",
    ...shadow.card
  },
  heroInner: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap"
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 48,
    color: colors.ink
  },
  heroMid: {
    flex: 1,
    minWidth: 280
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: colors.paper,
    marginTop: 8
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10
  },
  heroMeta: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.7)"
  },
  heroMetaMono: {
    fontFamily: family.mono,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.7)"
  },
  heroMetaSep: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  cols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  col: {
    flexGrow: 1,
    flexBasis: 320,
    gap: 14
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHead: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 18
  },
  fieldCell: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fieldValue: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 4
  },
  formWrap: {
    padding: 18,
    gap: 8
  },
  formLabel: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: family.regular,
    fontSize: 14,
    paddingHorizontal: 14
  },
  formMessage: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  saveBtn: {
    marginTop: 8,
    alignSelf: "flex-start"
  },
  logoutCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 20,
    gap: 6
  },
  logoutTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  logoutMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  logoutBtn: {
    marginTop: 10,
    alignSelf: "flex-start"
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
  }
});
