import { ReactNode, useEffect, useRef } from "react";
import { Animated, Linking, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";
import Svg, { Circle, Defs, LinearGradient, Pattern, Rect, Stop } from "react-native-svg";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { goToScreen } from "@/navigation/screenRouter";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const MAX = 1280;
let gradientCounter = 0;

function useLayout() {
  const { width } = useWindowDimensions();
  return {
    width,
    stacked: width < 1120,
    gutter: width < 1000 ? 28 : 56,
    scale: width < 1000 ? 0.56 : width < 1280 ? 0.78 : 1
  };
}

function Pulse({ color = colors.accentBright }: { color?: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1900, useNativeDriver: USE_NATIVE_DRIVER })
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  return (
    <View style={styles.pulse}>
      <Animated.View
        style={[styles.pulseDot, { backgroundColor: color, position: "absolute", opacity, transform: [{ scale }] }]}
      />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
}

function LinearBg({ stops, diagonal }: { stops: string[]; diagonal?: boolean }) {
  const id = useRef(`grad${gradientCounter++}`).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2={diagonal ? "1" : "0"} y2="1">
            {stops.map((c, i) => (
              <Stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} stopOpacity={1} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function DotField({ color, opacity }: { color: string; opacity: number }) {
  const id = useRef(`dots${gradientCounter++}`).current;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} width={32} height={32} patternUnits="userSpaceOnUse">
            <Circle cx={1.5} cy={1.5} r={1.5} fill={color} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function Chip({ label, icon, tone = "accent" }: { label: string; icon?: IconKind; tone?: "accent" | "dark" }) {
  const set =
    tone === "dark"
      ? { bg: "rgba(255,255,255,0.1)", fg: colors.paper, border: "rgba(255,255,255,0.18)" }
      : { bg: colors.paper3, fg: colors.accentDeep, border: colors.accentRule };
  return (
    <View style={[styles.chip, { backgroundColor: set.bg, borderColor: set.border }]}>
      {icon ? <Icon kind={icon} size={13} color={set.fg} /> : null}
      <Text style={[styles.chipText, { color: set.fg }]}>{label}</Text>
    </View>
  );
}

function StatGroup({
  items,
  valueColor = colors.ink
}: {
  items: [string, string][];
  valueColor?: string;
}) {
  return (
    <View style={styles.statRow}>
      {items.map(([n, l]) => (
        <View key={l}>
          <Text style={[styles.statValue, { color: valueColor }]}>{n}</Text>
          <Text style={styles.statLabel}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkDot}>
        <Icon kind="check" size={13} color={colors.accentDeep} />
      </View>
      <Text style={styles.checkText}>{label}</Text>
    </View>
  );
}

function HomeNav() {
  const { width, gutter } = useLayout();
  const showLinks = width >= 1180;
  return (
    <View style={[styles.nav, { paddingHorizontal: gutter }]}>
      <View style={styles.navSide}>
        <Logo height={20} />
        <View style={styles.beta}>
          <Text style={styles.betaText}>BETA</Text>
        </View>
      </View>
      {showLinks ? (
        <View style={styles.navLinks}>
          {(
            [
              { label: "Para Médicos", action: () => goToScreen("reg-doctor") },
              { label: "Para Pacientes", action: () => goToScreen("reg-patient") },
              {
                label: "Hablar con ventas",
                action: () =>
                  Linking.openURL("mailto:imedexped@gmail.com?subject=iMedExp%20%C2%B7%20Demo")
              }
            ] as { label: string; action: () => void }[]
          ).map((item) => (
            <Tappable key={item.label} onPress={item.action} scaleTo={0.97}>
              <Text style={styles.navLink} numberOfLines={1}>{item.label}</Text>
            </Tappable>
          ))}
        </View>
      ) : (
        <View />
      )}
      <View style={[styles.navSide, styles.navEnd]}>
        <Tappable onPress={() => goToScreen("login")} scaleTo={0.97}>
          <Text style={styles.navLogin} numberOfLines={1}>Iniciar sesión</Text>
        </Tappable>
        <Button
          label="Comenzar gratis  →"
          variant="accent"
          size="sm"
          block={false}
          onPress={() => goToScreen("reg-role")}
        />
      </View>
    </View>
  );
}

function PreviewCell({ k, body, n }: { k: string; body: string; n: string }) {
  return (
    <View style={styles.expCell}>
      <View style={styles.rowBetween}>
        <Text style={[styles.eyebrow, { fontSize: 10 }]}>{k}</Text>
        <Text style={styles.expCount}>{n}</Text>
      </View>
      <Text style={styles.expBody}>{body}</Text>
    </View>
  );
}

function HeroDashboardPreview() {
  const bars = [40, 60, 55, 70, 75, 65, 80, 90, 75, 88, 92, 94];
  return (
    <View style={styles.previewWrap}>
      <RadialBlob size={320} color={colors.paper3} opacity={0.6} edge={70} style={{ top: -60, right: -80 }} />
      <RadialBlob size={220} color={colors.accentRule} opacity={0.4} edge={70} style={{ bottom: -40, left: -40 }} />

      <View style={styles.previewCard}>
        <View style={styles.chrome}>
          <View style={styles.chromeDots}>
            <View style={[styles.chromeDot, { backgroundColor: "#FF6058" }]} />
            <View style={[styles.chromeDot, { backgroundColor: "#FFBD2D" }]} />
            <View style={[styles.chromeDot, { backgroundColor: "#27CA40" }]} />
          </View>
          <Text style={styles.chromeText}>consola.imedexp.mx</Text>
          <Text style={styles.chromeText}>Dr. Solís</Text>
        </View>

        <View style={styles.previewBody}>
          <View style={styles.rowBetweenTop}>
            <View style={styles.previewHeadText}>
              <Text style={[styles.eyebrow, { fontSize: 10 }]}>Próxima cita · en 12 min</Text>
              <Text style={styles.previewName} numberOfLines={1}>María Fernanda Arellano</Text>
              <Text style={styles.previewMeta} numberOfLines={1}>♀ 34a · O+ · primera consulta · CDMX</Text>
            </View>
            <View style={styles.chipHold}>
              <Chip label="vínculo · 4d" />
            </View>
          </View>

          <View style={styles.allergyBanner}>
            <View style={styles.allergyBadge}>
              <Text style={styles.allergyBadgeText}>ALERGIA SEVERA</Text>
            </View>
            <Text style={styles.allergyText}>
              <Text style={styles.bold}>Penicilina</Text> · anafilaxia 2019
            </Text>
          </View>

          <View style={styles.expGrid}>
            <View style={styles.expRow}>
              <PreviewCell k="Dx activos" body="Hipotiroidismo · migraña · SOP" n="4" />
              <PreviewCell k="Medicación" body="Levotiroxina 75µg · 06:30" n="3" />
            </View>
            <View style={styles.expRow}>
              <PreviewCell k="Cirugías" body="Apendicectomía · 2017" n="3" />
              <PreviewCell k="Estudios" body="TSH 4.8 mU/L · BH micro" n="4" />
            </View>
          </View>

          <View style={styles.quickRow}>
            <Button label="+ Nota" variant="accent" size="sm" onPress={() => goToScreen("doctor-active")} />
            <Button label="+ Receta" variant="ghost" size="sm" onPress={() => goToScreen("dsk-recetas")} />
            <Button label="+ Estudio" variant="ghost" size="sm" onPress={() => goToScreen("doctor-active")} />
          </View>
        </View>
      </View>

      <View style={styles.floatDark} pointerEvents="none">
        <View style={styles.rowCenter}>
          <Pulse color={colors.accentBright} />
          <Text style={styles.floatDarkKicker}>NUEVO VÍNCULO</Text>
        </View>
        <Text style={styles.floatDarkName}>Carlos Mendoza Vela</Text>
        <Text style={styles.floatDarkUrl}>imx.mx/c·m4z-8tk</Text>
      </View>

      <View style={styles.floatLight} pointerEvents="none">
        <Text style={[styles.eyebrow, { fontSize: 10 }]}>Adherencia · 30 días</Text>
        <View style={styles.adhRow}>
          <Text style={styles.adhValue}>94</Text>
          <Text style={styles.adhPct}>%</Text>
          <View style={styles.flex1} />
          <Text style={styles.adhDelta}>↑ 6 pts</Text>
        </View>
        <View style={styles.barChart}>
          {bars.map((h, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                borderRadius: 2,
                backgroundColor: i === bars.length - 1 ? colors.accent : colors.paper3
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function HomeHero() {
  const { stacked, gutter, scale } = useLayout();
  return (
    <View style={[styles.section, { paddingTop: 80, paddingBottom: 100, overflow: "hidden" }]}>
      <LinearBg stops={[colors.paper, colors.paper, colors.white]} />
      <DotField color={colors.rule} opacity={0.35} />
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <View style={[styles.split, stacked && styles.splitStack]}>
          <View style={stacked ? styles.fullCol : styles.heroLeft}>
            <FadeIn>
              <View style={styles.heroBadge}>
                <Pulse />
                <Text style={styles.heroBadgeText}>Plataforma médica · MX · NOM-024-SSA3</Text>
              </View>
            </FadeIn>
            <FadeIn delay={120}>
              <Text style={[styles.h1, { fontSize: 92 * scale, lineHeight: 88 * scale, letterSpacing: -4.1 * scale }]}>
                Tu expediente médico,{"\n"}
                <Text style={styles.h1Bold}>listo</Text> <Text style={styles.serif}>en cualquier</Text>
                {"\n"}consulta.
              </Text>
            </FadeIn>
            <FadeIn delay={220}>
              <Text style={styles.heroLead}>
                La plataforma que conecta pacientes y médicos. Captura tu historial una vez —
                alergias, diagnósticos, medicación, cirugías — y compártelo en segundos con
                cualquier doctor nuevo. Sin formularios. Sin papeleo. Sin información perdida.
              </Text>
            </FadeIn>
            <FadeIn delay={320}>
              <View style={styles.heroCta}>
                <Button
                  label="Soy Paciente → empezar gratis"
                  variant="accent"
                  block={false}
                  onPress={() => goToScreen("reg-patient")}
                />
                <Button
                  label="Soy Médico → acceder"
                  variant="ghost"
                  block={false}
                  onPress={() => goToScreen("login")}
                />
              </View>
            </FadeIn>
            <FadeIn delay={420}>
              <StatGroup
                items={[
                  ["12,480", "Expedientes activos"],
                  ["1,720+", "Médicos en consola"],
                  ["98%", "Adherencia médica"]
                ]}
              />
            </FadeIn>
          </View>

          <FadeIn delay={480} style={stacked ? styles.fullCol : styles.heroRight}>
            <HeroDashboardPreview />
          </FadeIn>
        </View>
      </View>
    </View>
  );
}

function TrustItem({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.trustItem}>
      <Icon kind="check" size={18} color={colors.accentBright} />
      <View style={styles.trustItemBody}>
        <Text style={styles.trustItemKey} numberOfLines={1}>{k}</Text>
        <Text style={styles.trustItemVal} numberOfLines={1}>{v}</Text>
      </View>
    </View>
  );
}

function HomeTrust() {
  const { gutter } = useLayout();
  return (
    <View style={[styles.trust, { paddingHorizontal: gutter }]}>
      <View style={[styles.inner, styles.trustInner]}>
        <View style={styles.trustHead}>
          <Text style={styles.trustKicker}>CUMPLIMIENTO Y SEGURIDAD</Text>
          <Text style={styles.trustNorms}>HIPAA · NOM-024-SSA3 · ISO 27001</Text>
        </View>
        <View style={styles.trustGrid}>
          <TrustItem k="Cifrado" v="Extremo a extremo" />
          <TrustItem k="Datos en MX" v="100% soberanía" />
          <TrustItem k="Auditoría" v="Cada acceso" />
          <TrustItem k="Revocable" v="En 1 toque" />
        </View>
      </View>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  tag,
  accent,
  delay
}: {
  icon: IconKind;
  title: string;
  body: string;
  tag?: string;
  accent?: boolean;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} style={styles.featureCardWrap}>
      <View style={styles.featureCard}>
        <View style={styles.rowBetweenTop}>
          <View
            style={[
              styles.featureIcon,
              { backgroundColor: accent ? colors.accent : colors.paper3 }
            ]}
          >
            <Icon kind={icon} size={22} color={accent ? colors.white : colors.accentDeep} />
          </View>
          {tag ? <Chip label={tag} /> : null}
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </FadeIn>
  );
}

function HomeFeatures() {
  const { gutter, scale, stacked } = useLayout();
  const items: { icon: IconKind; title: string; body: string; tag?: string; accent?: boolean }[] = [
    {
      icon: "doc",
      title: "Historia Clínica Digital",
      body: "Expedientes completos con alergias, diagnósticos, cirugías, medicación y signos vitales. Siempre actualizados, siempre disponibles.",
      tag: "CORE",
      accent: true
    },
    {
      icon: "cal",
      title: "Citas Inteligentes",
      body: "Agenda y gestiona consultas desde cualquier dispositivo. Recordatorios automáticos por SMS y email para pacientes."
    },
    {
      icon: "shield",
      title: "Seguridad Médica",
      body: "Cifrado extremo a extremo, auditoría de cada acceso, vínculos con vencimiento. NOM-024-SSA3 y HIPAA."
    },
    {
      icon: "chart",
      title: "Análisis de Salud",
      body: "Visualiza tendencias de signos vitales, adherencia a tratamientos y resultados de laboratorio con gráficas claras."
    },
    {
      icon: "pill",
      title: "Recetas Digitales",
      body: "Genera recetas electrónicas con firma del médico, las envía al paciente al instante y al expediente automáticamente."
    },
    {
      icon: "monitor",
      title: "Multi-plataforma",
      body: "iOS · Android · Web. El expediente del paciente accesible desde cualquier dispositivo. Sincronización en tiempo real."
    }
  ];
  return (
    <View style={[styles.section, { backgroundColor: colors.white, paddingTop: 120, paddingBottom: 80 }]}>
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <FadeIn>
          <View style={[styles.featuresHead, stacked && styles.featuresHeadStack]}>
            <View style={styles.flex1}>
              <Text style={styles.eyebrow}>02 · características</Text>
              <Text style={[styles.h2, { fontSize: 64 * scale, lineHeight: 63 * scale, letterSpacing: -2.6 * scale }]}>
                Todo lo que necesitas para{"\n"}
                <Text style={[styles.serif, { color: colors.accentDeep }]}>una práctica moderna.</Text>
              </Text>
            </View>
            <Text style={styles.featuresAside}>
              Herramientas diseñadas específicamente para el flujo de trabajo clínico real — no
              formularios genéricos adaptados.
            </Text>
          </View>
        </FadeIn>
        <View style={styles.cardGrid}>
          {items.map((it, i) => (
            <FeatureCard key={it.title} {...it} delay={i * 80} />
          ))}
        </View>
      </View>
    </View>
  );
}

function MiniQr() {
  const cells = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [6, 0], [7, 0], [9, 0],
    [0, 1], [2, 1], [4, 1], [7, 1], [8, 1], [9, 1],
    [0, 2], [2, 2], [4, 2], [6, 2], [9, 2],
    [0, 3], [1, 3], [4, 3], [6, 3], [7, 3], [8, 3],
    [2, 4], [3, 4], [6, 4], [8, 4], [9, 4],
    [0, 5], [1, 5], [5, 5], [6, 5], [7, 5],
    [3, 6], [4, 6], [6, 6], [8, 6],
    [0, 7], [2, 7], [4, 7], [7, 7], [9, 7],
    [1, 8], [3, 8], [5, 8], [6, 8], [8, 8],
    [0, 9], [2, 9], [3, 9], [5, 9], [7, 9], [9, 9]
  ];
  return (
    <View style={styles.qrBox}>
      <Svg width="100%" height="100%" viewBox="0 0 10 10">
        {cells.map(([x, y], i) => (
          <Rect key={i} x={x} y={y} width={1} height={1} fill={colors.ink} />
        ))}
      </Svg>
    </View>
  );
}

function StepIllustration({ kind }: { kind: "register" | "connect" | "manage" }) {
  if (kind === "register") {
    return (
      <View style={styles.illoRegister}>
        <Text style={[styles.eyebrow, { fontSize: 10 }]}>Crear cuenta · 2 min</Text>
        <View style={styles.illoRegList}>
          {[
            ["Nombre completo", "María Fernanda A."],
            ["Correo", "maria@correo.mx"],
            ["Rol", "Paciente"]
          ].map(([k, v]) => (
            <View key={k} style={styles.illoRegRow}>
              <Text style={styles.illoRegKey}>{k}</Text>
              <Text style={styles.illoRegVal}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (kind === "connect") {
    return (
      <View style={styles.illoConnect}>
        <View style={styles.flex1}>
          <Text style={styles.illoConnectKicker}>VÍNCULO ACTIVO</Text>
          <Text style={styles.illoConnectUrl}>
            imx.mx/<Text style={{ color: colors.accentBright }}>m·ar7r-92x</Text>
          </Text>
          <View style={styles.illoConnectTime}>
            <Pulse color={colors.accentBright} />
            <Text style={styles.illoConnectTimeText}>22 min</Text>
          </View>
        </View>
        <MiniQr />
      </View>
    );
  }
  return (
    <View style={styles.illoManage}>
      <View style={styles.rowCenter}>
        <View style={styles.illoManageAvatar} />
        <View>
          <Text style={styles.illoManageName}>María F. Arellano</Text>
          <Text style={styles.illoManageMeta}>♀ 34a · primera consulta</Text>
        </View>
      </View>
      <View style={styles.illoManageAllergy}>
        <Text style={styles.illoManageAllergyTag}>ALERGIA</Text>
        <Text style={styles.illoManageAllergyText}>· Penicilina · anafilaxia</Text>
      </View>
      <View style={styles.illoManageGrid}>
        {[
          ["Dx", "Hipotiroidismo"],
          ["Med", "Levotiroxina 75µg"],
          ["Cx", "Apendicectomía"],
          ["Lab", "TSH 4.8"]
        ].map(([k, v]) => (
          <View key={k} style={styles.illoManageCell}>
            <Text style={styles.illoManageCellKey}>{k}</Text>
            <Text style={styles.illoManageCellVal}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StepCard({
  n,
  title,
  body,
  illustration,
  delay
}: {
  n: string;
  title: string;
  body: string;
  illustration: ReactNode;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} style={styles.stepCardWrap}>
      <View style={styles.stepCard}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{n}</Text>
        </View>
        <View style={{ height: 30 }} />
        {illustration}
        <View>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.stepBody}>{body}</Text>
        </View>
      </View>
    </FadeIn>
  );
}

function HomeHow() {
  const { gutter, scale } = useLayout();
  return (
    <View style={[styles.section, { paddingTop: 120, paddingBottom: 100 }]}>
      <LinearBg stops={[colors.paper, colors.paper2]} />
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <FadeIn>
          <View style={styles.howHead}>
            <Text style={styles.eyebrow}>03 · cómo funciona</Text>
            <Text
              style={[
                styles.h2,
                styles.center,
                { fontSize: 64 * scale, lineHeight: 63 * scale, letterSpacing: -2.6 * scale }
              ]}
            >
              Empieza en <Text style={styles.h2Bold}>3 pasos</Text>{" "}
              <Text style={styles.serif}>simples.</Text>
            </Text>
            <Text style={styles.howSub}>
              Sin configuración compleja. Sin curvas de aprendizaje. Sin contratos.
            </Text>
          </View>
        </FadeIn>
        <View style={styles.stepGrid}>
          <StepCard
            n="01"
            title="Regístrate en 2 minutos"
            body="Crea tu cuenta como médico o paciente. Verificación de correo instantánea y captura conversacional de tu información clínica básica."
            illustration={<StepIllustration kind="register" />}
            delay={0}
          />
          <StepCard
            n="02"
            title="Comparte un vínculo seguro"
            body="Genera un código único, con vencimiento (22 min) y uso único. Lo pegas en la consulta o lo muestras en pantalla. Nadie más puede acceder."
            illustration={<StepIllustration kind="connect" />}
            delay={120}
          />
          <StepCard
            n="03"
            title="El médico ya lo leyó"
            body="En la consola del médico aparece el expediente jerarquizado: alergias arriba, crónicos en medio, último estudio destacado. Sin clics intermedios."
            illustration={<StepIllustration kind="manage" />}
            delay={240}
          />
        </View>
      </View>
    </View>
  );
}

function MedicoMockup() {
  const agenda: [string, string, string, boolean][] = [
    ["10:30", "María F. Arellano", "primera vez", true],
    ["11:15", "José L. Padilla", "post-op día 12", false],
    ["12:00", "Ana Sofía Cortés", "control crónico", false]
  ];
  return (
    <View style={styles.medicoWrap}>
      <View style={styles.medicoCard}>
        <View style={styles.medicoHeader}>
          <View>
            <Text style={styles.medicoDoc}>Dr. Ricardo Solís M.</Text>
            <Text style={styles.medicoDocMeta}>endocrinología · 8/12 citas hoy</Text>
          </View>
          <Chip label="mié 14 may" tone="dark" />
        </View>
        <View style={styles.medicoBody}>
          <Text style={styles.eyebrow}>Agenda · próximas</Text>
          <View style={styles.medicoList}>
            {agenda.map(([t, n, tag, active]) => (
              <View
                key={t}
                style={[
                  styles.agendaRow,
                  {
                    backgroundColor: active ? colors.paper3 : colors.paper,
                    borderColor: active ? colors.accentRule : colors.rule2
                  }
                ]}
              >
                <Text style={styles.agendaTime}>{t}</Text>
                <View style={styles.agendaBody}>
                  <Text style={styles.agendaName} numberOfLines={1}>{n}</Text>
                  <Text style={styles.agendaTag} numberOfLines={1}>{tag}</Text>
                </View>
                {active ? <Pulse color={colors.accent} /> : null}
              </View>
            ))}
          </View>
          <View style={styles.medicoAlert}>
            <View style={styles.medicoAlertBadge}>
              <Text style={styles.medicoAlertBadgeText}>ALERGIA</Text>
            </View>
            <Text style={styles.medicoAlertText}>
              <Text style={styles.bold}>Penicilina</Text> · paciente próximo: M.F. Arellano
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.medicoFloat} pointerEvents="none">
        <Text style={styles.medicoFloatValue}>−14 s</Text>
        <Text style={styles.medicoFloatLabel}>menos por consulta</Text>
      </View>
    </View>
  );
}

function HomeMedico() {
  const { gutter, scale, stacked } = useLayout();
  return (
    <View style={[styles.section, { backgroundColor: colors.white, paddingTop: 120, paddingBottom: 100 }]}>
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <View style={[styles.split, stacked && styles.splitStack]}>
          <FadeIn style={stacked ? styles.fullCol : styles.flex1}>
            <MedicoMockup />
          </FadeIn>
          <FadeIn delay={120} style={stacked ? styles.fullCol : styles.flex1}>
            <Chip label="Para Médicos" icon="monitor" />
            <Text style={[styles.h2, styles.splitH2, { fontSize: 56 * scale, lineHeight: 56 * scale, letterSpacing: -2.2 * scale }]}>
              Tu consultorio,{"\n"}
              <Text style={[styles.serif, { color: colors.accentDeep }]}>en tu bolsillo.</Text>
            </Text>
            <Text style={styles.splitLead}>
              Gestiona expedientes, agenda citas y vincula pacientes desde un solo lugar.
              imedexp elimina el papeleo para que te enfoques en lo que importa: tus pacientes.
            </Text>
            <View style={styles.checkList}>
              {[
                "Expediente clínico completo por paciente, jerarquizado",
                "QR único para vincular pacientes al instante",
                "Calendario con vista día / semana / mes",
                "Registro de medicación, alergias y antecedentes",
                "Notas clínicas con autosave y recetas digitales",
                "Seguimiento de signos vitales en el tiempo"
              ].map((b) => (
                <CheckItem key={b} label={b} />
              ))}
            </View>
            <View style={styles.splitStats}>
              <StatGroup
                items={[
                  ["< 30s", "vincular un paciente"],
                  ["100%", "expedientes digitales"],
                  ["0", "papel necesario"]
                ]}
                valueColor={colors.accentDeep}
              />
            </View>
            <Button
              label="Registrarme como Médico  →"
              variant="accent"
              block={false}
              style={styles.splitBtn}
              onPress={() => goToScreen("reg-doctor")}
            />
          </FadeIn>
        </View>
      </View>
    </View>
  );
}

function PacienteMockup() {
  return (
    <View style={styles.pacienteWrap}>
      <View style={styles.phone}>
        <View style={styles.phoneScreen}>
          <View style={styles.rowBetween}>
            <Logo height={14} />
            <View style={styles.phoneAvatar}>
              <Text style={styles.phoneAvatarText}>MF</Text>
            </View>
          </View>
          <Text style={[styles.eyebrow, { fontSize: 10, marginTop: 14 }]}>Mi expediente</Text>
          <Text style={styles.phoneHello}>Hola, María.</Text>

          <View style={styles.phoneAppt}>
            <View style={styles.rowBetween}>
              <Text style={styles.phoneApptKicker}>PRÓXIMA CITA</Text>
              <Pulse color={colors.accentBright} />
            </View>
            <Text style={styles.phoneApptTime}>10:30 · mié</Text>
            <Text style={styles.phoneApptDoc}>Dr. Ricardo Solís M.</Text>
            <Text style={styles.phoneApptSpec}>endocrinología</Text>
          </View>

          <View style={styles.phoneAllergy}>
            <View style={styles.phoneAllergyBadge}>
              <Text style={styles.phoneAllergyBadgeText}>ALERGIA</Text>
            </View>
            <Text style={styles.phoneAllergyText}>
              <Text style={styles.bold}>Penicilina</Text> · anafilaxia 2019
            </Text>
          </View>

          <View style={styles.phoneList}>
            {[
              ["Diagnósticos", "4"],
              ["Medicación", "3"],
              ["Cirugías", "3"]
            ].map(([k, n]) => (
              <View key={k} style={styles.phoneListRow}>
                <Text style={styles.phoneListKey}>{k}</Text>
                <Text style={styles.phoneListVal}>{n} ›</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.pacienteFloat} pointerEvents="none">
        <Text style={[styles.eyebrow, { fontSize: 10 }]}>Adherencia</Text>
        <Text style={styles.pacienteFloatValue}>98%</Text>
      </View>
    </View>
  );
}

function HomePaciente() {
  const { gutter, scale, stacked } = useLayout();
  return (
    <View style={[styles.section, { paddingTop: 120, paddingBottom: 100 }]}>
      <LinearBg stops={[colors.paper2, colors.paper]} />
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <View style={[styles.split, stacked && styles.splitStack]}>
          <FadeIn style={stacked ? styles.fullCol : styles.flex1}>
            <Chip label="Para Pacientes" icon="bell" />
            <Text style={[styles.h2, styles.splitH2, { fontSize: 56 * scale, lineHeight: 56 * scale, letterSpacing: -2.2 * scale }]}>
              Tu salud,{"\n"}
              <Text style={[styles.serif, { color: colors.accentDeep }]}>siempre contigo.</Text>
            </Text>
            <Text style={styles.splitLead}>
              Lleva tu historial clínico contigo. Cita con cualquier médico nuevo y compártelo
              con un código. Sin recordar fechas, dosis ni nombres de medicamentos.
            </Text>
            <View style={styles.checkList}>
              {[
                "Acceso a tu historial médico completo",
                "Agenda citas con tu médico en segundos",
                "Control de medicamentos y recordatorios",
                "Seguimiento de IMC, signos vitales y adherencia",
                "Vinculación segura con cualquier médico",
                "Modo sin conexión disponible"
              ].map((b) => (
                <CheckItem key={b} label={b} />
              ))}
            </View>
            <View style={styles.splitStats}>
              <StatGroup
                items={[
                  ["1 lugar", "todo tu historial"],
                  ["24/7", "acceso a tu salud"],
                  ["100%", "privado y seguro"]
                ]}
                valueColor={colors.accentDeep}
              />
            </View>
            <Button
              label="Registrarme como Paciente  →"
              variant="accent"
              block={false}
              style={styles.splitBtn}
              onPress={() => goToScreen("reg-patient")}
            />
          </FadeIn>
          <FadeIn delay={120} style={stacked ? styles.fullCol : styles.flex1}>
            <PacienteMockup />
          </FadeIn>
        </View>
      </View>
    </View>
  );
}

function HomeMobile() {
  const { gutter, scale, stacked } = useLayout();
  const features: [IconKind, string][] = [
    ["bell", "Recordatorios de medicamentos y citas"],
    ["arrow", "Sincronización en tiempo real"],
    ["lock", "Acceso seguro con biometría"],
    ["monitor", "Modo sin conexión disponible"]
  ];
  return (
    <View style={[styles.section, { backgroundColor: colors.white, paddingTop: 120, paddingBottom: 100 }]}>
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <View style={[styles.split, stacked && styles.splitStack]}>
          <FadeIn style={stacked ? styles.fullCol : styles.flex1}>
            <Chip label="Disponible en iOS y Android" icon="apple" />
            <Text style={[styles.h2, styles.splitH2, { fontSize: 56 * scale, lineHeight: 56 * scale, letterSpacing: -2.2 * scale }]}>
              Lleva imedexp{"\n"}
              <Text style={[styles.serif, { color: colors.accentDeep }]}>en tu bolsillo.</Text>
            </Text>
            <Text style={styles.splitLead}>
              Accede a tu historial clínico, citas y medicamentos desde tu móvil, en cualquier
              momento y lugar.
            </Text>
            <View style={styles.mobileList}>
              {features.map(([icon, label]) => (
                <View key={label} style={styles.mobileRow}>
                  <View style={styles.mobileIcon}>
                    <Icon kind={icon} size={18} color={colors.accentDeep} />
                  </View>
                  <Text style={styles.mobileRowText}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.storeNote}>
              App nativa próximamente en App Store y Google Play. Mientras tanto, abre
              imedexp desde el navegador de tu móvil.
            </Text>
          </FadeIn>
          <FadeIn delay={120} style={[stacked ? styles.fullCol : styles.flex1, styles.center]}>
            <View style={styles.mobileMockWrap}>
              <RadialBlob
                size={360}
                color={colors.paper3}
                opacity={0.7}
                edge={70}
                style={{ top: 40, left: 40 }}
              />
              <PacienteMockup />
            </View>
          </FadeIn>
        </View>
      </View>
    </View>
  );
}

function HomeCTA() {
  const { gutter, scale } = useLayout();
  return (
    <View style={[styles.section, { paddingTop: 100, paddingBottom: 100, overflow: "hidden" }]}>
      <LinearBg stops={["#03045E", "#023E8A", "#0077B6"]} diagonal />
      <RadialBlob
        size={600}
        color="rgba(0,180,216,0.5)"
        opacity={0.5}
        edge={60}
        style={{ top: -200, left: -100 }}
      />
      <RadialBlob
        size={500}
        color="rgba(202,240,248,0.4)"
        opacity={0.4}
        edge={60}
        style={{ bottom: -180, right: -100 }}
      />
      <DotField color="#FFFFFF" opacity={0.08} />
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <FadeIn style={styles.ctaInner}>
          <Text style={styles.ctaEyebrow}>04 · únete a imedexp</Text>
          <Text
            style={[
              styles.ctaTitle,
              { fontSize: 88 * scale, lineHeight: 86 * scale, letterSpacing: -4 * scale }
            ]}
          >
            ¿Listo para modernizar{"\n"}
            <Text style={[styles.serif, { color: colors.accentBright }]}>tu práctica médica?</Text>
          </Text>
          <Text style={styles.ctaSub}>
            Más de 1,720 médicos ya gestionan sus pacientes con imedexp. Regístrate hoy y
            empieza gratis. Sin tarjeta de crédito, sin contratos.
          </Text>
          <View style={styles.ctaButtons}>
            <Button
              label="Soy Médico — Comenzar gratis  →"
              variant="ghost"
              block={false}
              style={{ borderColor: colors.white }}
              onPress={() => goToScreen("reg-doctor")}
            />
            <Button
              label="Soy Paciente — Registrarme  →"
              variant="darkGhost"
              block={false}
              onPress={() => goToScreen("reg-patient")}
            />
          </View>
          <Text style={styles.ctaNote}>
            Sin tarjeta de crédito · Sin contratos · Cancela cuando quieras
          </Text>
        </FadeIn>
      </View>
    </View>
  );
}

function HomeFooter() {
  const { gutter, stacked } = useLayout();
  const cols: [string, { label: string; action: () => void }[]][] = [
    [
      "Cuenta",
      [
        { label: "Iniciar sesión", action: () => goToScreen("login") },
        { label: "Registrarme", action: () => goToScreen("reg-role") },
        { label: "Crear cuenta médico", action: () => goToScreen("reg-doctor") },
        { label: "Crear cuenta paciente", action: () => goToScreen("reg-patient") },
        {
          label: "Recuperar contraseña",
          action: () => goToScreen("recover")
        }
      ]
    ],
    [
      "Contacto",
      [
        {
          label: "Hablar con ventas",
          action: () =>
            Linking.openURL("mailto:imedexped@gmail.com?subject=iMedExp%20%C2%B7%20Demo")
        },
        {
          label: "Soporte técnico",
          action: () =>
            Linking.openURL("mailto:imedexped@gmail.com?subject=iMedExp%20%C2%B7%20Soporte")
        },
        {
          label: "Reportar un bug",
          action: () =>
            Linking.openURL("mailto:imedexped@gmail.com?subject=iMedExp%20%C2%B7%20Bug")
        }
      ]
    ],
    [
      "Cumplimiento",
      [
        { label: "HIPAA", action: () => Linking.openURL("https://www.hhs.gov/hipaa/index.html") },
        {
          label: "NOM-024-SSA3",
          action: () =>
            Linking.openURL("https://dof.gob.mx/nota_detalle.php?codigo=5280848")
        },
        { label: "Centro de seguridad", action: () => Linking.openURL("mailto:imedexped@gmail.com?subject=iMedExp%20%C2%B7%20Seguridad") }
      ]
    ]
  ];
  return (
    <View style={[styles.footer, { paddingHorizontal: gutter }]}>
      <View style={styles.inner}>
        <View style={[styles.footerTop, stacked && styles.footerTopStack]}>
          <View style={styles.footerBrand}>
            <Logo height={20} color={colors.paper} />
            <Text style={styles.footerDesc}>
              La plataforma médica que conecta doctores y pacientes. Tu historial clínico,
              siempre contigo, siempre seguro.
            </Text>
            <View style={styles.footerChips}>
              <Chip label="HIPAA" tone="dark" />
              <Chip label="NOM-024-SSA3" tone="dark" />
              <Chip label="ISO 27001" tone="dark" />
            </View>
          </View>
          {cols.map(([heading, items]) => (
            <View key={heading} style={styles.footerCol}>
              <Text style={styles.footerHeading}>{heading}</Text>
              <View style={styles.footerLinks}>
                {items.map((it) => (
                  <Tappable key={it.label} onPress={it.action} scaleTo={0.98}>
                    <Text style={styles.footerLink} numberOfLines={1}>{it.label}</Text>
                  </Tappable>
                ))}
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.footerBottom, stacked && styles.footerBottomStack]}>
          <Text style={styles.footerMeta}>© 2026 imedexp. Todos los derechos reservados.</Text>
          <Text style={styles.footerMeta}>CDMX, México</Text>
          <Text style={styles.footerMeta}>
            Hecho con <Text style={{ color: colors.alert }}>♥</Text> para la salud digital
          </Text>
        </View>
      </View>
    </View>
  );
}

export function HomeDesktopPage() {
  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <HomeNav />
      <HomeHero />
      <HomeTrust />
      <HomeFeatures />
      <HomeHow />
      <HomeMedico />
      <HomePaciente />
      <HomeMobile />
      <HomeCTA />
      <HomeFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  section: { width: "100%" },
  inner: { width: "100%", maxWidth: MAX, alignSelf: "center" },
  flex1: { flex: 1 },
  fullCol: { width: "100%" },
  center: { alignItems: "center" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowBetweenTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  bold: { fontFamily: family.bold },
  serif: { fontFamily: family.serifItalic },
  eyebrow: { ...text.eyebrow, fontSize: 11, color: colors.ink3 },

  pulse: { width: 8, height: 8, alignItems: "center", justifyContent: "center" },
  pulseDot: { width: 8, height: 8, borderRadius: 99 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1
  },
  chipText: { fontFamily: family.medium, fontSize: 11.5 },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  navSide: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  navEnd: { justifyContent: "flex-end" },
  navLinks: { flexDirection: "row", gap: 32, alignItems: "center" },
  navLink: { fontFamily: family.regular, fontSize: 13.5, color: colors.ink2 },
  navLogin: { fontFamily: family.regular, fontSize: 13, color: colors.ink2 },
  beta: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4
  },
  betaText: { fontFamily: family.mono, fontSize: 10, color: colors.ink3, letterSpacing: 1 },

  split: { flexDirection: "row", gap: 80, alignItems: "center" },
  splitStack: { flexDirection: "column", gap: 56, alignItems: "stretch" },
  heroLeft: { flex: 1.05 },
  heroRight: { flex: 1 },

  h1: { fontFamily: family.light, color: colors.ink },
  h1Bold: { fontFamily: family.bold, color: colors.accentDeep },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule
  },
  heroBadgeText: { fontFamily: family.medium, fontSize: 12, color: colors.accentDeep },
  heroLead: {
    fontFamily: family.light,
    fontSize: 18,
    lineHeight: 27,
    color: colors.ink2,
    marginTop: 28,
    maxWidth: 560
  },
  heroCta: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 36 },

  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 40 },
  statValue: { fontFamily: family.medium, fontSize: 32, letterSpacing: -0.96 },
  statLabel: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.6,
    marginTop: 2
  },

  previewWrap: { position: "relative" },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    ...shadow.card
  },
  chrome: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  chromeDots: { flexDirection: "row", gap: 6 },
  chromeDot: { width: 10, height: 10, borderRadius: 99 },
  chromeText: { fontFamily: family.mono, fontSize: 10.5, color: colors.ink3 },
  previewBody: { padding: 22 },
  previewHeadText: { flex: 1, minWidth: 0 },
  chipHold: { flexShrink: 0 },
  previewName: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    lineHeight: 27,
    color: colors.ink,
    marginTop: 4
  },
  previewMeta: { fontFamily: family.mono, fontSize: 11, color: colors.ink3, marginTop: 4 },

  allergyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14
  },
  allergyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.alert
  },
  allergyBadgeText: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.white
  },
  allergyText: { flex: 1, fontFamily: family.regular, fontSize: 12.5, color: colors.ink },

  expGrid: {
    marginTop: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.rule,
    overflow: "hidden",
    gap: 1
  },
  expRow: { flexDirection: "row", gap: 1 },
  expCell: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 13, paddingVertical: 11 },
  expCount: { fontFamily: family.mono, fontSize: 11, color: colors.accentDeep },
  expBody: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2,
    lineHeight: 16,
    marginTop: 4
  },

  quickRow: { flexDirection: "row", gap: 6, marginTop: 12 },

  floatDark: {
    position: "absolute",
    right: -28,
    top: 60,
    width: 260,
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadow.floating
  },
  floatDarkKicker: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.2
  },
  floatDarkName: { fontFamily: family.medium, fontSize: 13, color: colors.paper, marginTop: 6 },
  floatDarkUrl: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2
  },

  floatLight: {
    position: "absolute",
    left: -32,
    bottom: -40,
    width: 220,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadow.floating
  },
  adhRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 8 },
  adhValue: { fontFamily: family.medium, fontSize: 32, letterSpacing: -1, color: colors.ink },
  adhPct: { fontFamily: family.mono, fontSize: 13, color: colors.ink3 },
  adhDelta: { fontFamily: family.mono, fontSize: 11, color: colors.ok },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    marginTop: 10,
    height: 28
  },

  trust: { width: "100%", backgroundColor: colors.ink, paddingVertical: 32 },
  trustInner: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 48 },
  trustHead: { minWidth: 220 },
  trustKicker: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.6
  },
  trustNorms: { fontFamily: family.mono, fontSize: 14, color: colors.paper, marginTop: 6 },
  trustGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 24 },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexBasis: 150,
    flexGrow: 1
  },
  trustItemBody: {
    flex: 1,
    minWidth: 0
  },
  trustItemKey: { fontFamily: family.medium, fontSize: 13.5, color: colors.paper },
  trustItemVal: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2
  },

  h2: { fontFamily: family.light, color: colors.ink },
  h2Bold: { fontFamily: family.bold, color: colors.accentDeep },

  featuresHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 40,
    marginBottom: 56
  },
  featuresHeadStack: { flexDirection: "column", alignItems: "flex-start" },
  featuresAside: {
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink3,
    maxWidth: 320,
    lineHeight: 21
  },

  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  featureCardWrap: { flexBasis: "30%", flexGrow: 1, minWidth: 260 },
  featureCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 30,
    paddingVertical: 28
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  featureTitle: {
    fontFamily: family.medium,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.ink,
    lineHeight: 23,
    marginTop: 22
  },
  featureBody: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2,
    lineHeight: 21,
    marginTop: 8
  },

  howHead: { alignItems: "center", marginBottom: 64 },
  howSub: {
    fontFamily: family.regular,
    fontSize: 16,
    color: colors.ink3,
    marginTop: 16,
    maxWidth: 600,
    textAlign: "center",
    lineHeight: 24
  },
  stepGrid: { flexDirection: "row", flexWrap: "wrap", gap: 24 },
  stepCardWrap: { flexBasis: 300, flexGrow: 1, minWidth: 280 },
  stepCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 28,
    paddingVertical: 28,
    gap: 14
  },
  stepBadge: {
    position: "absolute",
    top: -16,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft
  },
  stepBadgeText: { fontFamily: family.mono, fontSize: 14, color: colors.paper, letterSpacing: 0.8 },
  stepTitle: { fontFamily: family.medium, fontSize: 22, letterSpacing: -0.4, color: colors.ink },
  stepBody: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2,
    lineHeight: 21,
    marginTop: 8
  },

  illoRegister: { backgroundColor: colors.paper3, borderRadius: radii.lg, padding: 16, height: 160 },
  illoRegList: { gap: 8, marginTop: 12 },
  illoRegRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 6
  },
  illoRegKey: { fontFamily: family.mono, fontSize: 11, color: colors.ink3 },
  illoRegVal: { fontFamily: family.medium, fontSize: 11, color: colors.ink },
  illoConnect: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: 16,
    height: 160,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  illoConnectKicker: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2
  },
  illoConnectUrl: { fontFamily: family.mono, fontSize: 18, color: colors.paper, marginTop: 8 },
  illoConnectTime: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  illoConnectTimeText: { fontFamily: family.mono, fontSize: 11, color: "rgba(255,255,255,0.7)" },
  qrBox: { width: 80, height: 80, backgroundColor: colors.white, borderRadius: radii.md, padding: 8 },
  illoManage: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 160,
    overflow: "hidden"
  },
  illoManageAvatar: { width: 32, height: 32, borderRadius: 99, backgroundColor: colors.paper3 },
  illoManageName: { fontFamily: family.serifItalic, fontSize: 16, color: colors.ink },
  illoManageMeta: { fontFamily: family.mono, fontSize: 10, color: colors.ink3, marginTop: 2 },
  illoManageAllergy: {
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: 6
  },
  illoManageAllergyTag: { fontFamily: family.semibold, fontSize: 10.5, color: colors.alert },
  illoManageAllergyText: { fontFamily: family.regular, fontSize: 10.5, color: colors.ink2 },
  illoManageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  illoManageCell: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: colors.paper2,
    borderRadius: 4
  },
  illoManageCellKey: { fontFamily: family.mono, fontSize: 10, color: colors.accentDeep },
  illoManageCellVal: { fontFamily: family.regular, fontSize: 10, color: colors.ink2 },

  splitH2: { marginTop: 18 },
  splitLead: {
    fontFamily: family.regular,
    fontSize: 16,
    color: colors.ink2,
    lineHeight: 25,
    marginTop: 18,
    maxWidth: 520
  },
  checkList: { gap: 14, marginTop: 28 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  checkText: { flex: 1, fontFamily: family.regular, fontSize: 14, color: colors.ink },
  splitStats: {
    marginTop: 36,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: colors.rule
  },
  splitBtn: { marginTop: 32 },

  medicoWrap: { position: "relative", paddingBottom: 32, paddingRight: 24 },
  medicoCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadow.card
  },
  medicoHeader: {
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  medicoDoc: { fontFamily: family.medium, fontSize: 13, color: colors.paper },
  medicoDocMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2
  },
  medicoBody: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18 },
  medicoList: { marginTop: 10, gap: 6 },
  agendaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1
  },
  agendaBody: { flex: 1, minWidth: 0 },
  agendaTime: { width: 46, fontFamily: family.mono, fontSize: 12, color: colors.ink2 },
  agendaName: { fontFamily: family.medium, fontSize: 13, color: colors.ink },
  agendaTag: { fontFamily: family.mono, fontSize: 10, color: colors.ink3, marginTop: 2 },
  medicoAlert: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  medicoAlertBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: colors.alert,
    borderRadius: 999
  },
  medicoAlertBadgeText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.white,
    letterSpacing: 1
  },
  medicoAlertText: { flex: 1, fontFamily: family.regular, fontSize: 12, color: colors.ink },
  medicoFloat: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...shadow.floating
  },
  medicoFloatValue: { fontFamily: family.medium, fontSize: 28, letterSpacing: -0.6, color: colors.white },
  medicoFloatLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4
  },

  pacienteWrap: { position: "relative", alignItems: "center", paddingTop: 60, paddingLeft: 32 },
  phone: {
    width: 280,
    backgroundColor: colors.ink,
    borderRadius: 36,
    padding: 8,
    ...shadow.floating
  },
  phoneScreen: {
    backgroundColor: colors.paper,
    borderRadius: 28,
    overflow: "hidden",
    minHeight: 540,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 18
  },
  phoneAvatar: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center"
  },
  phoneAvatarText: { fontFamily: family.mono, fontSize: 11, color: colors.paper },
  phoneHello: { fontFamily: family.serifItalic, fontSize: 26, color: colors.ink, marginTop: 4 },
  phoneAppt: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16
  },
  phoneApptKicker: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1
  },
  phoneApptTime: { fontFamily: family.medium, fontSize: 22, letterSpacing: -0.4, color: colors.paper, marginTop: 6 },
  phoneApptDoc: { fontFamily: family.regular, fontSize: 12, color: colors.paper, marginTop: 4 },
  phoneApptSpec: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2
  },
  phoneAllergy: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: radii.md
  },
  phoneAllergyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.alert,
    borderRadius: 999
  },
  phoneAllergyBadgeText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.white,
    letterSpacing: 1
  },
  phoneAllergyText: { fontFamily: family.regular, fontSize: 12, color: colors.ink, marginTop: 6 },
  phoneList: { gap: 6, marginTop: 14 },
  phoneListRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule2
  },
  phoneListKey: { fontFamily: family.regular, fontSize: 12, color: colors.ink },
  phoneListVal: { fontFamily: family.mono, fontSize: 12, color: colors.ink3 },
  pacienteFloat: {
    position: "absolute",
    top: 60,
    left: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadow.floating
  },
  pacienteFloatValue: {
    fontFamily: family.medium,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.accentDeep,
    marginTop: 4
  },

  mobileList: { gap: 16, marginTop: 28 },
  mobileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  mobileIcon: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  mobileRowText: { flex: 1, fontFamily: family.regular, fontSize: 14, color: colors.ink },
  storeNote: { fontFamily: family.mono, fontSize: 11, lineHeight: 17, color: colors.ink3, marginTop: 32, maxWidth: 380 },
  mobileMockWrap: { position: "relative", alignItems: "center", justifyContent: "center" },

  ctaInner: { alignItems: "center", maxWidth: 1000, alignSelf: "center" },
  ctaEyebrow: { ...text.eyebrow, fontSize: 11, color: "rgba(255,255,255,0.65)" },
  ctaTitle: {
    fontFamily: family.light,
    color: colors.paper,
    textAlign: "center",
    marginTop: 18
  },
  ctaSub: {
    fontFamily: family.regular,
    fontSize: 17,
    lineHeight: 26,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 24,
    maxWidth: 620
  },
  ctaButtons: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 40 },
  ctaNote: {
    fontFamily: family.mono,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.6,
    marginTop: 24,
    textAlign: "center"
  },

  footer: { width: "100%", backgroundColor: "#0A0A2C", paddingTop: 64, paddingBottom: 32 },
  footerTop: {
    flexDirection: "row",
    gap: 60,
    paddingBottom: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)"
  },
  footerTopStack: { flexDirection: "column", gap: 40 },
  footerBrand: { flex: 1.4, minWidth: 260 },
  footerDesc: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 21,
    marginTop: 18,
    maxWidth: 320
  },
  footerChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
  footerCol: { flex: 1, minWidth: 140 },
  footerHeading: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.3,
    marginBottom: 18
  },
  footerLinks: { gap: 12 },
  footerLink: { fontFamily: family.regular, fontSize: 13.5, color: "rgba(255,255,255,0.8)" },
  footerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingTop: 24
  },
  footerBottomStack: { justifyContent: "flex-start" },
  footerMeta: { fontFamily: family.mono, fontSize: 11, color: "rgba(255,255,255,0.45)" }
});
