import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Section } from "@/atomic/molecules/Section";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DarkHeroScreen } from "@/atomic/templates/DarkHeroScreen";
import { directorTabs } from "@/navigation/tabConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { CurrentUser, getCurrentUser, updateCurrentUser } from "@/services/auth/authApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession, saveSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function emailInitials(email: string | undefined): string {
  if (!email) return "DR";
  const head = email.split("@")[0] ?? "";
  return head.slice(0, 2).toUpperCase();
}

export function DirProfileMobilePage() {
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
    <DarkHeroScreen
      tabBar={<IconTabBar tabs={directorTabs} active={5} />}
      heroChildren={
        <View style={styles.heroRow}>
          <Avatar
            initials={emailInitials(user?.email)}
            size={64}
            radius={18}
            bg={colors.accentBright}
            fg={colors.ink}
            serif
            fontSize={28}
          />
          <View style={styles.flex}>
            <Text style={styles.heroEyebrow}>Director · institution_admin</Text>
            <Text style={styles.heroName}>{user?.display_name || user?.email || "Director"}</Text>
            <Text style={styles.heroMeta}>
              {user?.institution_id ? `Institución #${user.institution_id}` : "Sin institución"}
            </Text>
          </View>
        </View>
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
            <Section title="Datos personales" style={styles.firstSection}>
              {personal.map(([k, v]) => (
                <View key={k} style={styles.field}>
                  <Text style={styles.fieldKey}>{k}</Text>
                  <Text style={styles.fieldValue}>{v}</Text>
                </View>
              ))}
            </Section>
          </FadeIn>

          <FadeIn delay={80}>
            <Section title="Editar perfil">
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
                onPress={handleSaveProfile}
                style={styles.saveBtn}
              />
            </Section>
          </FadeIn>

          <FadeIn delay={120}>
            <PasswordChangePanel compact />
          </FadeIn>

          <FadeIn delay={160}>
            <Button
              label="Accesibilidad"
              variant="ghost"
              onPress={() => goToScreen("settings-mob")}
              style={styles.settingsBtn}
            />
            <Button label="Cerrar sesión" onPress={handleLogout} style={styles.logoutBtn} />
          </FadeIn>
        </>
      )}
    </DarkHeroScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
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
    fontSize: 11.5,
    color: colors.ink2,
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: family.regular,
    fontSize: 13,
    paddingHorizontal: 12,
    marginBottom: 4
  },
  formMessage: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 8
  },
  saveBtn: {
    marginTop: 12
  },
  settingsBtn: {
    marginTop: 16
  },
  logoutBtn: {
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
  }
});
