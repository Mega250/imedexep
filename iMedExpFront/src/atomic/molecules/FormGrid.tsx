import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type FormGridProps = {
  children: ReactNode;
  gap?: number;
};

export function FormGrid({ children, gap = 14 }: FormGridProps) {
  return <View style={[styles.grid, { gap }]}>{children}</View>;
}

type FormGridItemProps = {
  span?: 1 | 2 | 3;
  children: ReactNode;
};

export function FormGridItem({ span = 1, children }: FormGridItemProps) {
  const flex = span === 3 ? 1 : undefined;
  const minWidth = span === 2 ? "60%" : span === 3 ? "100%" : "30%";
  return <View style={[styles.item, { flex, minWidth }]}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  item: {
    flexGrow: 1
  }
});
