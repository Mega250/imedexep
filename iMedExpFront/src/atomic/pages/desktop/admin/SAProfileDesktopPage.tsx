import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { superadminNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { CurrentUser, getCurrentUser, updateCurrentUser } from "@/services/auth/authApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession, saveSession } from "@/state/sessionStore";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function initials(email: string): string {
  if (!email) {
    return "··";
  }
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

async function handleLogout(): Promise<void> {
  await performLogout();
}

export function SAProfileDesktopPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ display_name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await loadSession();
        let current = session.user;
        if (!current && session.tokens) {
          current = await getCurrentUser(session.tokens.access_token);
        }
        if (!cancelled) {
          setUser(current);
          setProfileForm({
            display_name: current?.display_name ?? "",
            phone: String(current?.access_attributes?.phone ?? "")
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu perfil.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const email = user?.email ?? "—";
  const role = user?.role ?? "—";
  const ini = user ? initials(user.email) : "··";
  const heroName = user?.display_name || email;

  async function handleSaveProfile(): Promise<void> {
    const session = await loadSession();
    if (!session.tokens) {
      setProfileMessage("No hay una sesión activa.");
      return;
    }
    const phone = profileForm.phone.replace(/\D/g, "");
    if (phone && phone.length !== 10) {
      setProfileMessage("El teléfono debe tener 10 dígitos.");
      return;
    }
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await updateCurrentUser(session.tokens.access_token, {
        display_name: profileForm.display_name.trim() || null,
        phone: phone || null
      });
      setUser(updated);
      setProfileForm({
        display_name: updated.display_name ?? "",
        phone: String(updated.access_attributes?.phone ?? "")
      });
      await saveSession(session.tokens, updated);
      setProfileMessage("Perfil actualizado.");
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSavingProfile(false);
    }
  }

  const ACCOUNT: [string, string][] = [
    ["Correo", email],
    ["Rol", role],
    ["ID", user?.id != null ? String(user.id) : "—"],
    ["Institución", user?.institution_id != null ? `#${user.institution_id}` : "—"],
    ["Estado", user?.is_active ? "activa" : "inactiva"]
  ];

  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="sa-profile"
      role="superadmin · root"
      roleBadge="Superadmin"
      title="Mi cuenta"
      eyebrow="root · operaciones de plataforma"
      topBarRight={
        <Button
          label="Accesibilidad"
          iconLeft="eye"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          onPress={() => goToScreen("settings")}
        />
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

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
              <Text style={styles.heroAvatarText}>{ini}</Text>
            </View>
            <View style={styles.heroMid}>
              <Text style={styles.heroEyebrow}>{role}</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                {heroName}
              </Text>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMeta}>id {user?.id ?? "—"}</Text>
                <View style={styles.heroMetaSep} />
                <Text style={styles.heroMetaMono}>
                  {user?.is_active ? "cuenta activa" : "cuenta inactiva"}
                </Text>
              </View>
            </View>
            <View style={styles.heroSide}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>SUPERADMIN</Text>
              </View>
            </View>
          </View>
        </View>
      </FadeIn>

      <View style={styles.cols}>
        <View style={styles.colCell}>
          <FadeIn delay={100}>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Datos de cuenta</Text>
              </View>
              <View style={styles.fieldGrid}>
                {ACCOUNT.map(([k, v]) => (
                  <View key={k} style={styles.fieldCell}>
                    <Text style={styles.fieldKey}>{k}</Text>
                    <Text style={styles.fieldVal} numberOfLines={1}>
                      {v}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={130}>
            <View style={[styles.panel, styles.formPanel]}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Editar perfil</Text>
              </View>
              <View style={styles.formWrap}>
                <Text style={styles.formLabel}>Nombre visible</Text>
                <TextInput
                  value={profileForm.display_name}
                  onChangeText={(display_name) => setProfileForm((prev) => ({ ...prev, display_name }))}
                  placeholder="Nombre para mostrar"
                  placeholderTextColor={colors.ink3}
                  style={styles.input}
                />
                <Text style={styles.formLabel}>Teléfono</Text>
                <TextInput
                  value={profileForm.phone}
                  onChangeText={(phone) => setProfileForm((prev) => ({ ...prev, phone }))}
                  placeholder="10 dígitos"
                  placeholderTextColor={colors.ink3}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                {profileMessage ? <Text style={styles.formMessage}>{profileMessage}</Text> : null}
                <Tappable
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                  scaleTo={0.97}
                  style={[styles.saveBtn, savingProfile && { opacity: 0.55 }]}
                >
                  <Text style={styles.saveText}>{savingProfile ? "Guardando..." : "Guardar perfil"}</Text>
                </Tappable>
              </View>
            </View>
          </FadeIn>
        </View>

        <View style={styles.colCell}>
          <FadeIn delay={160}>
            <PasswordChangePanel />
          </FadeIn>

          <FadeIn delay={210}>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Sesión</Text>
              </View>
              <View style={styles.listBody}>
                <View style={styles.securityRow}>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Cerrar sesión</Text>
                    <Text style={styles.securitySub}>
                      Limpia el token actual y vuelve al inicio de sesión.
                    </Text>
                  </View>
                  <Tappable onPress={handleLogout} scaleTo={0.97} style={styles.logoutBtn}>
                    <Icon kind="logout" size={14} color={colors.alert} />
                    <Text style={styles.logoutText}>Salir</Text>
                  </Tappable>
                </View>
              </View>
            </View>
          </FadeIn>
        </View>
      </View>

      <FadeIn delay={340}>
        <View style={styles.danger}>
          <Icon kind="flag" size={18} color={colors.alert} />
          <View style={styles.dangerInfo}>
            <Text style={styles.dangerTitle}>Cerrar sesión</Text>
            <Text style={styles.dangerSub}>
              Es la única acción disponible aquí. Regenerar tokens, revocar 2FA o borrar la cuenta
              aún no están implementados.
            </Text>
          </View>
          <Tappable onPress={handleLogout} scaleTo={0.97} style={styles.dangerBtn}>
            <Text style={styles.dangerBtnText}>Cerrar sesión →</Text>
          </Tappable>
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
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 32,
    paddingVertical: 28,
    overflow: "hidden",
    ...shadow.hero
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
    fontSize: 44,
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
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.9,
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
  heroSide: {
    alignItems: "flex-end",
    gap: 6
  },
  heroTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.accentBright
  },
  heroTagText: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.ink
  },
  cols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  colCell: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 320
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
    flexBasis: "46%",
    minWidth: 130,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  fieldKey: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fieldVal: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 4
  },
  formPanel: {
    marginTop: 14
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
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.paper
  },
  formMessage: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
  },
  saveBtn: {
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.accentDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  saveText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.white
  },
  listBody: {
    padding: 18,
    gap: 8
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  securityInfo: {
    flex: 1
  },
  securityTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  securitySub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.white
  },
  logoutText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.alert
  },
  danger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: radii.md
  },
  dangerInfo: {
    flex: 1
  },
  dangerTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.alert
  },
  dangerSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  dangerBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  dangerBtnText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.alert
  }
});
