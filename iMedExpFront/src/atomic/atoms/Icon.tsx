import { ReactNode } from "react";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";

export type IconKind =
  | "home"
  | "build"
  | "shield"
  | "shield-2"
  | "users"
  | "user"
  | "stetho"
  | "mail"
  | "inbox"
  | "link"
  | "plus"
  | "check"
  | "x"
  | "search"
  | "bell"
  | "arrow"
  | "arrow-l"
  | "chev"
  | "chev-l"
  | "chev-d"
  | "chev-u"
  | "more"
  | "edit"
  | "pen"
  | "trash"
  | "pin"
  | "phone"
  | "clock"
  | "cal"
  | "qr"
  | "heart"
  | "drop"
  | "flag"
  | "wave"
  | "chart"
  | "globe"
  | "doc"
  | "scan"
  | "send"
  | "briefcase"
  | "pill"
  | "copy"
  | "lab"
  | "lock"
  | "eye"
  | "menu"
  | "apple"
  | "android"
  | "folder"
  | "share"
  | "alert"
  | "lung"
  | "scale"
  | "spark"
  | "vax"
  | "cut"
  | "tree"
  | "download"
  | "logout"
  | "sun"
  | "flame"
  | "star"
  | "clip"
  | "rx"
  | "badge"
  | "filter"
  | "monitor"
  | "play";

