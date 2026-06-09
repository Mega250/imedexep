import { Fragment, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/theme/tokens";

type Props = { content: string; onInk?: boolean };

function inline(text: string, color: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p.length > 0);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={index} style={[styles.bold, { color }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <Text key={index} style={styles.code}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function isSeparator(line: string): boolean {
  const t = line.trim();
  return t.includes("-") && /^\|?[\s:|-]+\|?$/.test(t);
}

function Table({ header, rows, color }: { header: string[]; rows: string[][]; color: string }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.trHead]}>
        {header.map((c, i) => (
          <View key={i} style={styles.cell}>
            <Text style={[styles.cellText, styles.bold, { color }]}>{inline(c, color)}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={[styles.tr, r % 2 === 1 && styles.trAlt]}>
          {row.map((c, i) => (
            <View key={i} style={styles.cell}>
              <Text style={[styles.cellText, { color }]}>{inline(c, color)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function MarkdownText({ content, onInk }: Props) {
  const color = onInk ? colors.white : colors.ink;
  const muted = onInk ? colors.white : colors.ink3;
  const lines = (content || "").replace(/\r/g, "").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (line.startsWith("|") && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const header = cells(line);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        rows.push(cells(lines[j].trim()));
        j += 1;
      }
      nodes.push(<Table key={i} header={header} rows={rows} color={color} />);
      i = j;
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      nodes.push(
        <Text key={i} style={[styles.heading, { color, fontSize: 20 - level * 2 }]}>
          {inline(heading[2], color)}
        </Text>,
      );
      i += 1;
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      nodes.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, { color: colors.accent }]}>•</Text>
          <Text style={[styles.paragraph, styles.bulletText, { color }]}>{inline(bullet[1], color)}</Text>
        </View>,
      );
      i += 1;
      continue;
    }
    const numbered = line.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      nodes.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, { color: colors.accent }]}>{numbered[1]}.</Text>
          <Text style={[styles.paragraph, styles.bulletText, { color }]}>{inline(numbered[2], color)}</Text>
        </View>,
      );
      i += 1;
      continue;
    }
    if (!line) {
      i += 1;
      continue;
    }
    nodes.push(
      <Text key={i} style={[styles.paragraph, { color: line.startsWith(">") ? muted : color }]}>
        {inline(line.replace(/^>\s?/, ""), color)}
      </Text>,
    );
    i += 1;
  }
  return <View style={styles.container}>{nodes}</View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  paragraph: { fontSize: 15, lineHeight: 21 },
  bold: { fontWeight: "700" },
  code: { fontFamily: "monospace", fontSize: 13.5 },
  heading: { fontWeight: "700", marginTop: 2 },
  bulletRow: { flexDirection: "row", gap: spacing.xs, paddingRight: spacing.sm },
  bulletDot: { fontSize: 15, lineHeight: 21, fontWeight: "700" },
  bulletText: { flex: 1 },
  table: { borderWidth: 1, borderColor: colors.rule, borderRadius: radii.md, overflow: "hidden", marginVertical: spacing.xs / 2 },
  tr: { flexDirection: "row" },
  trHead: { backgroundColor: colors.paper3 },
  trAlt: { backgroundColor: colors.paper2 },
  cell: { flex: 1, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRightWidth: StyleSheet.hairlineWidth, borderColor: colors.rule },
  cellText: { fontSize: 13.5, lineHeight: 19 },
});
