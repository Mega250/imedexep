import { ReactNode, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { Tappable } from "@/atomic/atoms/Tappable";
import { RecordField, RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { HistChips } from "@/atomic/organisms/HistChips";
import { PatientTabBar } from "@/atomic/organisms/PatientTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";

type ClinicalHistoryScreenProps<T> = {
  chipsActive: number;
  title: string;
  icon: IconKind;
  addLabel: string;
  emptyTitle: string;
  emptyNote: string;
  fields: RecordField[];
  fetchItems: () => Promise<T[]>;
  addItem: (values: Record<string, string>) => Promise<T>;
  removeItem: (id: number) => Promise<void>;
  idOf: (item: T) => number;
  titleOf: (item: T) => string;
  metaOf: (item: T) => string;
  extra?: ReactNode;
};

export function ClinicalHistoryScreen<T>({
  chipsActive,
  title,
  icon,
  addLabel,
  emptyTitle,
  emptyNote,
  fields,
  fetchItems,
  addItem,
  removeItem,
  idOf,
  titleOf,
  metaOf,
  extra
}: ClinicalHistoryScreenProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchItems());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar la información.");
    } finally {
      setLoading(false);
    }
  }, [fetchItems]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(values: Record<string, string>) {
    setSubmitting(true);
    setFormError(null);
    try {
      await addItem(values);
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function performDelete(id: number) {
    try {
      await removeItem(id);
      await load();
    } catch {
      setError("No pudimos eliminar el registro.");
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirmAction("Eliminar", "¿Seguro que quieres eliminarlo?", {
      confirmLabel: "Eliminar",
      destructive: true
    });
    if (ok) {
      performDelete(id);
    }
  }

  return (
    <MobileScreen
      tabBar={<PatientTabBar active={1} />}
      header={
        <>
          <ScreenTopBar
            sub="Mi historial"
            title={title}
            right={<RoundIconButton icon="plus" onPress={() => setOpen(true)} />}
          />
          <HistChips active={chipsActive} />
        </>
      }
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {extra}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : items.length === 0 ? (
        <FadeIn>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon kind={icon} size={18} color={colors.accentDeep} />
            </View>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyNote}>{emptyNote}</Text>
            <Button
              label={addLabel}
              variant="ghost"
              block={false}
              height={36}
              size="sm"
              iconLeft="plus"
              style={styles.emptyBtn}
              onPress={() => setOpen(true)}
            />
          </View>
        </FadeIn>
      ) : (
        <FadeIn>
          <View style={styles.list}>
            {items.map((item) => (
              <View key={idOf(item)} style={styles.itemCard}>
                <View style={styles.itemIcon}>
                  <Icon kind={icon} size={16} color={colors.accentDeep} />
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {titleOf(item)}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={2}>
                    {metaOf(item)}
                  </Text>
                </View>
                <Tappable
                  onPress={() => handleDelete(idOf(item))}
                  hitSlop={8}
                  style={styles.itemDelete}
                  accessibilityLabel={`Eliminar ${titleOf(item)}`}
                >
                  <Icon kind="trash" size={15} color={colors.ink3} />
                </Tappable>
              </View>
            ))}
            <Button
              label={addLabel}
              variant="ghost"
              block={false}
              height={40}
              size="sm"
              iconLeft="plus"
              style={styles.addMore}
              onPress={() => setOpen(true)}
            />
          </View>
        </FadeIn>
      )}

      <RecordFormModal
        visible={open}
        title={addLabel}
        fields={fields}
        submitting={submitting}
        error={formError}
        onClose={() => {
          setOpen(false);
          setFormError(null);
        }}
        onSubmit={handleSubmit}
      />
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 120
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 12
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 8
  },
  emptyBtn: {
    marginTop: 14
  },
  list: {
    gap: 10
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  itemBody: {
    flex: 1,
    minWidth: 0
  },
  itemTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  itemMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 3
  },
  itemDelete: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  addMore: {
    marginTop: 4,
    alignSelf: "flex-start"
  }
});
