import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { ApiError } from "@/services/api/client";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { createDoctorShift, DoctorShift, fetchDoctorShifts } from "@/services/api/doctorsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const DOWS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const ROW = 36;
const DEFAULT_LOCATION = "Consultorio Propio";
const LOCATION_OPTIONS = [DEFAULT_LOCATION];

function parseTimeHours(t: string): number {
  const [hh, mm] = t.split(":").map((n) => Number(n));
  return hh + (mm || 0) / 60;
}

function ShiftBlock({ sh }: { sh: DoctorShift }) {
  const start = parseTimeHours(sh.start_time);
  const end = parseTimeHours(sh.end_time);
  const top = (start - HOURS[0]) * ROW;
  const h = Math.max(20, (end - start) * ROW - 4);
  const isOR = (sh.shift_type ?? "").toLowerCase().includes("quir") || (sh.shift_type ?? "").toLowerCase().includes("or");
  return (
    <View
      style={[
        styles.shiftBlock,
        {
          top: top + 2,
          height: h,
          backgroundColor: isOR ? colors.ink : colors.paper3,
          borderColor: isOR ? colors.ink : colors.accentRule
        }
      ]}
    >
      <Text style={[styles.shiftKind, { color: isOR ? colors.paper : colors.accentDeep }]}>
        {sh.shift_type ?? "Turno"}
      </Text>
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.shiftMeta, { color: isOR ? colors.paper : colors.accentDeep }]}>
        {sh.start_time.slice(0, 5)}–{sh.end_time.slice(0, 5)}
        {sh.location ? ` · ${sh.location}` : ""}
      </Text>
    </View>
  );
}

function totalHours(shifts: DoctorShift[]): number {
  return shifts.reduce((acc, s) => acc + (parseTimeHours(s.end_time) - parseTimeHours(s.start_time)), 0);
}

