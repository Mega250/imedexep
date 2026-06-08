import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Switch } from "@/atomic/atoms/Switch";
import { Tappable } from "@/atomic/atoms/Tappable";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import {
  FONT_SCALE_LABEL,
  FontScalePreset,
  THEME_LABEL,
  ThemePreference,
  useAccessibility
} from "@/state/accessibility";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const FONT_OPTIONS: FontScalePreset[] = ["sm", "md", "lg", "xl"];
const THEME_OPTIONS: ThemePreference[] = ["auto", "light", "dark"];

export function SettingsMobilePage(): ReactNode {
  const {
    prefs,
    setFontScale,
    setHighContrast,
    setReduceMotion,
    setUnderlineLinks,
    setTheme,
    reset
  } = useAccessibility();

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Volver"
          onBack={() => goBack("home-mob")}
          sub="Lectura, contraste y movimiento"
          title="Accesibilidad"
        />
      }
      contentStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.sectionEyebrow}>Tema</Text>
        <Text style={styles.sectionLead}>
          En "Automático" sigue el modo de tu sistema.
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
        <Text style={styles.sectionLead}>Ajusta cuánto se ven los textos.</Text>
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

      <Tappable onPress={reset} scaleTo={0.97} style={styles.resetBtn}>
        <Text style={styles.resetText}>Restablecer a valores por defecto</Text>
      </Tappable>
    </MobileScreen>
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
  content: {
    padding: 18,
    gap: 14
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.rule2,
    padding: 18
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
    marginBottom: 12
  },
  scaleRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  scaleChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    paddingVertical: 8
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
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center"
  },
  resetText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  }
});
