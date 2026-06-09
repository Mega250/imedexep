import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { FormField } from "@/atomic/molecules/FormField";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { superadminNav } from "@/navigation/desktopNavConfigs";
import { ApiError } from "@/services/api/client";
import {
  createInstitutionAdmin,
  fetchInstitution,
  fetchInstitutionAdmins,
  Institution,
  InstitutionAdmin,
  InstitutionUpdate,
  updateInstitution
} from "@/services/api/institutionsApi";
import { getSelectedInstitutionId } from "@/state/selectedInstitution";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function instInitials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .filter((s) => s[0] && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(s[0]))
    .slice(0, 2)
    .map((s) => s[0])
    .join("") || name.slice(0, 2).toUpperCase();
}

function adminInitials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .slice(-2)
    .map((s) => s[0] ?? "")
    .join("") || name.slice(0, 2).toUpperCase();
}

export function SAInstDetailDesktopPage() {
  const params = useLocalSearchParams<{ openAdminForm?: string }>();
  const selectedId = getSelectedInstitutionId();
  const [inst, setInst] = useState<Institution | null>(null);
  const [admins, setAdmins] = useState<InstitutionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminFullName] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRfc, setEditRfc] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function reloadInstitution() {
    if (selectedId === null) return;
    try {
      const i = await fetchInstitution(selectedId);
      setInst(i);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos refrescar la institución.");
    }
  }

  async function handleToggleActive() {
    if (selectedId === null || togglingActive || !inst) return;
    setTogglingActive(true);
    try {
      const next = await updateInstitution(selectedId, { is_active: !(inst.is_active !== false) });
      setInst(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar la institución.");
    } finally {
      setTogglingActive(false);
    }
  }

  function openEdit() {
    if (!inst) return;
    setEditName(inst.name ?? "");
    setEditAddress(inst.address ?? "");
    setEditPhone(inst.phone ?? "");
    setEditRfc(inst.rfc ?? "");
    setEditCity(inst.city ?? "");
    setEditState(inst.state ?? "");
    setEditEmail(inst.email ?? "");
    setEditError(null);
    setShowEdit(true);
  }

  async function handleSaveEdit() {
    if (selectedId === null || editBusy) return;
    if (editName.trim().length < 2) {
      setEditError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const trimmedPhone = editPhone.trim();
    if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone)) {
      setEditError("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }
    setEditError(null);
    setEditBusy(true);
    try {
      const payload: InstitutionUpdate & {
        rfc?: string | null;
        city?: string | null;
        state?: string | null;
        email?: string | null;
      } = {
        name: editName.trim(),
        address: editAddress.trim() || null,
        phone: trimmedPhone || null,
        rfc: editRfc.trim() || null,
        city: editCity.trim() || null,
        state: editState.trim() || null,
        email: editEmail.trim() || null
      };
      const next = await updateInstitution(selectedId, payload);
      setInst(next);
      setShowEdit(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setEditBusy(false);
    }
  }

  async function reloadAdmins() {
    if (selectedId === null) return;
    try {
      const adm = await fetchInstitutionAdmins(selectedId);
      setAdmins(Array.isArray(adm) ? adm : []);
    } catch {
      setAdmins([]);
    }
  }

  async function handleCreateAdmin() {
    if (selectedId === null || adminBusy) return;
    if (adminName.trim().length < 2) {
      setAdminError("Nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (adminPwd.length < 8) {
      setAdminError("Contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setAdminError(null);
    setAdminBusy(true);
    try {
      await createInstitutionAdmin(selectedId, {
        email: adminEmail.trim(),
        admin_name: adminName.trim(),
        password: adminPwd
      });
      setAdminEmail("");
      setAdminFullName("");
      setAdminPwd("");
      setShowAdminForm(false);
      await reloadAdmins();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No pudimos crear el administrador.";
      setAdminError(msg);
    } finally {
      setAdminBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (selectedId === null) {
      setError("Selecciona una institución desde el listado.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [i, adm] = await Promise.all([
          fetchInstitution(selectedId),
          fetchInstitutionAdmins(selectedId).catch(() => [] as InstitutionAdmin[])
        ]);
        if (!cancelled) {
          setInst(i);
          setAdmins(Array.isArray(adm) ? adm : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar la institución.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (params.openAdminForm === "1") {
      setShowAdminForm(true);
    }
  }, [params.openAdminForm]);

  const name = inst?.name ?? "—";
  const city = inst?.city ?? "—";
  const idLabel = inst?.id ?? selectedId ?? "—";
  const isActive = inst?.is_active !== false;
  const createdLabel = inst?.created_at ? inst.created_at.slice(0, 10) : "—";

  const STATS: [string, string, string][] = [
    ["Estado", isActive ? "Activa" : "Inactiva", `desde ${createdLabel}`],
    ["Admins", String(admins.length), "vinculados a la BD"],
    ["RFC", inst?.rfc ?? "—", "registro fiscal"],
    ["Teléfono", inst?.phone ?? "—", "contacto"],
    ["Correo", inst?.email ?? "—", "soporte"],
    ["Ciudad", city, inst?.state ?? "—"]
  ];

  const TABS: [string, boolean][] = [
    ["Resumen", true],
    ["Médicos", false],
    ["Pacientes", false],
    ["Secretarias", false],
    ["Auditoría", false]
  ];

  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="sa-inst-detail"
      role="superadmin · root"
      roleBadge="Superadmin"
      title={name}
      eyebrow={`id ${idLabel} · ${city}`}
      topBarRight={
        <View style={styles.topActions}>
          <Button
            label="Refrescar"
            iconLeft="arrow"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            onPress={reloadInstitution}
          />
          <Button
            label="Editar"
            iconLeft="edit"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            onPress={openEdit}
            disabled={!inst}
          />
          <Button
            label={togglingActive ? "Procesando…" : isActive ? "Pausar" : "Activar"}
            iconLeft={isActive ? "x" : "check"}
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            style={styles.dangerBtn}
            disabled={togglingActive}
            onPress={handleToggleActive}
          />
        </View>
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {showEdit ? (
        <FadeIn>
          <View style={styles.editCard}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Editar institución</Text>
              <Text style={styles.editSub}>
                Actualiza los datos fiscales y de contacto de la institución.
              </Text>
            </View>
            <View style={styles.editGrid}>
              <View style={styles.editCol}>
                <FormField
                  label="Nombre"
                  placeholder="Nombre legal"
                  value={editName}
                  onChangeText={setEditName}
                  hint="Mínimo 2 caracteres."
                />
              </View>
              <View style={styles.editCol}>
                <FormField
                  label="RFC"
                  placeholder="Registro fiscal"
                  autoCapitalize="characters"
                  value={editRfc}
                  onChangeText={setEditRfc}
                />
              </View>
              <View style={styles.editCol}>
                <FormField
                  label="Teléfono"
                  placeholder="+52 …"
                  keyboardType="phone-pad"
                  value={editPhone}
                  onChangeText={setEditPhone}
                />
              </View>
              <View style={styles.editCol}>
                <FormField
                  label="Correo"
                  placeholder="contacto@clinica.mx"
                  icon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={editEmail}
                  onChangeText={setEditEmail}
                />
              </View>
              <View style={styles.editCol}>
                <FormField
                  label="Ciudad"
                  placeholder="Ciudad"
                  value={editCity}
                  onChangeText={setEditCity}
                />
              </View>
              <View style={styles.editCol}>
                <FormField
                  label="Estado"
                  placeholder="Estado"
                  value={editState}
                  onChangeText={setEditState}
                />
              </View>
              <View style={styles.editColWide}>
                <FormField
                  label="Dirección"
                  placeholder="Calle, número"
                  value={editAddress}
                  onChangeText={setEditAddress}
                />
              </View>
            </View>
            {editError ? <Text style={styles.formError}>{editError}</Text> : null}
            <View style={styles.editActions}>
              <Button
                label="Cancelar"
                variant="ghost"
                size="sm"
                block={false}
                height={38}
                onPress={() => setShowEdit(false)}
              />
              <Button
                label={editBusy ? "Guardando…" : "Guardar cambios"}
                variant="accent"
                size="sm"
                block={false}
                height={38}
                iconLeft="check"
                disabled={editBusy}
                onPress={handleSaveEdit}
              />
            </View>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn>
        <View style={styles.hero}>
          <RadialBlob
            size={360}
            color={colors.accentBright}
            opacity={0.28}
            edge={70}
            style={{ top: -120, right: -80 }}
          />
          <View style={styles.heroInner}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{instInitials(name)}</Text>
            </View>
            <View style={styles.heroMid}>
              <Text style={styles.heroEyebrow}>Institución · superadmin</Text>
              <Text style={styles.heroName} numberOfLines={2}>
                {name}
              </Text>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMeta}>{city}</Text>
                <View style={styles.heroMetaSep} />
                <Text style={styles.heroMetaMono}>id {idLabel}</Text>
                <View style={styles.heroMetaSep} />
                <Text style={styles.heroMeta}>desde {createdLabel}</Text>
              </View>
            </View>
            <View style={styles.heroTags}>
              <View style={styles.heroTagBright}>
                <Text style={styles.heroTagBrightText}>
                  {isActive ? "ACTIVA" : "INACTIVA"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={80}>
        <View style={styles.statRow}>
          {STATS.map(([k, n, sub]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.statKey}>{k}</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {n}
              </Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <View style={styles.tabRow}>
        {TABS.map(([k, on]) => (
          <View
            key={k}
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
        ))}
      </View>

      <View style={styles.cols}>
        <View style={styles.colLeft}>
          <FadeIn delay={140}>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Administradores · {admins.length}</Text>
                <Button
                  label={showAdminForm ? "Cerrar" : "Nuevo"}
                  iconLeft={showAdminForm ? "x" : "plus"}
                  variant={showAdminForm ? "ghost" : "accent"}
                  size="sm"
                  block={false}
                  height={30}
                  onPress={() => {
                    setShowAdminForm((v) => !v);
                    setAdminError(null);
                  }}
                />
              </View>
              {showAdminForm ? (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Asignar nuevo administrador</Text>
                  <View style={styles.formStack}>
                    <FormField
                      label="Correo"
                      placeholder="admin@clinica.mx"
                      icon="mail"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={adminEmail}
                      onChangeText={setAdminEmail}
                    />
                    <FormField
                      label="Nombre completo"
                      placeholder="Nombre del director"
                      value={adminName}
                      onChangeText={setAdminFullName}
                      hint="Mínimo 2 caracteres."
                    />
                    <FormField
                      label="Contraseña"
                      placeholder="mínimo 8 caracteres"
                      icon="lock"
                      secureTextEntry
                      autoCapitalize="none"
                      value={adminPwd}
                      onChangeText={setAdminPwd}
                    />
                    {adminError ? <Text style={styles.formError}>{adminError}</Text> : null}
                    <Button
                      label={adminBusy ? "Creando…" : "Crear administrador"}
                      iconLeft="check"
                      onPress={handleCreateAdmin}
                      disabled={adminBusy}
                      height={42}
                    />
                  </View>
                </View>
              ) : null}
              {admins.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Sin administradores</Text>
                  <Text style={styles.emptySub}>Agrega el primero con el botón Nuevo.</Text>
                </View>
              ) : (
                admins.map((a, i) => {
                  const full = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || a.email || "—";
                  return (
                    <View
                      key={a.id}
                      style={[styles.adminRow, i < admins.length - 1 ? styles.rowBorder : null]}
                    >
                      <View style={styles.adminAvatar}>
                        <Text style={styles.adminAvatarText}>{adminInitials(full)}</Text>
                      </View>
                      <View style={styles.adminInfo}>
                        <View style={styles.adminNameRow}>
                          <Text style={styles.adminName} numberOfLines={1} ellipsizeMode="tail">{full}</Text>
                        </View>
                        <Text style={styles.adminSub} numberOfLines={1}>
                          {a.email ?? "—"} · {a.role ?? "admin"}
                        </Text>
                      </View>
                      <Icon kind="chev" size={14} color={colors.ink3} />
                    </View>
                  );
                })
              )}
            </View>
          </FadeIn>
        </View>

        <View style={styles.colRight}>
          <FadeIn delay={200}>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Médicos</Text>
                <Text style={styles.panelAction}>—</Text>
              </View>
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Sin métrica por institución</Text>
                <Text style={styles.emptySub}>
                  El listado de médicos se gestiona desde el panel de director.
                </Text>
              </View>
            </View>
          </FadeIn>
        </View>
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 14,
    marginBottom: 14
  },
  formTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  formStack: {
    gap: 12,
    marginTop: 12
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  editCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginBottom: 16,
    gap: 14
  },
  editHeader: {
    gap: 4
  },
  editTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  editSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  editGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  editCol: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 0
  },
  editColWide: {
    flexBasis: "100%",
    minWidth: 0
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 6
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
    textAlign: "center"
  },
  topActions: {
    flexDirection: "row",
    gap: 8
  },
  dangerBtn: {
    borderColor: colors.alertRule
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 30,
    paddingVertical: 26,
    overflow: "hidden",
    ...shadow.hero
  },
  heroInner: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap"
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 44,
    color: colors.ink
  },
  heroMid: {
    flex: 1,
    minWidth: 280
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.9,
    color: colors.paper,
    marginTop: 8
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 12
  },
  heroMeta: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.75)"
  },
  heroMetaMono: {
    fontFamily: family.mono,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.75)"
  },
  heroMetaSep: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  heroTags: {
    flexDirection: "row",
    gap: 6
  },
  heroTagBright: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.accentBright
  },
  heroTagBrightText: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.ink
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  statKey: {
    ...text.eyebrow,
    color: colors.ink3
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 24,
    letterSpacing: -0.9,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 30
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 18
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
    gap: 14,
    marginTop: 14
  },
  colLeft: {
    flexGrow: 1,
    flexBasis: "40%",
    minWidth: 320
  },
  colRight: {
    flexGrow: 1.4,
    flexBasis: "54%",
    minWidth: 340
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  panelAction: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  adminAvatar: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  adminAvatarText: {
    fontFamily: family.medium,
    fontSize: 11,
    color: colors.ink
  },
  adminInfo: {
    flex: 1,
    minWidth: 0
  },
  adminNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0
  },
  adminName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  adminSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  }
});
