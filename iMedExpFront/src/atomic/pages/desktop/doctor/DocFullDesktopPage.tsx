import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { fetchPatientFull, fetchPatientsList, fetchSocioeconomic, updatePatientAuthed, PatientFull, SocioeconomicData } from "@/services/api/patientsApi";
import { EditPatientSheet } from "@/atomic/molecules/EditPatientSheet";
import { PatientEditableValues, buildPatientUpdate, hasPatientChanges, valuesFromPatient } from "@/atomic/pages/doctor/patientEditForm";
import { getSelectedPatientId, setSelectedPatientId } from "@/services/api/selectedPatient";
import { printCurrentDocument } from "@/utils/downloadCsv";
import { formatDateLocal, parseDateLocal } from "@/utils/dates";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function computeAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function genderSym(g: string | null): string {
  if (!g) {
    return "";
  }
  const l = g.toLowerCase();
  if (l.startsWith("f") || l.startsWith("muj")) {
    return "♀";
  }
  if (l.startsWith("m") || l.startsWith("h") || l.startsWith("hom")) {
    return "♂";
  }
  return "";
}

function CardBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const TABS = ["Resumen", "Vitales", "Diagnósticos", "Cirugías", "Medicación", "Alergias", "Estudios"];

function EmptySection({ title, message }: { title: string; message: string }) {
  return (
    <CardBlock title={title}>
      <View style={styles.listBody}>
        <View style={styles.tile}>
          <Text style={styles.tileMono}>{message}</Text>
        </View>
      </View>
    </CardBlock>
  );
}

function DatosClinicosCard({ patient }: { patient: PatientFull }) {
  return (
    <CardBlock title="Datos clínicos">
      <View style={styles.listBody}>
        <View style={styles.tile}>
          <View style={styles.tileTopRow}>
            <Text style={styles.tileName}>Tipo sanguíneo</Text>
            <Text style={styles.tileYear}>—</Text>
          </View>
          <Text style={styles.tileMono}>{patient.blood_type ?? "sin registro"}</Text>
        </View>
        <View style={styles.tile}>
          <View style={styles.tileTopRow}>
            <Text style={styles.tileName}>IMC</Text>
            <Text style={styles.tileYear}>{patient.bmi ?? "—"}</Text>
          </View>
          <Text style={styles.tileMono}>
            {patient.weight_kg ? `${patient.weight_kg} kg` : "sin peso"}
            {patient.height_cm ? ` · ${(patient.height_cm / 100).toFixed(2)} m` : ""}
          </Text>
        </View>
        <View style={styles.tile}>
          <View style={styles.tileTopRow}>
            <Text style={styles.tileName}>Sensibilidad</Text>
          </View>
          <Text style={styles.tileMono}>nivel {patient.sensitivity_level}</Text>
        </View>
      </View>
    </CardBlock>
  );
}

function VitalesCard({ patient }: { patient: PatientFull }) {
  return (
    <CardBlock title="Signos vitales recientes">
      <View style={styles.listBody}>
        {patient.systolic_bp && patient.diastolic_bp ? (
          <View style={styles.tile}>
            <View style={styles.tileTopRow}>
              <Text style={styles.tileName}>Tensión arterial</Text>
              <Text style={styles.tileYear}>mmHg</Text>
            </View>
            <Text style={styles.tileMono}>{patient.systolic_bp} / {patient.diastolic_bp}</Text>
          </View>
        ) : null}
        {patient.heart_rate ? (
          <View style={styles.tile}>
            <View style={styles.tileTopRow}>
              <Text style={styles.tileName}>Frecuencia cardiaca</Text>
              <Text style={styles.tileYear}>lpm</Text>
            </View>
            <Text style={styles.tileMono}>{patient.heart_rate}</Text>
          </View>
        ) : null}
        {patient.temperature_celsius ? (
          <View style={styles.tile}>
            <View style={styles.tileTopRow}>
              <Text style={styles.tileName}>Temperatura</Text>
              <Text style={styles.tileYear}>°C</Text>
            </View>
            <Text style={styles.tileMono}>{patient.temperature_celsius}</Text>
          </View>
        ) : null}
        {patient.oxygen_saturation ? (
          <View style={styles.tile}>
            <View style={styles.tileTopRow}>
              <Text style={styles.tileName}>SpO₂</Text>
              <Text style={styles.tileYear}>%</Text>
            </View>
            <Text style={styles.tileMono}>{patient.oxygen_saturation}</Text>
          </View>
        ) : null}
        {!patient.systolic_bp && !patient.heart_rate && !patient.temperature_celsius && !patient.oxygen_saturation ? (
          <View style={styles.tile}>
            <Text style={styles.tileMono}>Sin tomas registradas</Text>
          </View>
        ) : null}
      </View>
    </CardBlock>
  );
}

