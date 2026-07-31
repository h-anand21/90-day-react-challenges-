/**
 * LanguageQualityRegistry — one source of truth for per-language quality.
 *
 * Every stage of the pipeline (transcript refinement, sentence splitting,
 * translation prompting, speech synthesis, playback locale) reads from this
 * registry so that no language is treated as second-class.
 *
 * The registry is *additive*: unlisted languages fall back to sensible
 * defaults derived from the Unicode script inferred from the language name.
 * Adding a new language means adding one entry — no code changes elsewhere.
 *
 * Contract per language:
 *   • bcp47                    — locale tag for STT hints, WebSpeech, i18n
 *   • nativeName               — how a native speaker names their language
 *   • fillers                  — filler tokens the refiner may strip
 *   • fillerPhrases            — multi-word fillers (RegExp)
 *   • sentenceSplitter         — RegExp that splits into sentences
 *   • terminalPunctuation      — used when appending a period
 *   • capitalizeSentences      — Latin/Greek/Cyrillic yes; CJK/Arabic no
 *   • localizationNote         — one-line hint appended to translator prompt
 *   • preferredVoices          — provider → voice id (best-effort per lang)
 */

export type LanguageQuality = {
  bcp47: string;
  nativeName: string;
  fillers: string[];
  fillerPhrases: RegExp[];
  sentenceSplitter: RegExp;
  terminalPunctuation: string;
  capitalizeSentences: boolean;
  localizationNote: string;
  preferredVoices: { openai?: string; elevenlabs?: string };
};

/* ---------------------------------------------------------------- helpers */

const LATIN_SPLIT = /(?<=[.!?…])\s+/g;
const CJK_SPLIT = /(?<=[。！？!?…])\s*/g;
const DEVA_SPLIT = /(?<=[।!?…])\s+/g;
const ARABIC_SPLIT = /(?<=[۔؟!?…])\s+/g;

const NO_FILLERS: string[] = [];
const NO_PHRASES: RegExp[] = [];

// Voice defaults: ElevenLabs `eleven_multilingual_v2` supports every listed
// language on any voice — we pick a widely-used, natural-sounding neutral
// voice by default. OpenAI TTS uses one polyglot voice per request; pick a
// warm, natural voice as the app-wide default.
const EL_DEFAULT = "EXAVITQu4vr4xnSDxMaL"; // Sarah — natural, multilingual
const OA_DEFAULT = "alloy";

/* ------------------------------------------------------------------ data */

