import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const CELL_H = 56;
const LABEL_W = 52;

export type WeekEvent = {
  day: number;
  startHour: number;
  durationHours: number;
  title: string;
  sub?: string;
  color?: string;
};

type WeekGridProps = {
  events?: WeekEvent[];
  mode?: "week" | "month";
  monthDays?: number;
  markedDays?: number[];
};

export function WeekGrid({ events = [], mode = "week", monthDays = 30, markedDays = [] }: WeekGridProps) {
  if (mode === "month") {
    return <MonthDots days={monthDays} markedDays={markedDays} />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: 700 }}>
        <View style={styles.headerRow}>
          <View style={{ width: LABEL_W }} />
          {DAYS.map((d) => (
            <View key={d} style={styles.dayHeader}>
              <Text style={styles.dayText}>{d}</Text>
            </View>
          ))}
        </View>
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={styles.grid}>
            <View style={styles.hourLabels}>
              {HOURS.map((h) => (
                <View key={h} style={[styles.hourCell, { height: CELL_H }]}>
                  <Text style={styles.hourText}>{h}</Text>
                </View>
              ))}
            </View>
            {DAYS.map((_, di) => (
              <View key={di} style={styles.dayCol}>
                {HOURS.map((_, hi) => (
                  <View key={hi} style={[styles.cell, { height: CELL_H }]} />
                ))}
                {events
                  .filter((e) => e.day === di)
                  .map((ev, i) => (
                    <View
                      key={i}
                      style={[
                        styles.event,
                        {
                          top: ev.startHour * CELL_H,
                          height: ev.durationHours * CELL_H - 4,
                          backgroundColor: ev.color ?? colors.accentBright
                        }
                      ]}
                    >
                      <Text style={styles.eventTitle} numberOfLines={1}>{ev.title}</Text>
                      {ev.sub && <Text style={styles.eventSub} numberOfLines={1}>{ev.sub}</Text>}
                    </View>
                  ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function MonthDots({ days, markedDays }: { days: number; markedDays: number[] }) {
  const nums = Array.from({ length: days }, (_, i) => i + 1);
  return (
    <View style={styles.monthGrid}>
      {nums.map((n) => {
        const marked = markedDays.includes(n);
        return (
          <View key={n} style={[styles.monthCell, marked && styles.monthCellMarked]}>
            <Text style={[styles.monthNum, marked && styles.monthNumMarked]}>{n}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8
  },
  dayText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  body: {
    maxHeight: CELL_H * 6
  },
  grid: {
    flexDirection: "row"
  },
  hourLabels: {
    width: LABEL_W
  },
  hourCell: {
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingRight: 8
  },
  hourText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    textAlign: "right"
  },
  dayCol: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: colors.rule2
  },
  cell: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  event: {
    position: "absolute",
    left: 2,
    right: 2,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  eventTitle: {
    fontFamily: family.medium,
    fontSize: 11,
    color: colors.ink
  },
  eventSub: {
    fontFamily: family.regular,
    fontSize: 10,
    color: colors.ink2
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  monthCell: {
    width: 36,
    height: 36,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2
  },
  monthCellMarked: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  monthNum: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  monthNumMarked: {
    fontFamily: family.medium,
    color: colors.paper
  }
});
