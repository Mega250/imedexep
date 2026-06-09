import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/services/api/client";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { FormField } from "@/atomic/molecules/FormField";
import { SelectField } from "@/atomic/molecules/SelectField";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { superadminTabs } from "@/navigation/tabConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import {
  createInstitution,
  fetchInstitutions,
  Institution,
  InstitutionType
} from "@/services/api/institutionsApi";
import { setSelectedInstitutionId } from "@/state/selectedInstitution";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const TYPE_LABELS: Record<InstitutionType, string> = {
  private_clinic: "Clínica privada",
  hospital: "Hospital",
  school_dispensary: "Dispensario escolar"
};

const TYPE_VALUES: InstitutionType[] = ["private_clinic", "hospital", "school_dispensary"];

function typeFromLabel(label: string): InstitutionType {
  const found = TYPE_VALUES.find((v) => TYPE_LABELS[v] === label);
  return found ?? "private_clinic";
}

function initials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .filter((s) => s[0] && s[0] >= "A" && s[0] <= "Z")
    .slice(0, 2)
    .map((s) => s[0])
    .join("") || name.slice(0, 2).toUpperCase();
}

function Header({ total, active }: { total: number; active: number }): ReactNode {
  const filters: [string, number][] = [
    ["Todas", total],
    ["Activas", active],
    ["Inactivas", total - active]
  ];
  return (
    <>
      <ScreenTopBar
        sub={`${total} clínicas registradas`}
        title="Instituciones"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterBar}
      >
        {filters.map(([label, n], i) => (
          <Pill key={label} label={label} on={i === 0} count={n} />
        ))}
      </ScrollView>
    </>
  );
}

export function SAInstitutionsMobilePage() {
  const [list, setList] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [fType, setFType] = useState<InstitutionType>("private_clinic");
  const [fName, setFName] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function refetchList(): Promise<void> {
    const data = await fetchInstitutions();
    setList(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchInstitutions();
        if (!cancelled) {
          setList(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar instituciones.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm(): void {
    setFType("private_clinic");
    setFName("");
    setFAddress("");
    setFPhone("");
    setFormError(null);
  }

  async function handleCreate(): Promise<void> {
    if (busy) {
      return;
    }
    const trimmedName = fName.trim();
    if (trimmedName.length < 2) {
      setFormError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    setFormError(null);
    setBusy(true);
    try {
      await createInstitution({
        type: fType,
        name: trimmedName,
        address: fAddress.trim() ? fAddress.trim() : null,
        phone: fPhone.trim() ? fPhone.trim() : null,
        is_active: true
      });
      await refetchList();
      resetForm();
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No pudimos crear la institución.";
      setFormError(msg);
    } finally {
      setBusy(false);
    }
  }

  const active = list.filter((i) => i.is_active !== false).length;

  function openDetail(id: number): void {
    setSelectedInstitutionId(id);
    goToScreen("sa-inst-det-mob");
  }

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={superadminTabs} active={1} />}
      header={<Header total={list.length} active={active} />}
      floating={
        <FAB
          icon={showForm ? "x" : "plus"}
          label={showForm ? "Cerrar" : "Nueva"}
          onPress={() => {
            setFormError(null);
            setShowForm((v) => !v);
          }}
        />
      }
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {showForm ? (
        <FadeIn>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nueva institución</Text>
            <Text style={styles.formSub}>Crea una clínica, hospital o dispensario.</Text>
            <View style={styles.formStack}>
              <SelectField
                label="Tipo"
                value={TYPE_LABELS[fType]}
                options={TYPE_VALUES.map((v) => TYPE_LABELS[v])}
                onValueChange={(label) => setFType(typeFromLabel(label))}
              />
              <FormField
                label="Nombre"
                placeholder="Nombre legal"
                value={fName}
                onChangeText={setFName}
                hint="Mínimo 2 caracteres."
              />
              <FormField
                label="Dirección"
                placeholder="Calle, número, ciudad"
                value={fAddress}
                onChangeText={setFAddress}
              />
              <FormField
                label="Teléfono"
                placeholder="+52 …"
                keyboardType="phone-pad"
                value={fPhone}
                onChangeText={setFPhone}
              />
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}
              <Button
                label={busy ? "Creando…" : "Crear institución"}
                onPress={handleCreate}
                disabled={busy}
              />
              <Button
                label="Cancelar"
                variant="ghost"
                height={42}
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
              />
            </View>
          </View>
        </FadeIn>
      ) : null}

      {!loading && list.length === 0 && !error && !showForm ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin instituciones</Text>
          <Text style={styles.emptySub}>Crea la primera con el botón Nueva.</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {list.map((it, index) => {
          const inactive = it.is_active === false;
          return (
            <FadeIn key={it.id} delay={index * 40}>
              <Tappable
                style={[styles.row, { borderColor: colors.rule }]}
                onPress={() => openDetail(it.id)}
              >
                <Avatar
                  initials={initials(it.name)}
                  size={38}
                  radius={10}
                  bg={colors.ink}
                  fg={colors.paper}
                  serif
                  fontSize={14}
                />
                <View style={styles.flex}>
                  <Text style={styles.name} numberOfLines={1}>
                    {it.name}
                  </Text>
                  <Text style={styles.sub}>
                    {it.city ?? "—"} · id {it.id}
                  </Text>
                </View>
                {inactive ? (
                  <View style={[styles.stateTag, { backgroundColor: colors.alertSoft }]}>
                    <Text style={[styles.stateText, { color: colors.alert }]}>inactiva</Text>
                  </View>
                ) : (
                  <Icon kind="chev" size={14} color={colors.ink3} />
                )}
              </Tappable>
            </FadeIn>
          );
        })}
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14
  },
  formTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  formSub: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 4
  },
  formStack: {
    gap: 12,
    marginTop: 14
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 24,
    alignItems: "center"
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  filterBar: {
    backgroundColor: colors.paper
  },
  filters: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 6
  },
  list: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.lg
  },
  name: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  stateTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999
  },
  stateText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  }
});
