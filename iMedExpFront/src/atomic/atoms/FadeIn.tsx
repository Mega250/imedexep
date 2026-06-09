import { PropsWithChildren, useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleProp, ViewStyle } from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";

type FadeInProps = PropsWithChildren<{
  delay?: number;
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}>;

let reduceMotion = false;
let reduceMotionReady = false;

function hydrateReduceMotion(): void {
  if (reduceMotionReady) return;
  reduceMotionReady = true;
  AccessibilityInfo.isReduceMotionEnabled()
    .then((v) => {
      reduceMotion = v;
    })
    .catch(() => {
      reduceMotion = false;
    });
  AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
    reduceMotion = v;
  });
}

hydrateReduceMotion();

export function FadeIn({ children, delay = 0, offset = 12, duration = 280, style }: FadeInProps) {
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: Math.min(delay, 100),
      easing: Easing.bezier(0.2, 0.7, 0.2, 1),
      useNativeDriver: USE_NATIVE_DRIVER
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [delay, duration, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
