import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import { colors } from "@/theme/tokens";

type SwitchProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  accessibilityLabel?: string;
};

export function Switch({ value, onValueChange, accessibilityLabel }: SwitchProps) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      speed: 16,
      bounciness: 6
    }).start();
  }, [value, progress]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.rule, colors.accentBright]
  });
  const knobX = progress.interpolate({ inputRange: [0, 1], outputRange: [2, 16] });

  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={{
          width: 36,
          height: 22,
          borderRadius: 99,
          backgroundColor: trackColor,
          justifyContent: "center"
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            borderRadius: 99,
            backgroundColor: colors.white,
            transform: [{ translateX: knobX }]
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
