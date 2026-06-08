import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
  hint?: string;
  options?: string[];
  onValueChange?: (value: string) => void;
  onPress?: () => void;
};

export function SelectField({
  label,
  placeholder = "Selecciona…",
  value,
  hint,
  options,
  onValueChange,
  onPress
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);

  function handlePress() {
    if (options && options.length) {
      setOpen((v) => !v);
      return;
    }
    onPress?.();
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Tappable onPress={handlePress} scaleTo={0.99}>
        <View style={styles.field}>
          <Text style={[styles.value, { color: hasValue ? colors.ink : colors.ink3 }]}>
            {hasValue ? value : placeholder}
          </Text>
          <Icon kind={open ? "chev-u" : "chev-d"} size={14} color={colors.ink3} />
        </View>
      </Tappable>
      {open && options ? (
        <View style={styles.menu}>
          {options.map((option) => (
            <Tappable
              key={option}
              scaleTo={0.99}
              onPress={() => {
                onValueChange?.(option);
                setOpen(false);
              }}
            >
              <View
                style={[
                  styles.option,
                  option === value ? { backgroundColor: colors.paper3 } : null
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
                {option === value ? (
                  <Icon kind="check" size={13} color={colors.accentDeep} />
                ) : null}
              </View>
            </Tappable>
          ))}
        </View>
      ) : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
  field: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  value: {
    fontFamily: family.regular,
    fontSize: 14
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  optionText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink
  },
  hint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  }
});
