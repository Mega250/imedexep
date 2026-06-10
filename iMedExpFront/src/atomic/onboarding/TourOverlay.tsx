import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { TargetRect, useOnboarding } from "@/state/onboarding";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const DIM = "rgba(3,4,94,0.62)";
const PAD = 8; // margen del recorte alrededor del target
const CARD_GAP = 12;
const CARD_H = 190; // alto aproximado del globo, para mantenerlo dentro de pantalla

export function TourOverlay() {
  const { active, steps, index, measureTarget, next, back, finish } = useOnboarding();
  const { width, height } = useWindowDimensions();
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<View>(null);

  const step = steps[index];
  // Responsivo: en pantallas anchas (escritorio) usamos el ancla alterna
  // (p.ej. la barra lateral); en móvil el target normal. Así el recorte
  // resalta el elemento que SÍ está en pantalla en cada layout.
  const targetId = step
    ? width >= DESKTOP_BREAKPOINT
      ? step.targetWide ?? step.target
      : step.target
    : undefined;

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    let cancelled = false;
    // Medimos varias veces para esperar a que el layout del paso y las
    // animaciones de entrada (FadeIn) se asienten antes de fijar el recorte.
    const measure = () => {
      // Origen real del overlay y target medidos igual (getBoundingClientRect en
      // web), para que rect - origin alinee el recorte aunque un ancestro con
      // transform/filter desplace el overlay. measureInWindow puede reportar mal.
      const node = overlayRef.current as unknown as {
        getBoundingClientRect?: () => { left: number; top: number };
        measureInWindow?: (cb: (x: number, y: number) => void) => void;
      } | null;
      const finish = (ox: number, oy: number) => {
        if (cancelled) return;
        setOrigin({ x: ox, y: oy });
        measureTarget(targetId).then((r) => !cancelled && setRect(r));
      };
      if (Platform.OS === "web" && node?.getBoundingClientRect) {
        const r = node.getBoundingClientRect();
        finish(r.left, r.top);
      } else if (node?.measureInWindow) {
        node.measureInWindow((ox, oy) => finish(ox, oy));
      } else {
        finish(0, 0);
      }
    };
    setRect(null);
    const raf = requestAnimationFrame(measure);
    const timers = [setTimeout(measure, 80), setTimeout(measure, 360), setTimeout(measure, 700)];

    // Web: si el usuario hace scroll (incluido scroll de contenedores internos,
    // por eso capture=true) o cambia el tamaño, re-medimos para que el spotlight
    // siga al target. measureInWindow da coords de viewport y el overlay es fixed.
    let detachWeb: (() => void) | undefined;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onChange = () => measure();
      window.addEventListener("scroll", onChange, true);
      window.addEventListener("resize", onChange);
      detachWeb = () => {
        window.removeEventListener("scroll", onChange, true);
        window.removeEventListener("resize", onChange);
      };
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      detachWeb?.();
    };
  }, [active, index, targetId, measureTarget]);

  if (!active || !steps.length) return null;

  const isLast = index === steps.length - 1;

  // Recorte (spotlight) con padding, clamp a la pantalla.
  const hole = rect
    ? {
        x: Math.max(0, rect.x - origin.x - PAD),
        y: Math.max(0, rect.y - origin.y - PAD),
        w: Math.min(width, rect.width + PAD * 2),
        h: rect.height + PAD * 2
      }
    : null;

  // Posición vertical del globo, siempre dentro de la pantalla: debajo del
  // target si cabe; si no, arriba; si tampoco (target muy alto, p.ej. la barra
  // lateral en escritorio), centrado.
  let cardTop = 0;
  if (hole) {
    const below = hole.y + hole.h + CARD_GAP;
    const above = hole.y - CARD_GAP - CARD_H;
    cardTop = below + CARD_H <= height ? below : above >= 0 ? above : (height - CARD_H) / 2;
    cardTop = Math.min(Math.max(cardTop, CARD_GAP), Math.max(CARD_GAP, height - CARD_H - CARD_GAP));
  }

  const card = (
    <View style={styles.card}>
      <Text style={styles.progress}>{`Paso ${index + 1} de ${steps.length}`}</Text>
      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.body}>{step.body}</Text>
      <View style={styles.actions}>
        <Tappable onPress={finish} hitSlop={8}>
          <Text style={styles.skip}>Saltar</Text>
        </Tappable>
        <View style={styles.actionsRight}>
          {index > 0 ? (
            <Button label="Atrás" variant="ghost" size="sm" height={38} block={false} onPress={back} />
          ) : null}
          <Button label={isLast ? "Listo" : "Siguiente"} size="sm" height={38} block={false} onPress={next} />
        </View>
      </View>
    </View>
  );

  // Web: overlay anclado al viewport (coincide con measureInWindow =
  // getBoundingClientRect). Nativo: absoluteFill cubre la pantalla.
  const overlayStyle =
    Platform.OS === "web"
      ? ({ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 } as any)
      : StyleSheet.absoluteFill;

  return (
    <View ref={overlayRef} style={overlayStyle} pointerEvents="box-none">
      {hole ? (
        <>
          {/* 4 rectángulos oscuros que dejan ver el target (spotlight) */}
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: hole.y }]} />
          <View style={[styles.dim, { top: hole.y + hole.h, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.dim, { top: hole.y, left: 0, width: hole.x, height: hole.h }]} />
          <View
            style={[styles.dim, { top: hole.y, left: hole.x + hole.w, right: 0, height: hole.h }]}
          />
          {/* Anillo resaltado sobre el target */}
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              { top: hole.y, left: hole.x, width: hole.w, height: hole.h }
            ]}
          />
          {/* Globo: debajo o arriba del target */}
          <View style={[styles.cardWrap, { top: cardTop }]}>
            {card}
          </View>
        </>
      ) : (
        // Paso sin target (bienvenida): pantalla oscurecida + tarjeta centrada
        <View style={[StyleSheet.absoluteFill, styles.centerDim]}>
          <View style={styles.cardWrapCentered}>{card}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    backgroundColor: DIM
  },
  ring: {
    position: "absolute",
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.accentBright
  },
  centerDim: {
    backgroundColor: DIM,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  cardWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center"
  },
  cardWrapCentered: {
    width: "100%",
    maxWidth: 360,
    alignItems: "stretch"
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 18
  },
  progress: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.accentDeep
  },
  title: {
    fontFamily: family.medium,
    fontSize: 18,
    color: colors.ink,
    marginTop: 6
  },
  body: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink2,
    marginTop: 6
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16
  },
  actionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  skip: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink3
  }
});
