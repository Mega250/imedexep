import { ReactNode, useState } from "react";
import {
  KeyboardTypeOptions,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle
} from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Icon, IconKind } from "./Icon";

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as object)
    : null;

type TextFieldProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  icon?: IconKind;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightSlot?: ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  placeholder,
  value,
  defaultValue,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = "sentences",
  rightSlot,
  height = 46,
  style
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const row = (
    <View
      style={[
        styles.wrap,
        {
          height,
          borderColor: focused ? colors.accent : colors.rule,
          paddingLeft: icon ? 38 : 14,
          paddingRight: rightSlot ? 44 : 14
        },
        label ? null : style
      ]}
    >
      {icon ? (
        <View style={styles.icon}>
          <Icon kind={icon} size={15} color={focused ? colors.accent : colors.ink3} />
        </View>
      ) : null}
      <TextInput
        style={[styles.input, webNoOutline]}
        placeholder={placeholder}
        placeholderTextColor={colors.ink3}
        value={value}
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
    </View>
  );

  if (label) {
    return (
      <View style={[styles.field, style]}>
        <Text style={styles.label}>{label}</Text>
        {row}
      </View>
    );
  }

  return row;
}

const styles = StyleSheet.create({
  field: {
    gap: 6
  },
  label: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  icon: {
    position: "absolute",
    left: 14
  },
  right: {
    position: "absolute",
    right: 8,
    maxWidth: 80
  },
  input: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink,
    padding: 0
  }
});
