export const family = {
  thin: "Geist_100Thin",
  extralight: "Geist_200ExtraLight",
  light: "Geist_300Light",
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
  mono: "GeistMono_400Regular",
  monoMedium: "GeistMono_500Medium",
  serif: "InstrumentSerif_400Regular",
  serifItalic: "InstrumentSerif_400Regular_Italic"
} as const;

export const text = {
  eyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase" as const
  },
  mono: {
    fontFamily: family.mono,
    letterSpacing: -0.1
  },
  serif: {
    fontFamily: family.serifItalic
  }
};
