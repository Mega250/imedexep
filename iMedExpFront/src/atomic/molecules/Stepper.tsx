import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Icon } from "@/atomic/atoms/Icon";

type StepperProps = {
  steps: string[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const circleBg = done ? colors.accent : active ? colors.ink : colors.paper3;
        const labelColor = active ? colors.ink : done ? colors.ink2 : colors.ink3;
        return (
          <Fragment key={step}>
            <View style={styles.step}>
              <View style={[styles.circle, { backgroundColor: circleBg }]}>
                {done ? (
                  <Icon kind="check" size={10} color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.num,
                      { color: done || active ? colors.white : colors.ink3 }
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[styles.label, { color: labelColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {step}
              </Text>
            </View>
            {index < steps.length - 1 ? (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: done ? colors.accent : colors.rule }
                ]}
              />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  num: {
    fontFamily: family.monoMedium,
    fontSize: 10
  },
  label: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    fontFamily: family.medium,
    fontSize: 11
  },
  connector: {
    flex: 1,
    height: 1,
    minWidth: 8,
    maxWidth: 36
  }
});
