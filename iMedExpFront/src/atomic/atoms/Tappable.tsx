import { PropsWithChildren, useCallback, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Insets,
  Pressable,
  StyleProp,
  ViewStyle
} from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";

type TappableProps = PropsWithChildren<{
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  hitSlop?: Insets | number;
  accessibilityLabel?: string;
  accessibilityState?: {
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
  };
}>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Tappable({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.97,
  disabled = false,
  hitSlop,
  accessibilityLabel,
  accessibilityState
}: TappableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = useCallback(
    (to: number) => {
      if (disabled) return;
      Animated.spring(scale, {
        toValue: to,
        useNativeDriver: USE_NATIVE_DRIVER,
        speed: 40,
        bounciness: 6
      }).start();
    },
    [disabled, scale]
  );

  const handlePressIn = useCallback(() => animate(scaleTo), [animate, scaleTo]);
  const handlePressOut = useCallback(() => animate(1), [animate]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={[style, { transform: [{ scale }], opacity: disabled ? 0.55 : 1 }]}
    >
      {children}
    </AnimatedPressable>
  );
}
