import { useRef } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";

let counter = 0;

type RadialBlobProps = {
  size: number;
  color: string;
  opacity?: number;
  edge?: number;
  style?: StyleProp<ViewStyle>;
};

export function RadialBlob({ size, color, opacity = 1, edge = 70, style }: RadialBlobProps) {
  const id = useRef(`blob${counter++}`).current;
  return (
    <View pointerEvents="none" style={[{ position: "absolute", opacity }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={1} />
            <Stop offset={`${edge}%`} stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
