import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Tappable } from "@/atomic/atoms/Tappable";
import { goToScreen } from "@/navigation/screenRouter";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

const CHIPS: { label: string; screen?: string }[] = [
  { label: "Resumen", screen: "pat-hist" },
  { label: "Alergias", screen: "pat-alergias" },
  { label: "Enf. crónicas", screen: "pat-enf" },
  { label: "Cirugías", screen: "pat-cirugias" },
  { label: "Familia", screen: "pat-familia" },
  { label: "Vacunas", screen: "pat-vacunas" },
  { label: "Signos", screen: "pat-vitals" },
  { label: "Peso/IMC", screen: "pat-peso" },
  { label: "Síntomas", screen: "pat-sintomas" },
  { label: "Glucosa", screen: "pat-glucosa" }
];

type HistChipsProps = {
  active: number;
};

export function HistChips({ active }: HistChipsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CHIPS.map((chip, index) => {
          const on = index === active;
          return (
            <Tappable
              key={chip.label}
              scaleTo={0.94}
              onPress={() => {
                if (chip.screen && !on) {
                  goToScreen(chip.screen);
                }
              }}
            >
              <View
                style={[
                  styles.chip,
                  {
                    borderColor: on ? colors.ink : colors.rule,
                    backgroundColor: on ? colors.ink : colors.white
                  }
                ]}
              >
                <Text
                  style={[styles.chipText, { color: on ? colors.paper : colors.ink2 }]}
                >
                  {chip.label}
                </Text>
              </View>
            </Tappable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  row: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  chipText: {
    fontFamily: family.medium,
    fontSize: 11.5
  }
});