const ENTRIES: Record<string, LanguageQuality> = {
  english: {
    bcp47: "en-US", nativeName: "English",
    fillers: ["um","umm","uh","uhh","erm","hmm","mm","mhm","like","actually","basically","literally","honestly","sorta","kinda"],
    fillerPhrases: [/\byou know\b,?\s*/gi, /\bi mean\b,?\s*/gi, /\bsort of\b,?\s*/gi, /\bkind of\b,?\s*/gi],
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural North-American English idioms; use contractions where a native speaker would.",
    preferredVoices: { openai: OA_DEFAULT, elevenlabs: EL_DEFAULT },
  },
  hindi: {
    bcp47: "hi-IN", nativeName: "हिन्दी",
    fillers: ["मतलब","यार","बस","हाँ","अच्छा","तो","फिर"],
    fillerPhrases: [/\bमतलब कि\b,?\s*/gi],
    sentenceSplitter: DEVA_SPLIT, terminalPunctuation: "।", capitalizeSentences: false,
    localizationNote: "Use conversational Hindi with Devanagari script. Prefer natural Hindi phrasing; keep widely used English loanwords (mobile, office, computer, meeting) in Devanagari transliteration only if the speaker used them.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  bengali: {
    bcp47: "bn-IN", nativeName: "বাংলা",
    fillers: ["মানে","হ্যাঁ","আচ্ছা","তো"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: DEVA_SPLIT, terminalPunctuation: "।", capitalizeSentences: false,
    localizationNote: "Use standard modern Bengali (Kolkata register) with Bengali script and natural Bangla sentence order (SOV).",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  tamil: {
    bcp47: "ta-IN", nativeName: "தமிழ்",
    fillers: ["அது","இது","சரி","அப்படி"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use standard written Tamil with Tamil script; avoid over-Sanskritized vocabulary.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  telugu: {
    bcp47: "te-IN", nativeName: "తెలుగు",
    fillers: ["అంటే","సరే","మరి"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use natural modern Telugu with Telugu script and native SOV word order.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  kannada: {
    bcp47: "kn-IN", nativeName: "ಕನ್ನಡ",
    fillers: ["ಅಂದ್ರೆ","ಸರಿ","ಹೌದು"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use standard modern Kannada with Kannada script and natural SOV phrasing.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  malayalam: {
    bcp47: "ml-IN", nativeName: "മലയാളം",
    fillers: ["അതായത്","ശരി","ഉം"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use standard modern Malayalam with Malayalam script and idiomatic Kerala usage.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  marathi: {
    bcp47: "mr-IN", nativeName: "मराठी",
    fillers: ["म्हणजे","बरं","हो"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: DEVA_SPLIT, terminalPunctuation: "।", capitalizeSentences: false,
    localizationNote: "Use standard modern Marathi (Pune register) with Devanagari script.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  gujarati: {
    bcp47: "gu-IN", nativeName: "ગુજરાતી",
    fillers: ["એટલે","બરાબર","હા"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use standard modern Gujarati with Gujarati script.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  punjabi: {
    bcp47: "pa-IN", nativeName: "ਪੰਜਾਬੀ",
    fillers: ["ਮਤਲਬ","ਹਾਂਜੀ","ਠੀਕ"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: DEVA_SPLIT, terminalPunctuation: "।", capitalizeSentences: false,
    localizationNote: "Use standard Punjabi in Gurmukhi script (Eastern Punjabi); keep it warm and conversational.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  urdu: {
    bcp47: "ur-PK", nativeName: "اُردُو",
    fillers: ["مطلب","اچھا","ہاں"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: ARABIC_SPLIT, terminalPunctuation: "۔", capitalizeSentences: false,
    localizationNote: "Use standard modern Urdu in Nastaliq/Arabic script with RTL flow; prefer everyday Urdu vocabulary over heavy Persianate diction.",
    preferredVoices: { openai: "onyx", elevenlabs: EL_DEFAULT },
  },
  arabic: {
    bcp47: "ar-SA", nativeName: "العربية",
    fillers: ["يعني","بس","طيب","والله"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: ARABIC_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use Modern Standard Arabic (فصحى) unless the source is clearly a dialect; keep RTL punctuation (، ؛ ؟).",
    preferredVoices: { openai: "onyx", elevenlabs: EL_DEFAULT },
  },
  french: {
    bcp47: "fr-FR", nativeName: "français",
    fillers: ["euh","ben","bah","genre","tu vois","enfin"], fillerPhrases: [/\btu vois\b,?\s*/gi],
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural métropolitain French; keep space before ; : ! ? and use « » for quotes.",
    preferredVoices: { openai: "shimmer", elevenlabs: EL_DEFAULT },
  },
  spanish: {
    bcp47: "es-ES", nativeName: "español",
    fillers: ["eh","este","o sea","pues","bueno"], fillerPhrases: [/\bo sea\b,?\s*/gi],
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use neutral international Spanish; add opening ¿ and ¡ where appropriate.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  german: {
    bcp47: "de-DE", nativeName: "Deutsch",
    fillers: ["äh","ähm","halt","also","quasi","irgendwie"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural Hochdeutsch; capitalize every noun; respect verb-second word order.",
    preferredVoices: { openai: "onyx", elevenlabs: EL_DEFAULT },
  },
  portuguese: {
    bcp47: "pt-BR", nativeName: "português",
    fillers: ["né","tipo","então","olha","eh"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural Brazilian Portuguese unless the source clearly signals European Portuguese.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  italian: {
    bcp47: "it-IT", nativeName: "italiano",
    fillers: ["ehm","cioè","tipo","insomma","boh"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural standard Italian.",
    preferredVoices: { openai: "shimmer", elevenlabs: EL_DEFAULT },
  },
  russian: {
    bcp47: "ru-RU", nativeName: "русский",
    fillers: ["ну","эээ","типа","короче","вот"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural modern Russian with correct case agreement and Cyrillic script.",
    preferredVoices: { openai: "onyx", elevenlabs: EL_DEFAULT },
  },
  japanese: {
    bcp47: "ja-JP", nativeName: "日本語",
    fillers: ["えっと","あの","なんか","まあ"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: CJK_SPLIT, terminalPunctuation: "。", capitalizeSentences: false,
    localizationNote: "Use natural modern Japanese with appropriate kanji/kana mix and「」quotation marks; default to polite です/ます register unless the source is clearly casual.",
    preferredVoices: { openai: "shimmer", elevenlabs: EL_DEFAULT },
  },
  korean: {
    bcp47: "ko-KR", nativeName: "한국어",
    fillers: ["음","어","그","저기"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: CJK_SPLIT, terminalPunctuation: ".", capitalizeSentences: false,
    localizationNote: "Use natural standard Korean in Hangul; default to polite -요/-습니다 register unless the source is clearly casual.",
    preferredVoices: { openai: "shimmer", elevenlabs: EL_DEFAULT },
  },
  chinese: {
    bcp47: "zh-CN", nativeName: "中文",
    fillers: ["那个","这个","嗯","呃","就是"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: CJK_SPLIT, terminalPunctuation: "。", capitalizeSentences: false,
    localizationNote: "Use simplified Chinese (Mandarin) with full-width punctuation (。， ！？) unless the source is clearly Traditional/Cantonese.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  thai: {
    bcp47: "th-TH", nativeName: "ไทย",
    fillers: ["คือ","แบบ","ประมาณ"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: "", capitalizeSentences: false,
    localizationNote: "Use natural modern Thai in Thai script; Thai does not use spaces between words — use spaces only between sentences.",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  vietnamese: {
    bcp47: "vi-VN", nativeName: "Tiếng Việt",
    fillers: ["à","ừ","thì","cái"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural modern Vietnamese with correct tone marks; northern (Hanoi) register by default.",
    preferredVoices: { openai: "shimmer", elevenlabs: EL_DEFAULT },
  },
  indonesian: {
    bcp47: "id-ID", nativeName: "Bahasa Indonesia",
    fillers: ["ya","kayak","gitu","sih","kan"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural Bahasa Indonesia (formal register).",
    preferredVoices: { openai: "nova", elevenlabs: EL_DEFAULT },
  },
  turkish: {
    bcp47: "tr-TR", nativeName: "Türkçe",
    fillers: ["ııı","şey","yani","işte"], fillerPhrases: NO_PHRASES,
    sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true,
    localizationNote: "Use natural modern Turkish with correct vowel harmony and İ/ı distinction.",
    preferredVoices: { openai: "shimmer", elevenlabs: EL_DEFAULT },
  },
};

/* -------------------------------------------------------------- fallback */

const SCRIPT_DEFAULTS: Record<string, Partial<LanguageQuality>> = {
  latin:      { sentenceSplitter: LATIN_SPLIT, terminalPunctuation: ".", capitalizeSentences: true },
  cjk:        { sentenceSplitter: CJK_SPLIT,   terminalPunctuation: "。", capitalizeSentences: false },
  devanagari: { sentenceSplitter: DEVA_SPLIT,  terminalPunctuation: "।", capitalizeSentences: false },
  arabic:     { sentenceSplitter: ARABIC_SPLIT,terminalPunctuation: "۔", capitalizeSentences: false },
};

function inferScriptDefaults(language: string): Partial<LanguageQuality> {
  const l = language.toLowerCase();
  if (/(chinese|mandarin|cantonese|japanese|korean)/.test(l)) return SCRIPT_DEFAULTS.cjk;
  if (/(hindi|marathi|nepali|sanskrit)/.test(l)) return SCRIPT_DEFAULTS.devanagari;
  if (/(arabic|urdu|persian|farsi|pashto|dari)/.test(l)) return SCRIPT_DEFAULTS.arabic;
  return SCRIPT_DEFAULTS.latin;
}

/* ------------------------------------------------------------------ API */

class LanguageQualityRegistryImpl {
  /** Return the quality profile for `language` (case-insensitive), or a
   *  script-inferred default so unlisted languages are never blocked. */
  get(language: string | null | undefined): LanguageQuality {
    const key = (language ?? "").trim().toLowerCase();
    const hit = ENTRIES[key];
    if (hit) return hit;
    const scriptDefaults = inferScriptDefaults(key);
    return {
      bcp47: key || "en-US",
      nativeName: language ?? "unknown",
      fillers: NO_FILLERS,
      fillerPhrases: NO_PHRASES,
      sentenceSplitter: scriptDefaults.sentenceSplitter ?? LATIN_SPLIT,
      terminalPunctuation: scriptDefaults.terminalPunctuation ?? ".",
      capitalizeSentences: scriptDefaults.capitalizeSentences ?? true,
      localizationNote: `Use natural, native-sounding ${language ?? "target-language"} that reads as if originally written by a native speaker.`,
      preferredVoices: { openai: OA_DEFAULT, elevenlabs: EL_DEFAULT },
    };
  }

  list(): string[] { return Object.keys(ENTRIES); }
}

export const LanguageQualityRegistry = new LanguageQualityRegistryImpl();
