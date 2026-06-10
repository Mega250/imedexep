import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Tappable } from "@/atomic/atoms/Tappable";
import { TargetRect, useOnboarding } from "@/state/onboarding";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const DIM = "rgba(3,4,94,0.62)";
const PAD = 8; // margen del recorte alrededor del target
const CARD_GAP = 12;

export function TourOverlay() {
  const { active, steps, index, measureCurrent, next, back, finish } = useOnboarding();
  const { width, height } = useWindowDimensions();
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    let cancelled = false;
    // Medimos tras un frame para que el layout del paso ya esté asentado.
    const measure = () => measureCurrent().then((r) => !cancelled && setRect(r));
    setRect(null);
    const t = setTimeout(measure, 60);
    const t2 = setTimeout(measure, 320); // reintento por si el target aún no montaba
    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [active, index, measureCurrent]);

  if (!active || !steps.length) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  // Recorte (spotlight) con padding, clamp a la pantalla.
  const hole = rect
    ? {
        x: Math.max(0, rect.x - PAD),
        y: Math.max(0, rect.y - PAD),
        w: Math.min(width, rect.width + PAD * 2),
        h: rect.height + PAD * 2
      }
    : null;

  // El globo va debajo del target si está en la mitad superior; si no, arriba.
  const targetBelowHalf = hole ? hole.y > height * 0.5 : false;

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

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
          <View
            style={[
              styles.cardWrap,
              targetBelowHalf
                ? { bottom: height - hole.y + CARD_GAP }
                : { top: hole.y + hole.h + CARD_GAP }
            ]}
          >
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
