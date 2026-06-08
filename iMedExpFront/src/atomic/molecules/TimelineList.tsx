import { StyleSheet, Text, View } from "react-native";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export type TimelineEvent = {
  date: string;
  title: string;
  sub?: string;
  icon?: IconKind;
  accent?: boolean;
};

type TimelineListProps = {
  events: TimelineEvent[];
};

export function TimelineList({ events }: TimelineListProps) {
  return (
    <View style={styles.list}>
      {events.map((ev, i) => (
        <View key={i} style={styles.item}>
          <View style={styles.left}>
            <View style={[styles.dot, ev.accent && styles.dotAccent]}>
              {ev.icon && (
                <Icon
                  kind={ev.icon}
                  size={11}
                  color={ev.accent ? colors.paper : colors.ink3}
                  strokeWidth={1.8}
                />
              )}
            </View>
            {i < events.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.body}>
            <Text style={styles.date}>{ev.date}</Text>
            <Text style={styles.title}>{ev.title}</Text>
            {ev.sub && <Text style={styles.sub}>{ev.sub}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0
  },
  item: {
    flexDirection: "row",
    gap: 14
  },
  left: {
    alignItems: "center",
    width: 28
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  dotAccent: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: colors.rule2,
    marginVertical: 4
  },
  body: {
    flex: 1,
    paddingBottom: 18
  },
  date: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.3,
    marginBottom: 3
  },
  title: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  sub: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2
  }
});
