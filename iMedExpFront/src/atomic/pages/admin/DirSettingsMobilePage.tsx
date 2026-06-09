import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Pill } from "@/atomic/atoms/Pill";
import { Switch } from "@/atomic/atoms/Switch";
import { Tappable } from "@/atomic/atoms/Tappable";
import { Section } from "@/atomic/molecules/Section";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { fetchInstitution, updateInstitution } from "@/services/api/institutionsApi";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Policy = [string, boolean, string];

const DEFAULT_POLICIES: Policy[] = [
  [
    "Solicitar confirmación 24 h antes",
    true,
    "Preferencia interna; no envía WhatsApp ni correo automáticamente."
  ],
  ["Reagendar en línea", true, "Hasta 4 h antes."],
  ["Receta electrónica obligatoria", true, "Política interna de la clínica."],
  ["Compartir con otras clínicas", false, "Sólo con autorización del paciente."],
  ["Encuesta tras consulta", true, "Preferencia interna de seguimiento."]
];

const TABS = ["General", "Políticas"];

export function DirSettingsMobilePage() {
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

  const general: [string, string][] = [
    ["Institución", institutionId ? `ID ${institutionId}` : "-"],
    ["Correo administrador", email || "-"],
    ["Rol", "institution_admin"]
  ];

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Inicio"
          onBack={() => goBack("dir-dash-mob")}
          sub="Datos de la institución"
          title="Mi clínica"
        />
      }
      contentStyle={styles.content}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map((t) => (
          <Tappable
            key={t}
            onPress={() => setActiveTab(t)}
            accessibilityLabel={`Pestaña ${t}`}
            accessibilityState={{ selected: activeTab === t }}
          >
            <Pill label={t} on={activeTab === t} />
          </Tappable>
        ))}
      </ScrollView>

      {activeTab === "General" ? (
      <FadeIn>
        <Section title="Datos generales" action={saving ? "Guardando" : "Guardar"} onAction={handleSave}>
          <View style={styles.field}>
            <Text style={styles.fieldKey}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre de la clínica"
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldKey}>Teléfono</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Teléfono"
              placeholderTextColor={colors.ink3}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldKey}>Dirección</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Dirección"
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
          </View>
          {general.map(([k, v]) => (
            <View key={k} style={styles.field}>
              <Text style={styles.fieldKey}>{k}</Text>
              <Text style={styles.fieldValue}>{v}</Text>
            </View>
          ))}
        </Section>
      </FadeIn>
      ) : null}

      {activeTab === "Políticas" ? (
      <FadeIn delay={80}>
        <Section title="Políticas">
          {policies.map(([k, on, sub], index) => (
            <View key={k} style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.switchLabel}>{k}</Text>
                <Text style={styles.switchSub}>{sub}</Text>
              </View>
              <Switch
                value={on}
                onValueChange={(next) => {
                  setPolicies((prev) => prev.map((p, i) => (i === index ? [p[0], next, p[2]] : p)));
                }}
              />
            </View>
          ))}
        </Section>
      </FadeIn>
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FadeIn delay={140}>
        <Button
          label={saving ? "Guardando..." : "Guardar"}
          onPress={handleSave}
          disabled={saving || !institutionId}
          style={styles.saveBtn}
        />
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30
  },
  tabs: {
    gap: 6,
    paddingBottom: 4
  },
  field: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  fieldKey: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fieldValue: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink,
    marginTop: 3
  },
  input: {
    fontFamily: family.mono,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
    paddingVertical: 0
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  switchLabel: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink
  },
  switchCopy: {
    flex: 1,
    paddingRight: 12
  },
  switchSub: {
    fontFamily: family.mono,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.ink3,
    marginTop: 3
  },
  message: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 10
  },
  saveBtn: {
    marginTop: 16
  }
});
