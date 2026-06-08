import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export type PermissionCell = "allow" | "deny" | "partial" | "none";

export type PermissionRow = {
  module: string;
  cells: PermissionCell[];
};

type PermissionMatrixProps = {
  roles: string[];
  rows: PermissionRow[];
};

function CellIcon({ type }: { type: PermissionCell }) {
  if (type === "allow") return <Icon kind="check" size={13} color={colors.ok} strokeWidth={2} />;
  if (type === "deny") return <Icon kind="x" size={13} color={colors.alert} strokeWidth={2} />;
  if (type === "partial") return <Text style={styles.dash}>—</Text>;
  return null;
}

export function PermissionMatrix({ roles, rows }: PermissionMatrixProps) {
  const COL_W = 96;
  const LABEL_W = 180;
  const minW = LABEL_W + roles.length * COL_W;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={{ minWidth: minW }}>
        <View style={styles.header}>
          <View style={[styles.labelCell, { width: LABEL_W }]}>
            <Text style={styles.headerText} numberOfLines={1}>Módulo</Text>
          </View>
          {roles.map((r) => (
            <View key={r} style={[styles.roleCell, { width: COL_W }]}>
              <Text style={styles.headerText} numberOfLines={2} ellipsizeMode="tail">
                {r}
              </Text>
            </View>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
            <View style={[styles.labelCell, { width: LABEL_W }]}>
              <Text style={styles.moduleText} numberOfLines={2} ellipsizeMode="tail">
                {row.module}
              </Text>
            </View>
            {row.cells.map((cell, j) => (
              <View key={j} style={[styles.dataCell, { width: COL_W }]}>
                <CellIcon type={cell} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    marginBottom: 2,
    minHeight: 46
  },
  headerText: {
    fontFamily: family.medium,
    fontSize: 10.5,
    color: colors.paper,
    letterSpacing: 0.2
  },
  labelCell: {
    justifyContent: "center",
    paddingHorizontal: 8
  },
  roleCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    minHeight: 46
  },
  rowAlt: {
    backgroundColor: colors.paper
  },
  moduleText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  dataCell: {
    alignItems: "center",
    justifyContent: "center"
  },
  dash: {
    fontFamily: family.mono,
    fontSize: 14,
    color: colors.ink3
  }
});
