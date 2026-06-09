import { ReactNode } from "react";
import { KeyboardTypeOptions, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { TextField } from "@/atomic/atoms/TextField";

type FormFieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  icon?: IconKind;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  hint?: string;
  rightSlot?: ReactNode;
  style?: StyleProp<ViewStyle>;
  valid?: boolean;
  errorText?: string | null;
};

export function FormField({
  label,
  placeholder,
  value,
  defaultValue,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  hint,
  rightSlot,
  style,
  valid,
  errorText
}: FormFieldProps) {
  const slot = errorText
    ? rightSlot
    : valid
    ? (
        <View style={styles.validBadge}>
          <Icon kind="check" size={14} color={colors.ok} strokeWidth={2.4} />
        </View>
      )
    : rightSlot;

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextField
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        icon={icon}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        rightSlot={slot}
      />
      {errorText ? (
        <Text style={styles.error}>{errorText}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6
  },
  label: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  hint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  error: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.alert
  },
  validBadge: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: colors.okSoft,
    alignItems: "center",
    justifyContent: "center"
  }
});
