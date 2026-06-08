import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type FilterItem = {
  label: string;
  key: string;
};

type FilterPillRowProps = {
  items: FilterItem[];
  active: string;
  onSelect: (key: string) => void;
};

export function FilterPillRow({ items, active, onSelect }: FilterPillRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => (
        <Tappable key={item.key} onPress={() => onSelect(item.key)} scaleTo={0.95}>
          <View style={[styles.pill, item.key === active && styles.pillActive]}>
            <Text style={[styles.label, item.key === active && styles.labelActive]}>
              {item.label}
            </Text>
          </View>
        </Tappable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  pillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  label: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3
  },
  labelActive: {
    fontFamily: family.medium,
    color: colors.paper
  }
});
