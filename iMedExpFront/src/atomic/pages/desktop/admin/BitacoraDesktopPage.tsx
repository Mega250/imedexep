import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FormField } from "@/atomic/molecules/FormField";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { ApiError } from "@/services/api/client";
import {
  createPersonalLog,
  deletePersonalLog,
  fetchPersonalLogs,
  PersonalLogEntry,
  PersonalLogRole
} from "@/services/api/personalLogApi";
import { downloadCsv, toCsv } from "@/utils/downloadCsv";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type FieldId =
  | "control"
  | "nombre"
  | "edad"
  | "spo2"
  | "pulso"
  | "ta"
  | "temp"
  | "med"
  | "dosis"
  | "notas";

type FieldSpec = {
  id: FieldId;
  label: string;
  placeholder: string;
  required: boolean;
  width: number;
  keyboardType?: "default" | "number-pad";
};

const FIELD_SPECS: FieldSpec[] = [
  { id: "control", label: "No. de control", placeholder: "20240821", required: true, width: 1, keyboardType: "default" },
  { id: "nombre", label: "Nombre completo", placeholder: "Como aparece en INE", required: true, width: 2 },
  { id: "edad", label: "Edad", placeholder: "—", required: false, width: 1, keyboardType: "number-pad" },
  { id: "spo2", label: "SpO₂ (%)", placeholder: "97", required: true, width: 1, keyboardType: "number-pad" },
  { id: "pulso", label: "Pulso (lpm)", placeholder: "72", required: true, width: 1, keyboardType: "number-pad" },
  { id: "ta", label: "T/A (mmHg)", placeholder: "120/80", required: true, width: 1 },
  { id: "temp", label: "Temperatura (°C)", placeholder: "36.5", required: false, width: 1 },
  { id: "med", label: "Medicamento administrado", placeholder: "—", required: false, width: 2 },
  { id: "dosis", label: "Dosis", placeholder: "—", required: false, width: 1 },
  { id: "notas", label: "Notas / observaciones", placeholder: "—", required: false, width: 3 }
];

const FIELD_RULES: Partial<
  Record<FieldId, { pattern: RegExp; message: string; validate?: (value: string) => string | null }>
> = {
  control: {
    pattern: /^[A-Za-z0-9-]{3,24}$/,
    message: "No. de control debe usar 3 a 24 letras, números o guiones."
  },
  nombre: {
    pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'. -]{3,120}$/,
    message: "Nombre completo sólo admite letras, espacios, punto, apóstrofo y guiones."
  },
  edad: {
    pattern: /^(?:[1-9]\d?|1[01]\d|120)$/,
    message: "Edad debe ser un número entre 1 y 120."
  },
  spo2: {
    pattern: /^(?:[5-9]\d|100)$/,
    message: "SpO₂ debe estar entre 50 y 100."
  },
  pulso: {
    pattern: /^(?:[3-9]\d|1\d{2}|2[0-2]\d|230)$/,
    message: "Pulso debe estar entre 30 y 230 lpm."
  },
  ta: {
    pattern: /^\d{2,3}\/\d{2,3}$/,
    message: "T/A debe usar formato 120/80.",
    validate: (value) => {
      const [systolic, diastolic] = value.split("/").map((n) => Number(n));
      if (systolic < 50 || systolic > 260) {
        return "T/A sistólica debe estar entre 50 y 260 mmHg.";
      }
      if (diastolic < 30 || diastolic > 160) {
        return "T/A diastólica debe estar entre 30 y 160 mmHg.";
      }
      if (systolic <= diastolic) {
        return "T/A sistólica debe ser mayor que la diastólica.";
      }
      return null;
    }
  },
  temp: {
    pattern: /^(?:3[0-9]|4[0-5])(?:\.\d)?$/,
    message: "Temperatura debe estar entre 30.0 y 45.9 °C."
  }
};

const ROLES: { id: PersonalLogRole; label: string }[] = [
  { id: "estudiante", label: "Estudiante" },
  { id: "docente", label: "Docente" },
  { id: "admin", label: "Personal administrativo" }
];

type FilterId = "hoy" | "semana" | "mes" | "todo";
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
  { id: "todo", label: "Todo" }
];

function emptyForm(): Record<FieldId, string> {
  return FIELD_SPECS.reduce(
    (acc, f) => ({ ...acc, [f.id]: "" }),
    {} as Record<FieldId, string>
  );
}

function inRange(iso: string, filter: FilterId): boolean {
  const d = new Date(iso);
  const now = new Date();
  if (filter === "todo") return true;
  if (filter === "hoy") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (filter === "semana") {
    const diff = (now.getTime() - d.getTime()) / 86400000;
    return diff <= 7 && diff >= 0;
  }
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDateMx(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()];
  return `${dd} ${mon}`;
}

