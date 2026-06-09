import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FormField } from "@/atomic/molecules/FormField";
import { Section } from "@/atomic/molecules/Section";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { bitacoraTabs } from "@/navigation/tabConfigs";
import { ApiError } from "@/services/api/client";
import {
  createPersonalLog,
  deletePersonalLog,
  fetchPersonalLogs,
  PersonalLogEntry,
  PersonalLogRole
} from "@/services/api/personalLogApi";
import { printCurrentDocument } from "@/utils/downloadCsv";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const ROLES: { id: PersonalLogRole; label: string }[] = [
  { id: "estudiante", label: "Estudiante" },
  { id: "docente", label: "Docente" },
  { id: "admin", label: "Admin." }
];

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
  keyboardType?: "default" | "number-pad";
};

const FIELD_SPECS: FieldSpec[] = [
  { id: "control", label: "No. control", placeholder: "—", keyboardType: "default" },
  { id: "nombre", label: "Nombre", placeholder: "—" },
  { id: "edad", label: "Edad", placeholder: "—", keyboardType: "number-pad" },
  { id: "spo2", label: "SpO₂ (%)", placeholder: "—", keyboardType: "number-pad" },
  { id: "pulso", label: "Pulso (lpm)", placeholder: "—", keyboardType: "number-pad" },
  { id: "ta", label: "T/A (mmHg)", placeholder: "120/80" },
  { id: "temp", label: "Temperatura", placeholder: "36.5" },
  { id: "med", label: "Medicamento", placeholder: "—" },
  { id: "dosis", label: "Dosis", placeholder: "—" },
  { id: "notas", label: "Notas", placeholder: "—" }
];

const FIELD_RULES: Partial<Record<FieldId, { pattern: RegExp; message: string }>> = {
  control: {
    pattern: /^[A-Za-z0-9-]{3,24}$/,
    message: "No. control debe usar 3 a 24 letras, números o guiones."
  },
  nombre: {
    pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'. -]{3,120}$/,
    message: "Nombre sólo admite letras, espacios, punto, apóstrofo y guiones."
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
    message: "T/A debe usar formato 120/80."
  },
  temp: {
    pattern: /^(?:3[0-9]|4[0-5])(?:\.\d)?$/,
    message: "Temperatura debe estar entre 30.0 y 45.9 °C."
  }
};

function emptyForm(): Record<FieldId, string> {
  return FIELD_SPECS.reduce(
    (acc, f) => ({ ...acc, [f.id]: "" }),
    {} as Record<FieldId, string>
  );
}

