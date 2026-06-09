import { ReactNode, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Switch } from "@/atomic/atoms/Switch";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import {
  DesktopNavItem,
  directorNav,
  doctorNav,
  secretaryNav,
  superadminNav
} from "@/navigation/desktopNavConfigs";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { loadSession } from "@/state/sessionStore";
import {
  FONT_SCALE_LABEL,
  FontScalePreset,
  THEME_LABEL,
  ThemePreference,
  useAccessibility
} from "@/state/accessibility";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function navForRole(
  role: string | undefined,
  patientNav: DesktopNavItem[]
): { nav: DesktopNavItem[]; label: string; badge: string } {
  switch ((role ?? "").toLowerCase()) {
    case "doctor":
      return { nav: doctorNav, label: "médico", badge: "Doctor" };
    case "patient":
      return { nav: patientNav, label: "paciente", badge: "Paciente" };
    case "secretary":
      return { nav: secretaryNav, label: "secretaria · clínica", badge: "Secretaria" };
    case "institution_admin":
      return { nav: directorNav, label: "director · clínica", badge: "Director" };
    case "superadmin":
      return { nav: superadminNav, label: "superadmin · plataforma", badge: "Superadmin" };
    default:
      return { nav: patientNav, label: "cuenta", badge: "Usuario" };
  }
}

const FONT_OPTIONS: FontScalePreset[] = ["sm", "md", "lg", "xl"];
const THEME_OPTIONS: ThemePreference[] = ["auto", "light", "dark"];

export function SettingsDesktopPage(): ReactNode {
  const {
    prefs,
    setFontScale,
    setHighContrast,
    setReduceMotion,
    setUnderlineLinks,
    setTheme,
    reset
  } = useAccessibility();
  const [role, setRole] = useState<string | undefined>(undefined);
  const patientNav = usePatientDesktopNav();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await loadSession();
      if (!cancelled) setRole(session.user?.role);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cfg = useMemo(() => navForRole(role, patientNav), [role, patientNav]);

  return (
    <DesktopShell
      nav={cfg.nav}
      activeScreen="settings"
      role={cfg.label}
      roleBadge={cfg.badge}
      title="Accesibilidad"
      eyebrow="Lectura, contraste y movimiento"
    >
      <View style={styles.column}>
        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Tema</Text>
          <Text style={styles.sectionLead}>
            En "Automático" sigue el modo claro/oscuro de tu sistema.
          </Text>
          <View style={styles.scaleRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = prefs.theme === opt;
              return (
                <Tappable
                  key={opt}
                  onPress={() => setTheme(opt)}
                  scaleTo={0.97}
                  style={[styles.scaleChip, active && styles.scaleChipActive]}
                >
                  <Text style={[styles.scaleChipLabel, active && styles.scaleChipLabelActive]}>
                    {THEME_LABEL[opt]}
                  </Text>
                </Tappable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Tamaño de fuente</Text>
          <Text style={styles.sectionLead}>
            Ajusta cuánto se ven los textos en toda la aplicación.
          </Text>
          <View style={styles.scaleRow}>
            {FONT_OPTIONS.map((opt) => {
              const active = prefs.fontScale === opt;
              return (
                <Tappable
                  key={opt}
                  onPress={() => setFontScale(opt)}
                  scaleTo={0.97}
                  style={[styles.scaleChip, active && styles.scaleChipActive]}
                >
                  <Text style={[styles.scaleChipLabel, active && styles.scaleChipLabelActive]}>
                    {FONT_SCALE_LABEL[opt]}
                  </Text>
                </Tappable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Visibilidad</Text>
          <ToggleLine
            title="Alto contraste"
            subtitle="Mejora la nitidez del texto y los bordes."
            value={prefs.highContrast}
            onChange={setHighContrast}
          />
          <View style={styles.divider} />
          <ToggleLine
            title="Subrayar enlaces"
            subtitle="Identifica más fácilmente lo que es un enlace."
            value={prefs.underlineLinks}
            onChange={setUnderlineLinks}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Movimiento</Text>
          <ToggleLine
            title="Reducir animaciones"
            subtitle="Quita transiciones suaves y rebotes."
            value={prefs.reduceMotion}
            onChange={setReduceMotion}
          />
        </View>

        <View style={styles.footer}>
          <Tappable onPress={reset} scaleTo={0.97} style={styles.resetBtn}>
            <Text style={styles.resetText}>Restablecer a valores por defecto</Text>
          </Tappable>
        </View>
      </View>
    </DesktopShell>
  );
}

type ToggleLineProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function ToggleLine({ title, subtitle, value, onChange }: ToggleLineProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: "100%",
    maxWidth: 720,
    gap: 18
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.rule2,
    padding: 22
  },
  sectionEyebrow: {
    ...text.eyebrow,
    color: colors.ink3,
    marginBottom: 4
  },
  sectionLead: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2,
    marginBottom: 14
  },
  scaleRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  scaleChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper
  },
  scaleChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  scaleChipLabel: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  scaleChipLabelActive: {
    color: colors.paper
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10
  },
  toggleText: {
    flex: 1,
    paddingRight: 12
  },
  toggleTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  toggleSub: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.rule2,
    marginVertical: 4
  },
  footer: {
    alignItems: "flex-start",
    marginTop: 4
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule
  },
  resetText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  }
});
