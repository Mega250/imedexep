import { colors } from "@/theme/tokens";
import { Icon, IconKind } from "./Icon";
import { Tappable } from "./Tappable";

type RoundIconButtonProps = {
  icon: IconKind;
  variant?: "ink" | "ghost";
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityExpanded?: boolean;
};

const DEFAULT_LABELS: Partial<Record<IconKind, string>> = {
  bell: "Notificaciones",
  edit: "Editar",
  menu: "Abrir menú",
  plus: "Agregar",
  search: "Buscar"
};

export function RoundIconButton({
  icon,
  variant = "ink",
  size = 44,
  onPress,
  accessibilityLabel,
  accessibilityExpanded
}: RoundIconButtonProps) {
  const ink = variant === "ink";
  return (
    <Tappable
      onPress={onPress}
      scaleTo={0.9}
      accessibilityLabel={accessibilityLabel ?? DEFAULT_LABELS[icon] ?? icon}
      accessibilityState={
        accessibilityExpanded === undefined ? undefined : { expanded: accessibilityExpanded }
      }
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: ink ? colors.ink : colors.white,
        borderWidth: ink ? 0 : 1,
        borderColor: colors.rule,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Icon kind={icon} size={18} color={ink ? colors.paper : colors.ink2} />
    </Tappable>
  );
}
