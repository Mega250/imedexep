import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({ page, limit, total, onChange, disabled = false }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const firstItem = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const lastItem = Math.min(safePage * limit, total);

  const canPrev = !disabled && safePage > 1;
  const canNext = !disabled && safePage < totalPages;

  return (
    <View style={styles.row}>
      <Text style={styles.meta}>
        {total === 0
          ? "0 resultados"
          : `${firstItem}–${lastItem} de ${total}`}
      </Text>
      <View style={styles.controls}>
        <Tappable
          onPress={() => canPrev && onChange(safePage - 1)}
          scaleTo={0.95}
          disabled={!canPrev}
          style={[styles.btn, !canPrev && styles.btnDisabled]}
        >
          <Icon
            kind="chev-l"
            size={14}
            color={canPrev ? colors.ink : colors.ink3}
          />
        </Tappable>
        <Text style={styles.pageIndicator}>
          {safePage} / {totalPages}
        </Text>
        <Tappable
          onPress={() => canNext && onChange(safePage + 1)}
          scaleTo={0.95}
          disabled={!canNext}
          style={[styles.btn, !canNext && styles.btnDisabled]}
        >
          <Icon
            kind="chev"
            size={14}
            color={canNext ? colors.ink : colors.ink3}
          />
        </Tappable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 4
  },
  meta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  btnDisabled: {
    backgroundColor: colors.paper,
    borderColor: colors.rule2
  },
  pageIndicator: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2,
    minWidth: 50,
    textAlign: "center"
  }
});
