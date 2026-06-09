import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { Section } from "@/atomic/molecules/Section";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DarkHeroScreen } from "@/atomic/templates/DarkHeroScreen";
import { superadminTabs } from "@/navigation/tabConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { CurrentUser, getCurrentUser, updateCurrentUser } from "@/services/auth/authApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession, saveSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

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

export function SAProfileMobilePage() {
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
    ["Estado", user?.is_active ? "activa" : "inactiva"],
    ["Institución", user?.institution_id != null ? `#${user.institution_id}` : "—"]
  ];

  return (
    <DarkHeroScreen
      tabBar={<IconTabBar tabs={superadminTabs} active={5} />}
      heroChildren={
        <>
          <View style={styles.heroRow}>
            <Avatar
              initials={ini}
              size={64}
              radius={18}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={28}
            />
            <View style={styles.flex}>
              <Text style={styles.heroEyebrow}>{role}</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                {heroName}
              </Text>
              <Text style={styles.heroMeta}>id {user?.id ?? "—"}</Text>
            </View>
          </View>
          <View style={styles.heroTags}>
            <View style={[styles.heroTag, { backgroundColor: colors.accentBright }]}>
              <Text style={[styles.heroTagText, { color: colors.ink }]}>SUPERADMIN</Text>
            </View>
          </View>
        </>
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <Section title="Datos de cuenta" style={styles.firstSection}>
          {ACCOUNT.map(([k, v]) => (
            <View key={k} style={styles.field}>
              <Text style={styles.fieldKey}>{k}</Text>
              <Text style={styles.fieldValue}>{v}</Text>
            </View>
          ))}
        </Section>
      </FadeIn>

      <FadeIn delay={110}>
        <Section title="Editar perfil">
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
        </Section>
      </FadeIn>

      <FadeIn delay={140}>
        <PasswordChangePanel compact />
      </FadeIn>

      <FadeIn delay={180}>
        <Tappable
          scaleTo={0.97}
          onPress={() => goToScreen("settings-mob")}
          style={styles.settingsBtn}
        >
          <Icon kind="build" size={15} color={colors.ink2} />
          <Text style={styles.settingsText}>Accesibilidad</Text>
        </Tappable>
        <Tappable scaleTo={0.97} onPress={handleLogout} style={styles.logout}>
          <Icon kind="logout" size={15} color={colors.alert} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Tappable>
      </FadeIn>
    </DarkHeroScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
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
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
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
    fontSize: 24,
    color: colors.paper,
    marginTop: 4
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  heroTags: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  heroTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  heroTagText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.5
  },
  firstSection: {
    marginTop: 0
  },
  field: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
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
  formLabel: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2,
    marginTop: 6,
    marginBottom: 6
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
    backgroundColor: colors.white,
    marginBottom: 8
  },
  formMessage: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep,
    marginBottom: 8
  },
  saveBtn: {
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accentDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  saveText: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.white
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    height: 44,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md
  },
  settingsText: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink2
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    height: 44,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.alertSoft,
    borderRadius: radii.md
  },
  logoutText: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.alert
  }
});
