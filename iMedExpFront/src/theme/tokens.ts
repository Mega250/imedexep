import { Platform } from "react-native";

export const colors = {
  paper: "#F1FAFE",
  paper2: "#E0F4FA",
  paper3: "#CAF0F8",
  paper4: "#ADE8F4",
  white: "#FFFFFF",

  ink: "#03045E",
  ink2: "#023E8A",
  ink3: "#0077B6",
  ink4: "#48CAE4",
  ink5: "#90E0EF",

  rule: "#BFE2EF",
  rule2: "#DDF0F6",
  rule3: "#ECF7FB",

  accent: "#0096C7",
  accentDeep: "#023E8A",
  accentInk: "#03045E",
  accentSoft: "#CAF0F8",
  accentRule: "#90E0EF",
  accentBright: "#00B4D8",

  alert: "#B83232",
  alertSoft: "#FBE9E8",
  alertRule: "#F1C3C0",

  ok: "#1C8C5A",
  okSoft: "#E5F5EE",
  okRule: "#BFE3CF",
  mid: "#C97A12",

  inkDeep: "#02022F"
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  page: 22
};

export const shadow = {
  card: Platform.select({
    web: { boxShadow: "0px 14px 24px rgba(3,4,94,0.12)" },
    default: {
      shadowColor: "#03045E",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6
    }
  }),
  soft: Platform.select({
    web: { boxShadow: "0px 8px 16px rgba(3,4,94,0.1)" },
    default: {
      shadowColor: "#03045E",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4
    }
  }),
  floating: Platform.select({
    web: { boxShadow: "0px 12px 20px rgba(3,4,94,0.3)" },
    default: {
      shadowColor: "#03045E",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10
    }
  }),
  hero: Platform.select({
    web: { boxShadow: "0px 18px 30px rgba(3,4,94,0.32)" },
    default: {
      shadowColor: "#03045E",
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.32,
      shadowRadius: 30,
      elevation: 12
    }
  })
};