function GlucosaCard({ patient }: { patient: PatientFull }) {
  return (
    <CardBlock title="Glucosa">
      <View style={styles.listBody}>
        <View style={styles.tile}>
          <View style={styles.tileTopRow}>
            <Text style={styles.tileName}>{patient.glucose_mg_dl ?? "—"} mg/dL</Text>
            <Text style={styles.tileYear}>{patient.glucose_risk ?? "sin clasif."}</Text>
          </View>
          <Text style={styles.tileMono}>
            {patient.glucose_mg_dl ? "última lectura" : "sin lecturas"}
          </Text>
        </View>
      </View>
    </CardBlock>
  );
}

function DireccionCard({ patient }: { patient: PatientFull }) {
  return (
    <CardBlock title="Dirección">
      <View style={styles.listBody}>
        <View style={styles.tile}>
          <Text style={styles.tileMono}>{patient.street_address ?? "—"}</Text>
          <Text style={styles.tileMonoSmall}>
            {patient.neighborhood ?? ""}
            {patient.postal_code ? ` · CP ${patient.postal_code}` : ""}
          </Text>
          <Text style={styles.tileMonoSmall}>
            {patient.city ?? "—"}
            {patient.state ? `, ${patient.state}` : ""}
          </Text>
        </View>
      </View>
    </CardBlock>
  );
}

function AdminCard({ patient }: { patient: PatientFull }) {
  const created = parseDateLocal(patient.created_at);
  const createdLabel = !created || created.getFullYear() <= 1970 ? "—" : formatDateLocal(patient.created_at);
  return (
    <CardBlock title="Datos administrativos">
      <View style={styles.listBody}>
        <View style={styles.tile}>
          <View style={styles.tileTopRow}>
            <Text style={styles.tileName}>ID</Text>
            <Text style={styles.tileYear}>#{patient.id}</Text>
          </View>
          <Text style={styles.tileMono}>creado {createdLabel}</Text>
        </View>
      </View>
    </CardBlock>
  );
}

function SocioeconomicCard({ soc }: { soc: SocioeconomicData | null }) {
  const rows = (
    [
      ["Drenaje", soc?.drainage],
      ["Agua potable", soc?.water],
      ["Electricidad", soc?.electricity],
      ["Personas en el hogar", soc?.household_members],
      ["Material p/cocinar", soc?.cooking_material],
      ["Método p/cocinar", soc?.cooking_method]
    ] as [string, string | null | undefined][]
  ).filter(([, v]) => v !== null && v !== undefined);

  return (
    <CardBlock title="Condiciones del hogar">
      <View style={styles.listBody}>
        {rows.length > 0 ? (
          rows.map(([key, value]) => (
            <View key={key} style={styles.tile}>
              <View style={styles.tileTopRow}>
                <Text style={styles.tileName}>{key}</Text>
              </View>
              <Text style={styles.tileMono}>{value}</Text>
            </View>
          ))
        ) : (
          <View style={styles.tile}>
            <Text style={styles.tileMono}>Pendiente · el médico capturará esta info en la primera consulta</Text>
          </View>
        )}
      </View>
    </CardBlock>
  );
}

function TabContent({ tab, patient, soc }: { tab: string; patient: PatientFull; soc: SocioeconomicData | null }) {
  if (tab === "Vitales") {
    return (
      <View style={styles.colGrid}>
        <View style={styles.col}>
          <VitalesCard patient={patient} />
        </View>
        <View style={styles.col}>
          <GlucosaCard patient={patient} />
        </View>
      </View>
    );
  }
  if (tab === "Diagnósticos") {
    return <EmptySection title="Diagnósticos" message="Sin diagnósticos registrados" />;
  }
  if (tab === "Cirugías") {
    return <EmptySection title="Cirugías" message="Sin cirugías registradas" />;
  }
  if (tab === "Medicación") {
    return <EmptySection title="Medicación" message="Sin medicación registrada" />;
  }
  if (tab === "Alergias") {
    return <EmptySection title="Alergias" message="Sin alergias registradas" />;
  }
  if (tab === "Estudios") {
    return <EmptySection title="Estudios" message="Sin estudios registrados" />;
  }
  return (
    <View style={styles.colGrid}>
      <View style={styles.col}>
        <DatosClinicosCard patient={patient} />
        <SocioeconomicCard soc={soc} />
      </View>
      <View style={styles.col}>
        <VitalesCard patient={patient} />
        <GlucosaCard patient={patient} />
      </View>
      <View style={styles.col}>
        <DireccionCard patient={patient} />
        <AdminCard patient={patient} />
      </View>
    </View>
  );
}

