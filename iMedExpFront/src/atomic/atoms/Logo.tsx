import { SvgXml } from "react-native-svg";
import { colors } from "@/theme/tokens";
import { logoWordmarkXml } from "./logoWordmark";

type LogoProps = {
  height?: number;
  width?: number;
  color?: string;
};

export function Logo({ height = 28, width = Math.round(height * 2.4), color = colors.ink }: LogoProps) {
  const xml = logoWordmarkXml
    .split("__W__")
    .join(String(width))
    .split("__H__")
    .join(String(height))
    .split("__COLOR__")
    .join(color);
  return <SvgXml xml={xml} width={width} height={height} />;
}
