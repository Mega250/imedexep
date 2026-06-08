import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type KpiGridProps = {
  children: ReactNode;
  gap?: number;
};

export function KpiGrid({ children, gap = 12 }: KpiGridProps) {
  return <View style={[styles.grid, { gap }]}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});