export function DocFullDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [soc, setSoc] = useState<SocioeconomicData | null>(null);
  const [activeTab, setActiveTab] = useState("Resumen");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const selectedId = await getSelectedPatientId();
        if (selectedId !== null) {
          try {
            const [selectedPatient, socData] = await Promise.all([
              fetchPatientFull(selectedId),
              fetchSocioeconomic(selectedId).catch(() => null)
            ]);
            if (cancelled) {
              return;
            }
            setPatient(selectedPatient);
            setSoc(socData);
            setLoading(false);
            return;
          } catch {
            void 0;
          }
        }
        const list = await fetchPatientsList({ page: 1, limit: 1 });
        if (list.items.length === 0) {
          if (!cancelled) {
            setError("No hay pacientes vinculados.");
            setLoading(false);
          }
          return;
        }
        const [p, socData] = await Promise.all([
          fetchPatientFull(list.items[0].id),
          fetchSocioeconomic(list.items[0].id).catch(() => null)
        ]);
        if (cancelled) {
          return;
        }
        setPatient(p);
        setSoc(socData);
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "No pudimos cargar el expediente.");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = patient ? `${patient.first_name} ${patient.last_name}`.trim() : "";

  async function handleSave(values: PatientEditableValues) {
    if (!patient) {
      return;
    }
    const update = buildPatientUpdate(valuesFromPatient(patient), values);
    if (!hasPatientChanges(update)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updatePatientAuthed(patient.id, update);
      const fresh = await fetchPatientFull(patient.id);
      setPatient(fresh);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-patients"
      role="médico"
      roleBadge="Médico"
      title={fullName ? `Expediente · ${fullName}` : "Expediente"}
      eyebrow="Expediente clínico completo"
      searchPlaceholder="Buscar dentro del expediente…"
      topBarRight={
        <View style={styles.topBarRight}>
          <Button
            label="Editar datos"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="edit"
            onPress={() => setEditing(true)}
            disabled={!patient}
          />
          <Button
            label="Imprimir / PDF"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="doc"
            onPress={printCurrentDocument}
          />
          <Button
            label="Empezar consulta"
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            onPress={async () => {
              if (patient) {
                await setSelectedPatientId(patient.id);
              }
              goToScreen("doctor-active");
            }}
          />
        </View>
      }
    >
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando expediente…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !patient ? null : (
        <>
          <FadeIn>
            <View style={styles.hero}>
              <View style={styles.heroBlob} />
              <View style={styles.heroRow}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>{initials(fullName)}</Text>
                </View>
                <View style={styles.heroIdentity}>
                  <Text style={styles.heroEyebrow}>Expediente clínico</Text>
                  <Text style={styles.heroName}>{fullName}</Text>
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.heroMeta}>
                      {genderSym(patient.gender)} {computeAge(patient.date_of_birth)} años
                      {patient.blood_type ? ` · ${patient.blood_type}` : ""}
                    </Text>
                    <View style={styles.heroMetaDivider} />
                    <Text style={styles.heroMetaMono}>id #{patient.id}</Text>
                    {patient.city ? (
                      <>
                        <View style={styles.heroMetaDivider} />
                        <Text style={styles.heroMeta}>{patient.city}{patient.state ? `, ${patient.state}` : ""}</Text>
                      </>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={60}>
            <View style={styles.tabs}>
              {TABS.map((k) => {
                const on = k === activeTab;
                return (
                  <Tappable key={k} scaleTo={0.97} onPress={() => setActiveTab(k)}>
                    <View
                      style={[
                        styles.tab,
                        {
                          backgroundColor: on ? colors.ink : colors.white,
                          borderColor: on ? colors.ink : colors.rule
                        }
                      ]}
                    >
                      <Text style={[styles.tabText, { color: on ? colors.paper : colors.ink2 }]}>{k}</Text>
                    </View>
                  </Tappable>
                );
              })}
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <TabContent tab={activeTab} patient={patient} soc={soc} />
          </FadeIn>
        </>
      )}
      {editing && patient ? (
        <EditPatientSheet
          visible
          initial={valuesFromPatient(patient)}
          submitting={saving}
          error={saveError}
          onClose={() => {
            setEditing(false);
            setSaveError(null);
          }}
          onSubmit={handleSave}
        />
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topBarRight: {
    flexDirection: "row",
    gap: 8
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 28,
    paddingVertical: 24,
    overflow: "hidden"
  },
  heroBlob: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.18)",
    top: -120,
    right: -90
  },
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 22
  },
  heroAvatar: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: {
    fontFamily: family.serif,
    fontSize: 38,
    color: colors.ink
  },
  heroIdentity: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 0
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serif,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.76,
    color: colors.paper,
    marginTop: 6
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10
  },
  heroMeta: {
    fontFamily: family.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)"
  },
  heroMetaMono: {
    fontFamily: family.mono,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)"
  },
  heroMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 18
  },
  tab: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  tabText: {
    fontFamily: family.medium,
    fontSize: 12
  },
  colGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14
  },
  col: {
    flexGrow: 1,
    flexBasis: 300,
    minWidth: 0,
    gap: 14
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    overflow: "hidden"
  },
  cardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  listBody: {
    padding: 14,
    gap: 6
  },
  tile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  tileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  tileName: {
    flexShrink: 1,
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  tileMono: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  tileMonoSmall: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  tileYear: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