export function DocShiftsDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<DoctorShift[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const [fDay, setFDay] = useState(0);
  const [fStart, setFStart] = useState("09:00");
  const [fEnd, setFEnd] = useState("13:00");
  const [fType, setFType] = useState("Consulta");
  const [fLocation, setFLocation] = useState(DEFAULT_LOCATION);

  async function load() {
    try {
      const did = await getCurrentDoctorId();
      setDoctorId(did);
      const list = await fetchDoctorShifts(did);
      setShifts(list);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar tus turnos.");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetDraft() {
    setFDay(0);
    setFStart("09:00");
    setFEnd("13:00");
    setFType("Consulta");
    setFLocation(DEFAULT_LOCATION);
    setError(null);
  }

  async function handleCreate() {
    if (!doctorId) {
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const created = await createDoctorShift(doctorId, {
        day_of_week: fDay,
        start_time: fStart,
        end_time: fEnd,
        shift_type: fType,
        location: fLocation || DEFAULT_LOCATION,
        institution_id: null
      });
      setShifts((curr) => [...curr, created]);
      resetDraft();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Ya existe un turno con esos datos.");
      } else {
        setError(err instanceof Error ? err.message : "No pudimos crear el turno.");
      }
    } finally {
      setCreating(false);
    }
  }

  const stats: [string, string, string][] = [
    ["Horas / semana", String(Math.round(totalHours(shifts))), `${shifts.length} bloques`],
    ["Días activos", String(new Set(shifts.map((s) => s.day_of_week)).size), "de 7"],
    ["Ubicaciones", String(new Set(shifts.map((s) => s.location).filter(Boolean)).size), "registradas"],
    ["Tipos", String(new Set(shifts.map((s) => s.shift_type).filter(Boolean)).size), "diferentes"]
  ];

  const shiftsByDay: Record<number, DoctorShift[]> = {};
  shifts.forEach((s) => {
    const day = s.day_of_week;
    if (!shiftsByDay[day]) {
      shiftsByDay[day] = [];
    }
    shiftsByDay[day].push(s);
  });

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="doc-shifts"
      role="médico"
      roleBadge="Médico"
      title="Turnos y horarios"
      eyebrow={`${shifts.length} turnos registrados`}
      searchPlaceholder="Buscar turno, consultorio…"
      topBarRight={
        <View style={styles.topActions}>
          <Button
            label="Cancelar"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            onPress={resetDraft}
            disabled={creating}
          />
          <Button
            label={creating ? "Creando…" : "Agregar turno"}
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="plus"
            onPress={handleCreate}
            disabled={creating}
          />
        </View>
      }
    >
      <FadeIn>
        <View style={styles.statRow}>
          {stats.map(([k, n, sub]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{k}</Text>
              <Text style={styles.statValue}>{n}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando turnos…</Text>
        </View>
      ) : (
        <>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.mainCols}>
          <View style={styles.gridCard}>
            <View style={styles.gridHead}>
              <Text style={styles.gridTitle}>Semana tipo</Text>
            </View>
            <View style={styles.gridBodyPad}>
              <View style={styles.dayHeaderRow}>
                <View style={styles.hourGutter} />
                {DOWS.map((d) => (
                  <View key={d} style={styles.dayHeaderCell}>
                    <Text style={styles.dowText}>{d}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.grid}>
                <View style={styles.hourColumn}>
                  {HOURS.map((h, i) => (
                    <View key={h} style={[styles.hourCell, i > 0 && styles.cellBorder]}>
                      <Text style={styles.hourText}>{h}:00</Text>
                    </View>
                  ))}
                </View>
                {DOWS.map((dow, ci) => (
                  <View key={dow} style={styles.dayColumn}>
                    {HOURS.map((h, i) => (
                      <View key={h} style={[styles.slotCell, i > 0 && styles.cellBorder]} />
                    ))}
                    {(shiftsByDay[ci] ?? []).map((sh) => (
                      <ShiftBlock key={sh.id} sh={sh} />
                    ))}
                  </View>
                ))}
              </View>

              {shifts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Sin turnos registrados</Text>
                </View>
              ) : null}

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.legendSwatchConsulta} />
                  <Text style={styles.legendText}>Consulta</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendSwatchOR} />
                  <Text style={styles.legendText}>Quirófano</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.panelCard}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>Nuevo turno</Text>
              <Text style={styles.panelEndpoint}>Asigna un nuevo turno a tu agenda</Text>
            </View>
            <View style={styles.panelBody}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tipo de turno</Text>
                <View style={styles.optRow}>
                  {["Consulta", "Quirófano", "Guardia"].map((o) => {
                    const active = o === fType;
                    return (
                      <Tappable key={o} onPress={() => setFType(o)} scaleTo={0.97}>
                        <View
                          style={[
                            styles.opt,
                            {
                              backgroundColor: active ? colors.ink : colors.white,
                              borderColor: active ? colors.ink : colors.rule
                            }
                          ]}
                        >
                          <Text style={[styles.optText, { color: active ? colors.paper : colors.ink2 }]}>{o}</Text>
                        </View>
                      </Tappable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Día de la semana</Text>
                <View style={styles.optRow}>
                  {DOWS.map((d, i) => {
                    const active = i === fDay;
                    return (
                      <Tappable key={d} onPress={() => setFDay(i)} scaleTo={0.97}>
                        <View
                          style={[
                            styles.opt,
                            {
                              backgroundColor: active ? colors.ink : colors.white,
                              borderColor: active ? colors.ink : colors.rule
                            }
                          ]}
                        >
                          <Text style={[styles.optText, { color: active ? colors.paper : colors.ink2 }]}>{d}</Text>
                        </View>
                      </Tappable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Inicio</Text>
                <View style={styles.fieldValueRow}>
                  <Text style={styles.fieldValue}>{fStart}</Text>
                  <View style={styles.timeBtns}>
                    {["08:00", "09:00", "13:00", "15:00"].map((t) => (
                      <Tappable key={t} onPress={() => setFStart(t)} scaleTo={0.95}>
                        <View style={[styles.optMini, fStart === t && styles.optMiniActive]}>
                          <Text style={[styles.optMiniText, fStart === t && styles.optMiniTextActive]}>{t}</Text>
                        </View>
                      </Tappable>
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fin</Text>
                <View style={styles.fieldValueRow}>
                  <Text style={styles.fieldValue}>{fEnd}</Text>
                  <View style={styles.timeBtns}>
                    {["12:00", "13:00", "17:00", "19:00"].map((t) => (
                      <Tappable key={t} onPress={() => setFEnd(t)} scaleTo={0.95}>
                        <View style={[styles.optMini, fEnd === t && styles.optMiniActive]}>
                          <Text style={[styles.optMiniText, fEnd === t && styles.optMiniTextActive]}>{t}</Text>
                        </View>
                      </Tappable>
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Ubicación</Text>
                <View style={styles.optRow}>
                  {LOCATION_OPTIONS.map((o) => {
                    const active = o === fLocation;
                    return (
                      <Tappable key={o} onPress={() => setFLocation(o)} scaleTo={0.97}>
                        <View
                          style={[
                            styles.opt,
                            {
                              backgroundColor: active ? colors.ink : colors.white,
                              borderColor: active ? colors.ink : colors.rule
                            }
                          ]}
                        >
                          <Text style={[styles.optText, { color: active ? colors.paper : colors.ink2 }]}>{o}</Text>
                        </View>
                      </Tappable>
                    );
                  })}
                </View>
              </View>
              <Tappable scaleTo={0.98} onPress={resetDraft} disabled={creating}>
                <View style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </View>
              </Tappable>
              <Tappable scaleTo={0.98} onPress={handleCreate} disabled={creating}>
                <View style={styles.createBtn}>
                  {creating ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Icon kind="plus" size={13} color={colors.white} />
                  )}
                  <Text style={styles.createBtnText}>Crear turno</Text>
                </View>
              </Tappable>
            </View>
          </View>
          </View>
        </>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.84,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 28
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  gridCard: {
    flexGrow: 1,
    flexBasis: 520,
    minWidth: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  gridHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  gridTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  gridBodyPad: {
    padding: 20
  },
  dayHeaderRow: {
    flexDirection: "row",
    marginBottom: 8
  },
  hourGutter: {
    width: 52
  },
  dayHeaderCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center"
  },
  dowText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  grid: {
    flexDirection: "row"
  },
  hourColumn: {
    width: 52
  },
  hourCell: {
    height: ROW,
    paddingTop: 2
  },
  cellBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  hourText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  dayColumn: {
    flex: 1,
    position: "relative",
    borderLeftWidth: 1,
    borderLeftColor: colors.rule3
  },
  slotCell: {
    height: ROW
  },
  shiftBlock: {
    position: "absolute",
    left: 4,
    right: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  shiftKind: {
    fontFamily: family.medium,
    fontSize: 11
  },
  shiftMeta: {
    fontFamily: family.mono,
    fontSize: 9.5,
    opacity: 0.7
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendSwatchConsulta: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule
  },
  legendSwatchOR: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.ink
  },
  legendText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  panelCard: {
    flexGrow: 0,
    flexBasis: 360,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  panelHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  panelEndpoint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  panelBody: {
    padding: 18,
    gap: 10
  },
  field: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  optRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6
  },
  opt: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1
  },
  optText: {
    fontFamily: family.regular,
    fontSize: 11
  },
  fieldValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 6
  },
  fieldValue: {
    fontFamily: family.mono,
    fontSize: 13,
    color: colors.ink
  },
  timeBtns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4
  },
  optMini: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  optMiniActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  optMiniText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink2
  },
  optMiniTextActive: {
    color: colors.paper
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  createBtnText: {
    fontFamily: family.medium,
    fontSize: 14.5,
    letterSpacing: -0.1,
    color: colors.white
  },
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  cancelBtnText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  emptyBox: {
    paddingTop: 18,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.alert
  }
});
