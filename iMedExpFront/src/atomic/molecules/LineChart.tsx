import { View } from "react-native";
import Svg, { Circle, Polyline, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type DataPoint = { label: string; value: number };

type LineChartProps = {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
};

export function LineChart({
  data,
  width = 300,
  height = 140,
  color = colors.accentBright,
  showDots = true
}: LineChartProps) {
  if (data.length < 2) return null;
  const padL = 12;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + (1 - (d.value - min) / range) * chartH
  }));
  const points = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots &&
          pts.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
          ))}
        {data.map((d, i) => (
          <SvgText
            key={i}
            x={pts[i].x}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            fill={colors.ink3}
            fontFamily={family.mono}
          >
            {d.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
