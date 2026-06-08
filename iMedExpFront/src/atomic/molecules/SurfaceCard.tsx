import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/atomic/atoms/Card";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type SurfaceCardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: object;
};

export function SurfaceCard({ title, action, children, style }: SurfaceCardProps) {
  return (
    <Card radius={radii.lg} style={[styles.card, style]}>
      {(title || action) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {action && <View>{action}</View>}
        </View>
      )}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2,
    padding: 18
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  title: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  }
});
