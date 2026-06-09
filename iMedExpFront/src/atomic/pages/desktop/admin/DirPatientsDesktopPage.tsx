import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Pagination } from "@/atomic/molecules/Pagination";
import { downloadCsv, toCsv } from "@/utils/downloadCsv";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const PAGE_SIZE = 25;

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function DirPatientsDesktopPage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchPatientsList({ page, limit: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setPatients(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (alive) setError("No pudimos cargar los pacientes.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page]);

  const withCity = (patients ?? []).filter((p) => p.city).length;
  const withBlood = (patients ?? []).filter((p) => p.blood_type).length;

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-patients"
      role="director"
      roleBadge="Director"
      title="Pacientes vinculados"
      eyebrow={`${total} expediente${total === 1 ? "" : "s"} en la institución`}
      topBarRight={
        <Button
          label="Exportar CSV"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="download"
          disabled={!patients || patients.length === 0}
          onPress={() => {
            if (!patients) return;
            const csv = toCsv(
              patients.map((p) => ({
                id: p.id,
                nombre: `${p.first_name} ${p.last_name}`,
                nacimiento: p.date_of_birth,
                genero: p.gender ?? "",
                sangre: p.blood_type ?? "",
                ciudad: p.city ?? "",
                estado: p.state ?? "",
                alta: new Date(p.created_at).toLocaleDateString("es-MX")
              })),
              [
                { key: "id", label: "ID" },
                { key: "nombre", label: "Paciente" },
                { key: "nacimiento", label: "Nacimiento" },
                { key: "genero", label: "Género" },
                { key: "sangre", label: "Sangre" },
                { key: "ciudad", label: "Ciudad" },
                { key: "estado", label: "Estado" },
                { key: "alta", label: "Alta" }
              ]
            );
            const date = new Date().toISOString().slice(0, 10);
            downloadCsv(`pacientes-${date}.csv`, csv);
          }}
        />
      }
    >
      <FadeIn>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Total</Text>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statSub}>en la clínica</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Con ciudad</Text>
            <Text style={styles.statValue}>{withCity}</Text>
            <Text style={styles.statSub}>geo identificada</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Tipo de sangre</Text>
            <Text style={styles.statValue}>{withBlood}</Text>
            <Text style={styles.statSub}>registrado</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Mostrando</Text>
            <Text style={styles.statValue}>{patients?.length ?? 0}</Text>
            <Text style={styles.statSub}>página {page}</Text>
          </View>
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !patients || patients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin pacientes vinculados</Text>
          <Text style={styles.emptyText}>Aparecerán cuando se registren en la institución.</Text>
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colPatient]}>Paciente</Text>
            <Text style={[styles.headCell, styles.colBlood]}>Sangre</Text>
            <Text style={[styles.headCell, styles.colCity]}>Ciudad</Text>
            <Text style={[styles.headCell, styles.colLast]}>Alta</Text>
            <View style={styles.colMore} />
          </View>
          {patients.map((p, i) => (
            <View
              key={p.id}
              style={[styles.tableRow, { borderBottomWidth: i < patients.length - 1 ? 1 : 0 }]}
            >
              <View style={[styles.colPatient, styles.patientCell]}>
                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>{initials(p.first_name, p.last_name)}</Text>
                </View>
                <View style={styles.flexShrink}>
                  <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{`${p.first_name} ${p.last_name}`}</Text>
                  <Text style={styles.patientMeta} numberOfLines={1} ellipsizeMode="tail">
                    {p.gender ?? "—"} · n. {new Date(p.date_of_birth).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.colBlood, styles.bloodText]} numberOfLines={1} ellipsizeMode="tail">{p.blood_type ?? "—"}</Text>
              <Text style={[styles.colCity, styles.drText]} numberOfLines={1} ellipsizeMode="tail">{p.city ?? "—"}</Text>
              <Text style={[styles.colLast, styles.lastText]} numberOfLines={1} ellipsizeMode="tail">
                {new Date(p.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.colMore}>
                <Icon kind="chev" size={14} color={colors.ink3} />
              </View>
            </View>
          ))}
        </View>
      )}

      {!error && total > 0 ? (
        <Pagination
          page={page}
          limit={PAGE_SIZE}
          total={total}
          onChange={setPage}
          disabled={loading}
        />
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
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
  tableCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 18
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  headCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomColor: colors.rule3
  },
  colPatient: {
    flexGrow: 2,
    flexBasis: 0,
    minWidth: 0
  },
  colBlood: {
    flexGrow: 0.6,
    flexBasis: 0,
    minWidth: 0
  },
  colCity: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colLast: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  patientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  patientName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  },
  drText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  bloodText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.accentDeep
  },
  lastText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3
  },
  center: {
    paddingVertical: 60,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingVertical: 24,
    textAlign: "center"
  },
  emptyCard: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  }
});