type IconProps = {
  kind: IconKind;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

function paths(kind: IconKind, color: string): ReactNode {
  switch (kind) {
    case "home":
      return (
        <>
          <Path d="M4 11 L12 4 L20 11" />
          <Path d="M6 10 L6 20 L18 20 L18 10" />
        </>
      );
    case "build":
      return (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={1.5} />
          <Line x1={9} y1={4} x2={9} y2={20} />
          <Line x1={4} y1={9} x2={20} y2={9} />
          <Line x1={4} y1={14} x2={20} y2={14} />
        </>
      );
    case "shield":
      return (
        <>
          <Path d="M12 3 L20 6 V12 C20 16 16 19 12 21 C8 19 4 16 4 12 V6 Z" />
          <Path d="M9 12 L11 14 L15 10" />
        </>
      );
    case "shield-2":
      return (
        <>
          <Path d="M12 3 L19 6 V12 C19 16 16 19 12 21 C8 19 5 16 5 12 V6 Z" />
          <Circle cx={12} cy={11} r={2.2} />
        </>
      );
    case "users":
      return (
        <>
          <Circle cx={9} cy={9} r={3} />
          <Path d="M3 19 C3 16 6 14 9 14 C12 14 15 16 15 19" />
          <Circle cx={16} cy={8} r={2.5} />
          <Path d="M14 14 C18 14 21 16 21 19" />
        </>
      );
    case "user":
      return (
        <>
          <Circle cx={12} cy={8} r={3.5} />
          <Path d="M4 21 C4 17 8 14 12 14 C16 14 20 17 20 21" />
        </>
      );
    case "stetho":
      return (
        <>
          <Path d="M6 4 L6 11 A4 4 0 0 0 14 11 L14 4" />
          <Circle cx={17} cy={14} r={2} />
          <Path d="M10 15 L10 17 A4 4 0 0 0 17 16.5" />
        </>
      );
    case "mail":
      return (
        <>
          <Rect x={3.5} y={5.5} width={17} height={13} rx={1.5} />
          <Path d="M4 7 L12 13 L20 7" />
        </>
      );
    case "inbox":
      return (
        <>
          <Path d="M3 13 L8 13 L9.5 16 L14.5 16 L16 13 L21 13" />
          <Path d="M3 13 L6 5 L18 5 L21 13 L21 19 L3 19 Z" />
        </>
      );
    case "link":
      return (
        <>
          <Path d="M10 14 L14 10" />
          <Path d="M8 11 L6 13 A2.8 2.8 0 0 0 10 17 L12 15" />
          <Path d="M16 13 L18 11 A2.8 2.8 0 0 0 14 7 L12 9" />
        </>
      );
    case "plus":
      return (
        <>
          <Path d="M12 5 L12 19" />
          <Path d="M5 12 L19 12" />
        </>
      );
    case "check":
      return <Path d="M5 12 L10 17 L19 7" />;
    case "x":
      return (
        <>
          <Line x1={6} y1={6} x2={18} y2={18} />
          <Line x1={18} y1={6} x2={6} y2={18} />
        </>
      );
    case "search":
      return (
        <>
          <Circle cx={11} cy={11} r={6} />
          <Line x1={15.5} y1={15.5} x2={20} y2={20} />
        </>
      );
    case "bell":
      return (
        <>
          <Path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" />
          <Path d="M10 17 A2 2 0 0 0 14 17" />
        </>
      );
    case "arrow":
      return (
        <>
          <Path d="M5 12 L19 12" />
          <Path d="M14 7 L19 12 L14 17" />
        </>
      );
    case "arrow-l":
      return (
        <>
          <Path d="M19 12 L5 12" />
          <Path d="M10 7 L5 12 L10 17" />
        </>
      );
    case "chev":
      return <Path d="M9 6 L15 12 L9 18" />;
    case "chev-l":
      return <Path d="M15 6 L9 12 L15 18" />;
    case "chev-d":
      return <Path d="M6 9 L12 15 L18 9" />;
    case "chev-u":
      return <Path d="M6 15 L12 9 L18 15" />;
    case "more":
      return (
        <>
          <Circle cx={6} cy={12} r={1} fill={color} stroke="none" />
          <Circle cx={12} cy={12} r={1} fill={color} stroke="none" />
          <Circle cx={18} cy={12} r={1} fill={color} stroke="none" />
        </>
      );
    case "edit":
      return <Path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" />;
    case "pen":
      return (
        <>
          <Path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" />
          <Line x1={13} y1={7} x2={17} y2={11} />
        </>
      );
    case "trash":
      return (
        <>
          <Path d="M5 7 L19 7" />
          <Path d="M9 7 L9 4 L15 4 L15 7" />
          <Path d="M6 7 L7 20 L17 20 L18 7" />
          <Line x1={10} y1={11} x2={10} y2={17} />
          <Line x1={14} y1={11} x2={14} y2={17} />
        </>
      );
    case "pin":
      return (
        <>
          <Path d="M12 3 C8.5 3 6 5.5 6 9 C6 14 12 21 12 21 C12 21 18 14 18 9 C18 5.5 15.5 3 12 3 Z" />
          <Circle cx={12} cy={9} r={2.2} />
        </>
      );
    case "phone":
      return (
        <Path d="M5 4 L8 4 L10 9 L7.5 11 C8.5 13.5 10.5 15.5 13 16.5 L15 14 L20 16 L20 19 A2 2 0 0 1 18 21 C10.7 21 4 14.3 4 7 A2 2 0 0 1 5 4 Z" />
      );
    case "clock":
      return (
        <>
          <Circle cx={12} cy={12} r={8} />
          <Path d="M12 7 L12 12 L15 14" />
        </>
      );
    case "cal":
      return (
        <>
          <Rect x={3.5} y={5.5} width={17} height={15} rx={1.5} />
          <Line x1={3.5} y1={10} x2={20.5} y2={10} />
          <Line x1={8} y1={3} x2={8} y2={7} />
          <Line x1={16} y1={3} x2={16} y2={7} />
        </>
      );
    case "qr":
      return (
        <>
          <Rect x={4} y={4} width={6} height={6} />
          <Rect x={14} y={4} width={6} height={6} />
          <Rect x={4} y={14} width={6} height={6} />
          <Rect x={14} y={14} width={2} height={2} />
          <Rect x={18} y={14} width={2} height={2} />
          <Rect x={14} y={18} width={2} height={2} />
          <Rect x={18} y={18} width={2} height={2} />
        </>
      );
    case "heart":
      return <Path d="M12 19 L4.5 11.5 A4 4 0 0 1 12 7 A4 4 0 0 1 19.5 11.5 Z" />;
    case "drop":
      return <Path d="M12 3 C9 8 6 12 6 15 A6 6 0 0 0 18 15 C18 12 15 8 12 3 Z" />;
    case "flag":
      return <Path d="M5 21 L5 4 L15 4 L17 7 L15 11 L5 11" />;
    case "wave":
      return <Path d="M3 12 C5 8 7 16 9 12 C11 8 13 16 15 12 C17 8 19 16 21 12" />;
    case "chart":
      return (
        <>
          <Line x1={4} y1={20} x2={20} y2={20} />
          <Rect x={6} y={13} width={3} height={7} />
          <Rect x={11} y={9} width={3} height={11} />
          <Rect x={16} y={6} width={3} height={14} />
        </>
      );
    case "globe":
      return (
        <>
          <Circle cx={12} cy={12} r={8} />
          <Path d="M4 12 L20 12" />
          <Path d="M12 4 C15 7 15 17 12 20 C9 17 9 7 12 4" />
        </>
      );
    case "doc":
      return (
        <>
          <Path d="M6 3 L14 3 L18 7 L18 21 L6 21 Z" />
          <Path d="M14 3 L14 7 L18 7" />
          <Line x1={9} y1={12} x2={15} y2={12} />
          <Line x1={9} y1={15.5} x2={15} y2={15.5} />
        </>
      );
    case "scan":
      return (
        <>
          <Path d="M4 8 L4 4 L8 4" />
          <Path d="M20 8 L20 4 L16 4" />
          <Path d="M4 16 L4 20 L8 20" />
          <Path d="M20 16 L20 20 L16 20" />
          <Line x1={4} y1={12} x2={20} y2={12} />
        </>
      );
    case "send":
      return (
        <>
          <Path d="M21 4 L11 14" />
          <Path d="M21 4 L15 21 L11 14 L4 10 Z" />
        </>
      );
    case "briefcase":
      return (
        <>
          <Rect x={3} y={7} width={18} height={13} rx={1.5} />
          <Path d="M9 7 L9 5 A1 1 0 0 1 10 4 L14 4 A1 1 0 0 1 15 5 L15 7" />
          <Line x1={3} y1={13} x2={21} y2={13} />
        </>
      );
    case "pill":
      return (
        <G transform="rotate(-30 12 12)">
          <Rect x={3} y={9} width={18} height={6} rx={3} />
          <Line x1={9.5} y1={7.5} x2={14.5} y2={16.5} />
        </G>
      );
    case "copy":
      return (
        <>
          <Rect x={8} y={8} width={12} height={12} rx={1.5} />
          <Path d="M4 16 L4 4 L16 4" />
        </>
      );
    case "lab":
      return (
        <>
          <Path d="M9 3 L9 9 L4 19 A2 2 0 0 0 6 21 L18 21 A2 2 0 0 0 20 19 L15 9 L15 3" />
          <Line x1={8} y1={3} x2={16} y2={3} />
        </>
      );
    case "lock":
      return (
        <>
          <Rect x={5.5} y={11} width={13} height={8.5} rx={1} />
          <Path d="M8 11 L8 8 A4 4 0 0 1 16 8 L16 11" />
        </>
      );
    case "eye":
      return (
        <>
          <Path d="M2 12 C5 6 8 4 12 4 C16 4 19 6 22 12 C19 18 16 20 12 20 C8 20 5 18 2 12 Z" />
          <Circle cx={12} cy={12} r={3} />
        </>
      );
    case "menu":
      return (
        <>
          <Line x1={4} y1={7} x2={20} y2={7} />
          <Line x1={4} y1={12} x2={20} y2={12} />
          <Line x1={4} y1={17} x2={20} y2={17} />
        </>
      );
    case "apple":
      return (
        <>
          <Path d="M14 4 C13 5 12 6 12 7" />
          <Path d="M8 9 C6 9 4 11 4 14 C4 17 6 20 8 20 C9.5 20 10 19.5 11.5 19.5 C13 19.5 13.5 20 15 20 C17 20 19 17 19 14 C19 11 17 9 15 9 C13.5 9 13 9.5 11.5 9.5 C10 9.5 9.5 9 8 9 Z" />
        </>
      );
    case "android":
      return (
        <>
          <Path d="M5 11 L5 17 L19 17 L19 11" />
          <Path d="M7 11 A5 5 0 0 1 17 11" />
          <Circle cx={9} cy={9} r={0.6} fill={color} />
          <Circle cx={15} cy={9} r={0.6} fill={color} />
          <Line x1={6} y1={7} x2={8} y2={9} />
          <Line x1={18} y1={7} x2={16} y2={9} />
        </>
      );
    case "folder":
      return (
        <Path d="M3 7 A1.5 1.5 0 0 1 4.5 5.5 L9 5.5 L11 7.5 L19.5 7.5 A1.5 1.5 0 0 1 21 9 L21 18 A1.5 1.5 0 0 1 19.5 19.5 L4.5 19.5 A1.5 1.5 0 0 1 3 18 Z" />
      );
    case "share":
      return (
        <>
          <Circle cx={6} cy={12} r={2.2} />
          <Circle cx={18} cy={6} r={2.2} />
          <Circle cx={18} cy={18} r={2.2} />
          <Line x1={8} y1={11} x2={16} y2={7} />
          <Line x1={8} y1={13} x2={16} y2={17} />
        </>
      );
    case "alert":
      return (
        <>
          <Path d="M12 3 L22 20 L2 20 Z" />
          <Line x1={12} y1={9} x2={12} y2={14} />
          <Line x1={12} y1={17} x2={12} y2={17.5} />
        </>
      );
    case "lung":
      return (
        <>
          <Path d="M12 4 L12 14" />
          <Path d="M12 8 C12 12 9 16 6 18 C5 17 4 14 4 11 C4 8 6 6 7 6 C8 6 9 7 9 8" />
          <Path d="M12 8 C12 12 15 16 18 18 C19 17 20 14 20 11 C20 8 18 6 17 6 C16 6 15 7 15 8" />
        </>
      );
    case "scale":
      return (
        <>
          <Rect x={4} y={6} width={16} height={14} rx={2} />
          <Path d="M9 11 L15 11" />
          <Circle cx={12} cy={14} r={1.5} />
        </>
      );
    case "spark":
      return <Path d="M12 4 L13 10 L19 12 L13 14 L12 20 L11 14 L5 12 L11 10 Z" />;
    case "vax":
      return (
        <>
          <Path d="M14 4 L20 10" />
          <Path d="M9 9 L15 15" />
          <Path d="M16 6 L19 9" />
          <G transform="translate(0 -2)">
            <Path d="M3 21 L8 16 L8 14 L10 12 L14 16 L12 18 L10 18 L5 23 Z" />
          </G>
        </>
      );
    case "cut":
      return (
        <>
          <Circle cx={6} cy={6} r={2.5} />
          <Circle cx={6} cy={18} r={2.5} />
          <Line x1={8} y1={7.5} x2={20} y2={17} />
          <Line x1={8} y1={16.5} x2={20} y2={7} />
        </>
      );
    case "tree":
      return (
        <>
          <Circle cx={12} cy={5} r={2} />
          <Circle cx={6} cy={12} r={2} />
          <Circle cx={18} cy={12} r={2} />
          <Circle cx={9} cy={19} r={1.8} />
          <Circle cx={15} cy={19} r={1.8} />
          <Line x1={12} y1={7} x2={12} y2={10} />
          <Line x1={12} y1={10} x2={6} y2={10} />
          <Line x1={12} y1={10} x2={18} y2={10} />
          <Line x1={6} y1={14} x2={9} y2={17} />
          <Line x1={18} y1={14} x2={15} y2={17} />
        </>
      );
    case "download":
      return (
        <>
          <Path d="M12 4 L12 16" />
          <Path d="M7 11 L12 16 L17 11" />
          <Path d="M5 20 L19 20" />
        </>
      );
    case "logout":
      return (
        <>
          <Path d="M10 4 L4 4 L4 20 L10 20" />
          <Path d="M14 8 L18 12 L14 16" />
          <Line x1={9} y1={12} x2={18} y2={12} />
        </>
      );
    case "sun":
      return (
        <>
          <Circle cx={12} cy={12} r={4} />
          <Path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12 M4.5 4.5 L6 6 M18 18 L19.5 19.5 M4.5 19.5 L6 18 M18 6 L19.5 4.5" />
        </>
      );
    case "flame":
      return (
        <Path d="M12 3 C13 8 17 9 17 14 A5 5 0 0 1 7 14 C7 11 9 11 9 8 C10 9 10 10 11 10 C11 7 12 5 12 3 Z" />
      );
    case "star":
      return <Path d="M12 4 L14.5 9.5 L20 10 L16 14 L17 20 L12 17 L7 20 L8 14 L4 10 L9.5 9.5 Z" />;
    case "clip":
      return (
        <>
          <Rect x={6} y={4} width={12} height={17} rx={2} />
          <Rect x={9} y={2.5} width={6} height={3.5} rx={1} />
          <Line x1={9} y1={11} x2={15} y2={11} />
          <Line x1={9} y1={14.5} x2={15} y2={14.5} />
          <Line x1={9} y1={18} x2={13} y2={18} />
        </>
      );
    case "rx":
      return (
        <>
          <Path d="M7 4 L7 14" />
          <Path d="M7 4 L12 4 A3 3 0 0 1 12 10 L7 10" />
          <Path d="M10 10 L17 17" />
          <Path d="M14 14 L18 18" />
        </>
      );
    case "badge":
      return (
        <>
          <Circle cx={12} cy={9} r={4} />
          <Path d="M9 13 L8 21 L12 18 L16 21 L15 13" />
        </>
      );
    case "filter":
      return <Path d="M3 5 L21 5 L14 13 L14 20 L10 18 L10 13 Z" />;
    case "monitor":
      return (
        <>
          <Rect x={2} y={3} width={20} height={14} rx={2} />
          <Path d="M8 21 L16 21" />
          <Path d="M12 17 L12 21" />
        </>
      );
    case "play":
      return <Path d="M8 5 L19 12 L8 19 Z" />;
    default:
      return <Circle cx={12} cy={12} r={8} />;
  }
}

export function Icon({ kind, size = 18, color = "#03045E", strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths(kind, color)}
    </Svg>
  );
}
