import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { TextField } from "@/atomic/atoms/TextField";
import { colors, radii, shadow } from "@/theme/tokens";
import { family } from "@/theme/typography";

type DatePickerFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  valid?: boolean;
  errorText?: string | null;
  hint?: string;
  minYear?: number;
  maxYear?: number;
};

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DAYS = ["D", "L", "M", "M", "J", "V", "S"];

function parse(value: string): { d: number; m: number; y: number } | null {
  const trimmed = value.trim().replace(/\s+/g, "");
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }
  const d = Number(match[1]);
  const m = Number(match[2]);
  const y = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return null;
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }
  return { d, m, y };
}

function format(d: number, m: number, y: number): string {
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export function DatePickerField({
  label,
  placeholder = "dd / mm / aaaa",
  value,
  onChange,
  style,
  valid,
  errorText,
  hint,
  minYear = 1900,
  maxYear = new Date().getFullYear()
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "years">("days");

  const parsed = useMemo(() => parse(value), [value]);
  const today = useMemo(() => new Date(), []);

  const initialCursor = parsed
    ? { year: parsed.y, month: parsed.m - 1 }
    : { year: Math.min(maxYear, today.getFullYear() - 20), month: today.getMonth() };
  const [cursor, setCursor] = useState(initialCursor);

  useEffect(() => {
    if (open) {
      const p = parse(value);
      setCursor(
        p
          ? { year: p.y, month: p.m - 1 }
          : { year: Math.min(maxYear, today.getFullYear() - 20), month: today.getMonth() }
      );
      setView("days");
    }
  }, [open, value, maxYear, today]);

  function commit(d: number, m0: number, y: number) {
    onChange(format(d, m0 + 1, y));
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setCursor((c) => {
      let m = c.month + delta;
      let y = c.year;
      if (m < 0) {
        m = 11;
        y -= 1;
      } else if (m > 11) {
        m = 0;
        y += 1;
      }
      if (y < minYear) {
        y = minYear;
        m = 0;
      } else if (y > maxYear) {
        y = maxYear;
        m = 11;
      }
      return { year: y, month: m };
    });
  }

  const firstDow = new Date(cursor.year, cursor.month, 1).getDay();
  const totalDays = daysInMonth(cursor.year, cursor.month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDays; d += 1) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  function isFuture(y: number, m0: number, d: number): boolean {
    if (y > todayY) return true;
    if (y < todayY) return false;
    if (m0 > todayM) return true;
    if (m0 < todayM) return false;
    return d > todayD;
  }

  function isToday(y: number, m0: number, d: number): boolean {
    return y === todayY && m0 === todayM && d === todayD;
  }

  function isSelected(y: number, m0: number, d: number): boolean {
    return !!parsed && parsed.y === y && parsed.m - 1 === m0 && parsed.d === d;
  }

  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y -= 1) {
    years.push(y);
  }

  const calButton = (
    <Tappable
      onPress={() => setOpen(true)}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityLabel="Abrir calendario"
      style={styles.iconSlot}
    >
      <Icon kind="cal" size={16} color={colors.accentDeep} />
    </Tappable>
  );

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextField
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        rightSlot={
          errorText ? (
            calButton
          ) : valid ? (
            <View style={[styles.validBadge, { pointerEvents: "none" }]}>
              <Icon kind="check" size={14} color={colors.ok} strokeWidth={2.4} />
            </View>
          ) : (
            calButton
          )
        }
      />
      {errorText ? (
        <Text style={styles.error}>{errorText}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.eyebrow}>Fecha de nacimiento</Text>
                <Text style={styles.cardTitle}>
                  {parsed
                    ? `${parsed.d} ${MONTHS_SHORT[parsed.m - 1]} ${parsed.y}`
                    : "Selecciona una fecha"}
                </Text>
              </View>
              <Tappable
                onPress={() => setOpen(false)}
                scaleTo={0.9}
                hitSlop={10}
                style={styles.closeBtn}
              >
                <Icon kind="x" size={14} color={colors.ink2} />
              </Tappable>
            </View>

            <View style={styles.navRow}>
              <Tappable
                onPress={() => shiftMonth(-1)}
                scaleTo={0.92}
                style={styles.navBtn}
              >
                <Icon kind="chev-l" size={12} color={colors.ink2} />
              </Tappable>
              <Tappable
                onPress={() => setView((v) => (v === "days" ? "years" : "days"))}
                scaleTo={0.97}
                style={styles.monthBtn}
              >
                <Text style={styles.monthLabel}>
                  {MONTHS[cursor.month]} {cursor.year}
                </Text>
                <Icon kind="chev-d" size={11} color={colors.ink2} />
              </Tappable>
              <Tappable
                onPress={() => shiftMonth(1)}
                scaleTo={0.92}
                style={styles.navBtn}
              >
                <Icon kind="chev" size={12} color={colors.ink2} />
              </Tappable>
            </View>

            {view === "days" ? (
              <>
                <View style={styles.dowRow}>
                  {DAYS.map((d, i) => (
                    <Text key={i} style={styles.dowText}>
                      {d}
                    </Text>
                  ))}
                </View>
                <View style={styles.grid}>
                  {cells.map((cell, i) => {
                    if (cell === null) {
                      return <View key={`b${i}`} style={styles.cellSlot} />;
                    }
                    const future = isFuture(cursor.year, cursor.month, cell);
                    const isT = isToday(cursor.year, cursor.month, cell);
                    const isS = isSelected(cursor.year, cursor.month, cell);
                    return (
                      <View key={`d${i}`} style={styles.cellSlot}>
                        <Tappable
                          disabled={future}
                          onPress={() => commit(cell, cursor.month, cursor.year)}
                          scaleTo={future ? 1 : 0.92}
                          style={[
                            styles.cellInner,
                            isS && styles.cellSelected,
                            isT && !isS && styles.cellToday,
                            future && styles.cellDisabled
                          ]}
                        >
                          <Text
                            style={[
                              styles.cellText,
                              isS && styles.cellTextSelected,
                              future && styles.cellTextDisabled
                            ]}
                          >
                            {cell}
                          </Text>
                        </Tappable>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <ScrollView
                style={styles.yearScroll}
                contentContainerStyle={styles.yearGrid}
                showsVerticalScrollIndicator={false}
              >
                {years.map((y) => {
                  const selected = parsed?.y === y;
                  return (
                    <Tappable
                      key={y}
                      onPress={() => {
                        setCursor((c) => ({ ...c, year: y }));
                        setView("days");
                      }}
                      scaleTo={0.94}
                      style={[styles.yearChip, selected && styles.yearChipSelected]}
                    >
                      <Text
                        style={[styles.yearText, selected && styles.yearTextSelected]}
                      >
                        {y}
                      </Text>
                    </Tappable>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.footer}>
              <Tappable
                onPress={() => {
                  const y = todayY - 18;
                  setCursor({ year: y, month: todayM });
                  setView("days");
                }}
                scaleTo={0.96}
                style={styles.footerChip}
              >
                <Text style={styles.footerChipText}>18 años</Text>
              </Tappable>
              <Tappable
                onPress={() => {
                  const y = todayY - 30;
                  setCursor({ year: y, month: todayM });
                  setView("days");
                }}
                scaleTo={0.96}
                style={styles.footerChip}
              >
                <Text style={styles.footerChipText}>30 años</Text>
              </Tappable>
              <Tappable
                onPress={() => {
                  const y = todayY - 60;
                  setCursor({ year: y, month: todayM });
                  setView("days");
                }}
                scaleTo={0.96}
                style={styles.footerChip}
              >
                <Text style={styles.footerChipText}>60 años</Text>
              </Tappable>
              <View style={styles.footerSpacer} />
              <Tappable
                onPress={() => setOpen(false)}
                scaleTo={0.96}
                style={styles.footerDone}
              >
                <Text style={styles.footerDoneText}>Listo</Text>
              </Tappable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  hint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  error: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.alert
  },
  iconSlot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  validBadge: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: colors.okSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22
  },
  card: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "90%",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexShrink: 1,
    ...shadow.hero
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16
  },
  cardHeaderLeft: { flex: 1, gap: 4 },
  eyebrow: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.ink3,
    textTransform: "uppercase"
  },
  cardTitle: {
    fontFamily: family.serif,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: colors.ink
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    justifyContent: "center"
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  monthBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  monthLabel: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  dowRow: {
    flexDirection: "row",
    marginBottom: 4
  },
  dowText: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    textAlign: "center",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  cellSlot: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2
  },
  cellInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  cellSelected: { backgroundColor: colors.accent },
  cellToday: {
    borderWidth: 1,
    borderColor: colors.accent
  },
  cellDisabled: { opacity: 0.35 },
  cellText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  cellTextSelected: {
    fontFamily: family.medium,
    color: "#FFFFFF"
  },
  cellTextDisabled: {
    color: colors.ink3
  },
  yearScroll: {
    maxHeight: 240
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 4
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    minWidth: 64,
    alignItems: "center"
  },
  yearChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  yearText: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink
  },
  yearTextSelected: {
    color: "#FFFFFF"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  footerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.paper2
  },
  footerChipText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink2,
    letterSpacing: 0.4
  },
  footerSpacer: { flex: 1 },
  footerDone: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.ink
  },
  footerDoneText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.paper
  }
});