function isToday(iso: string): boolean {
  const a = new Date(iso);
  const b = new Date();
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function validateLogForm(form: Record<FieldId, string>): string | null {
  for (const [fieldId, rule] of Object.entries(FIELD_RULES) as [FieldId, { pattern: RegExp; message: string }][]) {
    const value = form[fieldId].trim();
    if (value && !rule.pattern.test(value)) {
      return rule.message;
    }
  }
  return null;
}

export function DocBitacoraMobilePage() {
  const [role, setRole] = useState<PersonalLogRole>("estudiante");
  const [form, setForm] = useState<Record<FieldId, string>>(emptyForm());
  const [entries, setEntries] = useState<PersonalLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    try {
      const list = await fetchPersonalLogs();
      setEntries(list);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos cargar la bitácora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const hasContent = useMemo(
    () => Object.values(form).some((v) => v.trim().length > 0),
    [form]
  );
  const todayEntries = useMemo(
    () => entries.filter((e) => isToday(e.created_at)),
    [entries]
  );

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

  function setField(id: FieldId, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={bitacoraTabs} active={4} />}
      header={
        <ScreenTopBar
          sub="Bitácora personal · sólo tú la ves"
          title="Mi bitácora"
          right={
            <Button
              label="Imprimir"
              variant="ghost"
              size="sm"
              block={false}
              height={30}
              iconLeft="doc"
              onPress={printCurrentDocument}
            />
          }
        />
      }
      contentStyle={styles.content}
    >
      <FadeIn>
        <DarkPanel radius={radii.lg} padding={16} blobSize={220} blobTop={-80} blobRight={-50}>
          <View style={styles.idRow}>
            <Avatar
              initials="··"
              size={44}
              radius={12}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={18}
            />
            <View style={styles.flex}>
              <Text style={styles.idName}>Bitácora personal</Text>
              <Text style={styles.idMeta}>guardada en tu cuenta, visible sólo para ti</Text>
            </View>
            <View style={styles.idCount}>
              <Text style={styles.idCountNum}>{todayEntries.length}</Text>
              <Text style={styles.idCountLabel}>hoy</Text>
            </View>
          </View>
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={70}>
        <Text style={styles.regAsLabel}>Registrando como</Text>
        <View style={styles.pillRow}>
          {ROLES.map((r) => (
            <Tappable key={r.id} onPress={() => setRole(r.id)} scaleTo={0.95}>
              <Pill label={r.label} on={role === r.id} />
            </Tappable>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <Section title="Nuevo registro">
          <Card radius={radii.lg} style={styles.formCard}>
            <View style={styles.fields}>
              {FIELD_SPECS.map((spec) => (
                <FormField
                  key={spec.id}
                  label={spec.label}
                  placeholder={spec.placeholder}
                  value={form[spec.id]}
                  onChangeText={(v) => setField(spec.id, v)}
                  keyboardType={spec.keyboardType}
                  autoCapitalize={spec.id === "nombre" ? "words" : "sentences"}
                />
              ))}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button
              label={saving ? "Guardando…" : "Guardar registro"}
              variant="accent"
              size="sm"
              height={40}
              disabled={!hasContent || saving}
              onPress={handleSave}
            />
          </Card>
        </Section>
      </FadeIn>

      <FadeIn delay={170}>
        <Section title={`Registros de hoy · ${todayEntries.length}`}>
          {loading ? (
            <View style={styles.entryEmpty}>
              <ActivityIndicator color={colors.accentDeep} />
            </View>
          ) : todayEntries.length === 0 ? (
            <View style={styles.entryEmpty}>
              <Text style={styles.entryEmptyText}>
                Sin registros aún. Llena el formulario y presiona Guardar.
              </Text>
            </View>
          ) : (
            <View style={styles.entryList}>
              {todayEntries.map((e) => {
                const roleLabel = ROLES.find((r) => r.id === e.role)?.label ?? e.role;
                const fieldEntries = Object.entries(e.fields).map(([id, value]) => ({
                  id,
                  label: FIELD_SPECS.find((s) => s.id === id)?.label ?? id,
                  value
                }));
                return (
                  <View key={e.id} style={styles.entryCard}>
                    <View style={styles.entryHead}>
                      <View style={styles.flex}>
                        <Text style={styles.entryTitle}>
                          {e.fields.nombre || "Sin nombre"}
                        </Text>
                        <Text style={styles.entryMeta}>
                          {formatTime(e.created_at)} · {roleLabel}
                        </Text>
                      </View>
                      <Tappable
                        onPress={() => handleDelete(e.id)}
                        hitSlop={8}
                        scaleTo={0.92}
                      >
                        <Icon kind="trash" size={14} color={colors.alert} />
                      </Tappable>
                    </View>
                    {fieldEntries.length > 0 ? (
                      <View style={styles.entryFields}>
                        {fieldEntries.map((f) => (
                          <View key={f.id} style={styles.entryFieldRow}>
                            <Text style={styles.entryFieldLabel}>{f.label}</Text>
                            <Text style={styles.entryFieldValue} numberOfLines={2}>
                              {f.value}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </Section>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  idName: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    color: colors.paper
  },
  idMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2
  },
  idCount: {
    alignItems: "flex-end"
  },
  idCountNum: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    color: colors.paper
  },
  idCountLabel: {
    fontFamily: family.mono,
    fontSize: 9,
    color: "rgba(255,255,255,0.6)"
  },
  regAsLabel: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.ink3,
    marginTop: 14
  },
  pillRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8
  },
  formCard: {
    padding: 14,
    gap: 10
  },
  fields: {
    gap: 10
  },
  errorText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 4
  },
  entryEmpty: {
    paddingHorizontal: 14,
    paddingVertical: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    alignItems: "center"
  },
  entryEmptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  },
  entryList: {
    gap: 8
  },
  entryCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  entryHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  entryTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  entryMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  entryFields: {
    marginTop: 10,
    gap: 4
  },
  entryFieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  entryFieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    width: 110
  },
  entryFieldValue: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink
  }
});
