export type Lang = { code: string; label: string; flag: string; bcp47: string };

// Output languages supported across the app (transcript + subtitles).
export const OUTPUT_LANGS: Lang[] = [
  { code: "English", label: "English", flag: "🇬🇧", bcp47: "en-US" },
  { code: "Hindi", label: "Hindi", flag: "🇮🇳", bcp47: "hi-IN" },
  { code: "Bengali", label: "Bengali", flag: "🇧🇩", bcp47: "bn-IN" },
  { code: "Tamil", label: "Tamil", flag: "🇮🇳", bcp47: "ta-IN" },
  { code: "Telugu", label: "Telugu", flag: "🇮🇳", bcp47: "te-IN" },
  { code: "Malayalam", label: "Malayalam", flag: "🇮🇳", bcp47: "ml-IN" },
  { code: "Marathi", label: "Marathi", flag: "🇮🇳", bcp47: "mr-IN" },
  { code: "Gujarati", label: "Gujarati", flag: "🇮🇳", bcp47: "gu-IN" },
  { code: "Punjabi", label: "Punjabi", flag: "🇮🇳", bcp47: "pa-IN" },
  { code: "Urdu", label: "Urdu", flag: "🇵🇰", bcp47: "ur-PK" },
  { code: "French", label: "French", flag: "🇫🇷", bcp47: "fr-FR" },
  { code: "German", label: "German", flag: "🇩🇪", bcp47: "de-DE" },
  { code: "Spanish", label: "Spanish", flag: "🇪🇸", bcp47: "es-ES" },
  { code: "Japanese", label: "Japanese", flag: "🇯🇵", bcp47: "ja-JP" },
];

export function labelFromBcp47(bcp47: string): string {
  try {
    const base = bcp47.split("-")[0];
    const dn = new (Intl as any).DisplayNames(["en"], { type: "language" });
    return dn.of(base) ?? bcp47;
  } catch {
    return bcp47;
  }
}
