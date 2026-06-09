import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors, shadow } from "@/theme/tokens";
import { family } from "@/theme/typography";

type FABProps = {
  icon?: IconKind;
  label?: string;
  onPress?: () => void;
  offset?: number;
};

export function FAB({ icon = "plus", label, onPress, offset = 84 }: FABProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.anchor, { bottom: Math.max(insets.bottom, 12) + offset }]}>
      <Tappable onPress={onPress} scaleTo={0.93} accessibilityLabel={label ?? "Acción"}>
        <View style={[styles.fab, { paddingHorizontal: label ? 18 : 14 }]}>
          <Icon kind={icon} size={18} color={colors.paper} />
          {label ? <Text style={styles.label}>{label}</Text> : null}
        </View>
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    right: 18
  },
  fab: {
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...shadow.floating
  },
  label: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.paper
  }
});
