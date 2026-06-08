import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export type DataTableColumn = {
  key: string;
  label: string;
  width?: number;
  flex?: number;
};

export type DataTableRow = Record<string, string | number>;

type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  minWidth?: number;
};

export function DataTable({ columns, rows, minWidth }: DataTableProps) {
  const containerStyle = minWidth ? { minWidth } : undefined;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={containerStyle}>
        <View style={styles.header}>
          {columns.map((col) => (
            <View
              key={col.key}
              style={[styles.cell, col.width ? { width: col.width } : { flex: col.flex ?? 1 }]}
            >
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {col.label}
              </Text>
            </View>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
            {columns.map((col) => (
              <View
                key={col.key}
                style={[styles.cell, col.width ? { width: col.width } : { flex: col.flex ?? 1 }]}
              >
                <Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
                  {String(row[col.key] ?? "")}
                </Text>
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
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 2
  },
  headerText: {
    fontFamily: family.medium,
    fontSize: 11,
    color: colors.paper,
    letterSpacing: 0.3
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  rowAlt: {
    backgroundColor: colors.paper
  },
  cell: {
    paddingRight: 12,
    overflow: "hidden",
    minWidth: 0
  },
  cellText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  }
});