function validateLogForm(form: Record<FieldId, string>): string | null {
  for (const field of FIELD_SPECS) {
    const value = form[field.id].trim();
    if (field.required && !value) {
      return `${field.label} es obligatorio.`;
    }
    const rule = FIELD_RULES[field.id];
    if (value && rule) {
      if (!rule.pattern.test(value)) {
        return rule.message;
      }
      if (rule.validate) {
        const rangeError = rule.validate(value);
        if (rangeError) {
          return rangeError;
        }
      }
    }
  }
  return null;
}

export function BitacoraDesktopPage() {
  const [role, setRole] = useState<PersonalLogRole>("estudiante");
  const [form, setForm] = useState<Record<FieldId, string>>(emptyForm());
  const [entries, setEntries] = useState<PersonalLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("hoy");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchPersonalLogs();
        setEntries(list);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "No pudimos cargar la bitácora.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasContent = useMemo(
    () => Object.values(form).some((v) => v.trim().length > 0),
    [form]
  );

  const counts: Record<FilterId, number> = useMemo(() => {
    const result: Record<FilterId, number> = { hoy: 0, semana: 0, mes: 0, todo: 0 };
    for (const e of entries) {
      for (const f of FILTERS) {
        if (inRange(e.created_at, f.id)) result[f.id] += 1;
      }
    }
    return result;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter((e) => inRange(e.created_at, filter))
      .filter((e) => {
        if (!q) return true;
        const haystack = [
          e.fields.nombre,
          e.fields.control,
          e.fields.med,
          e.fields.notas
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [entries, filter, search]);

  async function handleSave() {
    if (saving || !hasContent) return;
    const validationError = validateLogForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    const cleaned: Record<string, string> = {};
    for (const k of Object.keys(form) as FieldId[]) {
      const v = form[k].trim();
      if (v) cleaned[k] = v;
    }
    try {
      const created = await createPersonalLog({ role, fields: cleaned });
      setEntries((curr) => [created, ...curr]);
      setForm(emptyForm());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos guardar el registro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePersonalLog(id);
      setEntries((curr) => curr.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos eliminar el registro.");
    }
  }

  function handleExport() {
    if (filteredEntries.length === 0) return;
    const rows: Record<string, string>[] = filteredEntries.map((e) => {
      const row: Record<string, string> = {
        fecha: new Date(e.created_at).toLocaleString("es-MX"),
        rol: e.role
      };
      for (const f of FIELD_SPECS) row[f.id] = e.fields[f.id] ?? "";
      return row;
    });
    const columns: { key: string; label: string }[] = [
      { key: "fecha", label: "Fecha" },
      { key: "rol", label: "Rol" },
      ...FIELD_SPECS.map((f) => ({ key: f.id as string, label: f.label }))
    ];
    const csv = toCsv(rows, columns);
    const dateLabel = new Date().toISOString().slice(0, 10);
    downloadCsv(`bitacora-${dateLabel}.csv`, csv);
  }

  const todayCount = counts.hoy;
  const totalCount = entries.length;
  const reqCount = FIELD_SPECS.filter((f) => f.required).length;
  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? role;

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="bitacora-pc"
      role="médico"
      roleBadge="Médico"
      title="Mi bitácora"
      eyebrow="Bitácora personal · sólo tú la ves"
      searchPlaceholder="Buscar en mis registros…"
      searchValue={search}
      onSearchChange={setSearch}
      topBarRight={
        <View style={styles.topBarActions}>
          <Button
            label="Exportar CSV"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="download"
            disabled={filteredEntries.length === 0}
            onPress={handleExport}
          />
          <Button
            label="Vista de impresión"
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="doc"
            onPress={() => goToScreen("bitacora-print")}
          />
        </View>
      }
    >
      <FadeIn>
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <View style={styles.heroRow}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>BB</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroEyebrow}>Bitácora habilitada · pantalla restringida</Text>
              <Text style={styles.heroName}>Mi bitácora personal</Text>
              <Text style={styles.heroMetaText}>
                Solo tú la ves. Cada registro se guarda en tu cuenta.
              </Text>
            </View>
            <View style={styles.heroStat}>
              <View style={styles.heroStatRow}>
                <Text style={styles.heroStatValue}>{todayCount}</Text>
                <Text style={styles.heroStatLabel}>registros hoy</Text>
              </View>
              <Text style={styles.heroStatSub}>
                {counts.semana} esta semana · {totalCount} total
              </Text>
            </View>
          </View>
        </View>
      </FadeIn>

      <View style={styles.selectorRow}>
        <Text style={styles.eyebrow}>Estoy registrando como</Text>
        <View style={styles.selectorTabs}>
          {ROLES.map((r) => {
            const on = role === r.id;
            return (
              <Tappable key={r.id} onPress={() => setRole(r.id)} scaleTo={0.97}>
                <View
                  style={[
                    styles.selectorTab,
                    {
                      backgroundColor: on ? colors.ink : colors.white,
                      borderColor: on ? colors.ink : colors.rule
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorTabText,
                      { color: on ? colors.paper : colors.ink2 }
                    ]}
                  >
                    {r.label}
                  </Text>
                  {on ? <Text style={styles.selectorTabActive}>activo</Text> : null}
                </View>
              </Tappable>
            );
          })}
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={styles.flexShrink}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              Nuevo registro · {roleLabel}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1} ellipsizeMode="tail">
              Fecha y hora se asignan automáticamente al guardar
            </Text>
          </View>
          <View style={styles.fieldCountBadge}>
            <Text style={styles.fieldCountText}>
              {FIELD_SPECS.length} CAMPOS · {reqCount} OBLIG.
            </Text>
          </View>
        </View>
        <View style={styles.formBody}>
          <View style={styles.fieldsGrid}>
            {FIELD_SPECS.map((f) => (
              <View
                key={f.id}
                style={[
                  styles.fieldCell,
                  { flexBasis: `${(f.width / 3) * 100}%` as `${number}%` }
                ]}
              >
                <FormField
                  label={`${f.label}${f.required ? " *" : ""}`}
                  placeholder={f.placeholder}
                  value={form[f.id]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.id]: v }))}
                  keyboardType={f.keyboardType}
                  autoCapitalize={f.id === "nombre" ? "words" : "sentences"}
                />
              </View>
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.formActions}>
            <Button
              label="Limpiar"
              variant="ghost"
              size="sm"
              block={false}
              height={36}
              disabled={!hasContent || saving}
              onPress={() => setForm(emptyForm())}
            />
            <Button
              label={saving ? "Guardando…" : "Guardar registro"}
              variant="accent"
              size="sm"
              block={false}
              height={36}
              iconLeft="check"
              disabled={!hasContent || saving}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.cardHeader}>
          <View style={styles.flexShrink}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              Mis registros
            </Text>
            <Text style={styles.cardSub} numberOfLines={1} ellipsizeMode="tail">
              {filteredEntries.length} entrada{filteredEntries.length === 1 ? "" : "s"} en este filtro
            </Text>
          </View>
          <View style={styles.tableHeaderActions}>
            {FILTERS.map((f) => (
              <Tappable key={f.id} onPress={() => setFilter(f.id)} scaleTo={0.95}>
                <Pill label={f.label} on={filter === f.id} count={counts[f.id]} />
              </Tappable>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accentDeep} />
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {search
                ? "Sin coincidencias para la búsqueda."
                : "Sin registros en este filtro."}
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInner}>
              <View style={styles.tableHead}>
                <Text style={[styles.tableHeadCell, styles.colHora]}>Hora</Text>
                <Text style={[styles.tableHeadCell, styles.colCtrl]}>No. ctrl</Text>
                <Text style={[styles.tableHeadCell, styles.colNombre]}>Nombre</Text>
                <Text style={[styles.tableHeadCell, styles.colEdad]}>Edad</Text>
                <Text style={[styles.tableHeadCell, styles.colSpo2]}>SpO₂</Text>
                <Text style={[styles.tableHeadCell, styles.colPulso]}>Pulso</Text>
                <Text style={[styles.tableHeadCell, styles.colTa]}>T/A</Text>
                <Text style={[styles.tableHeadCell, styles.colTemp]}>Temp</Text>
                <Text style={[styles.tableHeadCell, styles.colMed]}>Medicamento</Text>
                <Text style={[styles.tableHeadCell, styles.colDosis]}>Dosis</Text>
                <Text style={[styles.tableHeadCell, styles.colNotas]}>Notas</Text>
                <View style={styles.colMore} />
              </View>
              {filteredEntries.map((e, i) => {
                const dayLabel = inRange(e.created_at, "hoy")
                  ? formatTime(e.created_at)
                  : `${formatDateMx(e.created_at)} · ${formatTime(e.created_at)}`;
                return (
                  <View
                    key={e.id}
                    style={[
                      styles.tableRow,
                      { borderBottomWidth: i < filteredEntries.length - 1 ? 1 : 0 }
                    ]}
                  >
                    <Text style={[styles.cellHora, styles.colHora]}>{dayLabel}</Text>
                    <Text style={[styles.cellMono, styles.colCtrl]}>
                      {e.fields.control ?? "—"}
                    </Text>
                    <Text style={[styles.cellNombre, styles.colNombre]} numberOfLines={1} ellipsizeMode="tail">
                      {e.fields.nombre ?? "Sin nombre"}
                    </Text>
                    <Text style={[styles.cellMono, styles.colEdad]}>{e.fields.edad ?? "—"}</Text>
                    <Text style={[styles.cellMono, styles.colSpo2]}>
                      {e.fields.spo2 ? `${e.fields.spo2}%` : "—"}
                    </Text>
                    <Text style={[styles.cellMono, styles.colPulso]}>{e.fields.pulso ?? "—"}</Text>
                    <Text style={[styles.cellMono, styles.colTa]}>{e.fields.ta ?? "—"}</Text>
                    <Text style={[styles.cellMono, styles.colTemp]}>
                      {e.fields.temp ? `${e.fields.temp}°` : "—"}
                    </Text>
                    <Text style={[styles.cellText, styles.colMed]} numberOfLines={1} ellipsizeMode="tail">
                      {e.fields.med ?? "—"}
                    </Text>
                    <Text style={[styles.cellMonoSm, styles.colDosis]}>{e.fields.dosis ?? "—"}</Text>
                    <Text style={[styles.cellNotas, styles.colNotas]} numberOfLines={1}>
                      {e.fields.notas ?? "—"}
                    </Text>
                    <View style={styles.colMore}>
                      <Tappable onPress={() => handleDelete(e.id)} hitSlop={8} scaleTo={0.92}>
                        <Icon kind="trash" size={14} color={colors.alert} />
                      </Tappable>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topBarActions: { flexDirection: "row", gap: 10 },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    padding: 22,
    overflow: "hidden",
    ...shadow.card
  },
  heroBlob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.18)",
    top: -120,
    right: -80,
    pointerEvents: "none"
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: { fontFamily: family.serifItalic, fontSize: 22, color: colors.ink },
  heroInfo: { flex: 1, minWidth: 0 },
  heroEyebrow: { ...text.eyebrow, color: "rgba(255,255,255,0.6)" },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    color: colors.paper,
    marginTop: 6
  },
  heroMetaText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6
  },
  heroStat: { alignItems: "flex-end", gap: 4 },
  heroStatRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  heroStatValue: { fontFamily: family.serifItalic, fontSize: 36, color: colors.paper },
  heroStatLabel: { fontFamily: family.mono, fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroStatSub: { fontFamily: family.mono, fontSize: 10.5, color: "rgba(255,255,255,0.55)" },
  selectorRow: { marginTop: 18, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 },
  eyebrow: { ...text.eyebrow, color: colors.ink3 },
  selectorTabs: { flexDirection: "row", gap: 6 },
  selectorTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  selectorTabText: { fontFamily: family.medium, fontSize: 12.5 },
  selectorTabActive: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  formCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    gap: 12
  },
  flexShrink: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: family.medium, fontSize: 15, color: colors.ink },
  cardSub: { fontFamily: family.mono, fontSize: 10.5, color: colors.ink3, marginTop: 4 },
  fieldCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  fieldCountText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.accentDeep,
    letterSpacing: 0.8
  },
  formBody: { padding: 18, gap: 14 },
  fieldsGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  fieldCell: { paddingHorizontal: 6, paddingVertical: 6, minWidth: 200 },
  errorText: { fontFamily: family.mono, fontSize: 11, color: colors.alert },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  tableCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  tableHeaderActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  center: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontFamily: family.mono, fontSize: 11, color: colors.ink3 },
  tableInner: { minWidth: 1300 },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  tableHeadCell: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderBottomColor: colors.rule3
  },
  cellHora: { fontFamily: family.mono, fontSize: 11, color: colors.ink2 },
  cellMono: { fontFamily: family.mono, fontSize: 11.5, color: colors.ink },
  cellMonoSm: { fontFamily: family.mono, fontSize: 10.5, color: colors.ink2 },
  cellNombre: { fontFamily: family.medium, fontSize: 12.5, color: colors.ink },
  cellText: { fontFamily: family.regular, fontSize: 12, color: colors.ink2 },
  cellNotas: { fontFamily: family.regular, fontSize: 11.5, color: colors.ink3 },
  colHora: { width: 110 },
  colCtrl: { width: 110 },
  colNombre: { width: 200 },
  colEdad: { width: 60 },
  colSpo2: { width: 70 },
  colPulso: { width: 70 },
  colTa: { width: 90 },
  colTemp: { width: 70 },
  colMed: { width: 160 },
  colDosis: { width: 90 },
  colNotas: { width: 220 },
  colMore: { width: 40, alignItems: "flex-end" }
});
