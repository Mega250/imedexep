import { StyleSheet, Text, View } from "react-native";
import { Switch } from "@/atomic/atoms/Switch";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
};

export function ToggleRow({ label, description, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.desc}>{description}</Text>}
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  text: {
    flex: 1
  },
  label: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink
  },
  desc: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2
  }
});
