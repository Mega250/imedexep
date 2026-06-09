import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Switch } from "@/atomic/atoms/Switch";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { fetchInstitution, updateInstitution } from "@/services/api/institutionsApi";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type Policy = [string, boolean, string];

const TABS = ["General", "Políticas"];

const DEFAULT_POLICIES: Policy[] = [
  [
    "Solicitar confirmación 24 h antes",
    true,
    "preferencia interna; no envía WhatsApp ni correo automáticamente"
  ],
  ["Permitir reagendar en línea", true, "hasta 4 h antes"],
  ["Receta electrónica obligatoria", true, "NOM-024 conformidad"],
  ["Compartir expediente con otras clínicas", false, "solo si el paciente lo autoriza"],
  ["Encuesta de satisfacción tras consulta", true, "CSAT corto - 1 pregunta"]
];

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function DirSettingsDesktopPage() {
  const [institutionId, setInstitutionId] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [policies, setPolicies] = useState<Policy[]>(DEFAULT_POLICIES);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    let alive = true;
    loadSession()
      .then(async (s) => {
        if (!alive) return;
        const nextInstitutionId = s.user?.institution_id ?? null;
        setInstitutionId(nextInstitutionId);
        setEmail(s.user?.email ?? "");
        if (!nextInstitutionId) return;
        const institution = await fetchInstitution(nextInstitutionId);
        if (!alive) return;
        setName(institution.name ?? "");
        setAddress(institution.address ?? "");
        setPhone(institution.phone ?? "");
        setPolicies(DEFAULT_POLICIES.map(([k, def, sub]) => [k, institution.policies?.[k] ?? def, sub]));
      })
      .catch((err) => {
        if (alive) setMessage(err instanceof Error ? err.message : "No se pudo cargar la institución.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const general: [string, string][] = [
    ["Institución", institutionId ? `ID ${institutionId}` : "-"],
    ["Correo administrador", email || "-"],
    ["Rol", "institution_admin"]
  ];

  async function handleSave() {
    if (!institutionId || saving) return;
    const phoneTrimmed = phone.trim();
    if (phoneTrimmed && phoneTrimmed.replace(/\D/g, "").length !== 10) {
      setMessage("El teléfono debe tener 10 dígitos.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateInstitution(institutionId, {
        name: name.trim(),
        address: address.trim() || null,
        phone: phoneTrimmed || null,
        policies: Object.fromEntries(policies.map(([key, enabled]) => [key, enabled]))
      });
      setName(updated.name ?? "");
      setAddress(updated.address ?? "");
      setPhone(updated.phone ?? "");
      setPolicies(DEFAULT_POLICIES.map(([k, def, sub]) => [k, updated.policies?.[k] ?? def, sub]));
      setMessage("Cambios guardados en la institución.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-settings"
      role="director"
      roleBadge="Director"
      title="Configuración de la clínica"
      eyebrow="Datos generales - políticas"
      topBarRight={
        <Button
          label={saving ? "Guardando..." : "Guardar cambios"}
          variant="primary"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          onPress={handleSave}
          disabled={saving || !institutionId}
        />
      }
    >
      <FadeIn>
        <View style={styles.tabRow}>
          {TABS.map((k) => {
            const on = activeTab === k;
            return (
              <Tappable
                key={k}
                onPress={() => setActiveTab(k)}
                accessibilityLabel={`Pestaña ${k}`}
                accessibilityState={{ selected: on }}
              >
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

      <View style={styles.cols}>
        <View style={styles.colLeft}>
          {activeTab === "General" ? (
          <FadeIn delay={80}>
            <PanelCard title="Datos generales">
              <View style={styles.generalGrid}>
                <View style={styles.fieldCell}>
                  <Text style={styles.fieldLabel}>Nombre</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Nombre de la clínica"
                    placeholderTextColor={colors.ink3}
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldCell}>
                  <Text style={styles.fieldLabel}>Teléfono</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Teléfono"
                    placeholderTextColor={colors.ink3}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldCellWide}>
                  <Text style={styles.fieldLabel}>Dirección</Text>
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Dirección de la clínica"
                    placeholderTextColor={colors.ink3}
                    style={styles.input}
                  />
                </View>
                {general.map(([k, v]) => (
                  <View key={k} style={styles.fieldCell}>
                    <Text style={styles.fieldLabel}>{k}</Text>
                    <Text style={styles.fieldValue}>{v}</Text>
                  </View>
                ))}
              </View>
            </PanelCard>
          </FadeIn>
          ) : null}

          {activeTab === "Políticas" ? (
          <FadeIn delay={140}>
            <PanelCard title="Políticas de la clínica">
              <View style={styles.rowList}>
                {policies.map(([k, on, sub], index) => (
                  <View key={k} style={styles.toggleRow}>
                    <View style={styles.flexShrink}>
                      <Text style={styles.toggleTitle}>{k}</Text>
                      <Text style={styles.toggleSub}>{sub}</Text>
                    </View>
                    <Switch
                      value={on}
                      onValueChange={(next) => {
                        setPolicies((prev) => prev.map((p, i) => (i === index ? [p[0], next, p[2]] : p)));
                      }}
                    />
                  </View>
                ))}
              </View>
            </PanelCard>
          </FadeIn>
          ) : null}
        </View>

        <View style={styles.colRight}>
          <FadeIn delay={260}>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Estado de guardado</Text>
              <Text style={styles.noticeMeta}>
                {message ?? "Los datos generales y las políticas se guardan en la base de datos de la institución."}
              </Text>
              <Button
                label={saving ? "Guardando..." : "Guardar ahora"}
                variant="ghost"
                size="sm"
                block={false}
                onPress={handleSave}
                disabled={saving || !institutionId}
                style={styles.noticeBtn}
              />
            </View>
          </FadeIn>
        </View>
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 18
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1
  },
  tabText: {
    fontFamily: family.medium,
    fontSize: 12.5
  },
  cols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  colLeft: {
    flexGrow: 1.3,
    flexBasis: 380,
    gap: 14
  },
  colRight: {
    flexGrow: 1,
    flexBasis: 320,
    gap: 14
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHead: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  flexShrink: {
    flex: 1,
    minWidth: 0
  },
  generalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 20
  },
  fieldCell: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  fieldCellWide: {
    flexBasis: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  fieldValue: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 4
  },
  input: {
    fontFamily: family.mono,
    fontSize: 13,
    color: colors.ink,
    marginTop: 5,
    paddingVertical: 0
  },
  rowList: {
    padding: 20,
    gap: 6
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  toggleTitle: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  toggleSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  noticeCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 20,
    gap: 6
  },
  noticeTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  noticeMeta: {
    ...text.eyebrow,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0,
    textTransform: "none"
  },
  noticeBtn: {
    marginTop: 10,
    alignSelf: "flex-start"
  }
});
