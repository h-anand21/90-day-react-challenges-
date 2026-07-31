/**
 * NativeStyleLibrary — per-language discourse markers, register cues, native
 * word-order, prosody/punctuation, and idiom-swap guidance used by the
 * Natural Speech Reformulation layer.
 *
 * The interpret prompt pulls a compact style card from this library at
 * request time so the model receives concrete, native reference material
 * for {TARGET} instead of relying only on generic instructions.
 *
 * Adding a new language = one entry here. Unlisted languages get a
 * script-inferred fallback that still enforces "sound native".
 */

export type RegisterKey = "casual" | "polite" | "formal";

export type DiscourseMap = {
  /** "well", "so", opening softener at the start of a turn. */
  well?: string[];
  /** "you know", "I mean", mid-utterance rephrase / hedge. */
  youKnow?: string[];
  /** "actually", correction / contrast opener. */
  actually?: string[];
  /** "like", vague-example / approximator. */
  like?: string[];
  /** "um / uh", genuine hesitation (only if the target has natural ones). */
  hesitation?: string[];
  /** Agreement / backchannel ("right", "yeah", "okay"). */
  agree?: string[];
};

export type NativeStyle = {
  /** Human name used for prompt readability (matches registry key). */
  language: string;
  /** Grammar/word-order note: how a native speaker ORDERS information. */
  wordOrder: string;
  /** How pauses & breath points work in this language. */
  prosody: string;
  /** Punctuation conventions native writers use for spoken text. */
  punctuation: string;
  /** Discourse markers keyed by function. */
  discourse: DiscourseMap;
  /** Register examples: how the same idea sounds across politeness levels. */
  registerExamples?: Partial<Record<RegisterKey, string>>;
  /** Idiom / phrase swaps: source-flavored → native-flavored. */
  idiomSwaps?: Array<{ from: string; to: string; note?: string }>;
  /** Source-language habits to actively AVOID producing. */
  avoid: string[];
};

/* ------------------------------------------------------------------ data */

const ENTRIES: Record<string, NativeStyle> = {
  english: {
    language: "English",
    wordOrder: "SVO. Front-load the point; keep clauses short in speech.",
    prosody: "Breath after clauses; light pause before contrast ('but', 'so').",
    punctuation: "Standard ASCII. Use em-dashes for asides.",
    discourse: {
      well: ["well,", "so,", "look,"],
      youKnow: ["you know,", "I mean,"],
      actually: ["actually,", "honestly,"],
      like: ["like,"],
      hesitation: ["um", "uh"],
      agree: ["right", "yeah", "okay"],
    },
    registerExamples: {
      casual: "yeah, I think we're good.",
      polite: "I think we're all set.",
      formal: "I believe we are prepared to proceed.",
    },
    avoid: ["awkward calques from other languages", "over-formal phrasing in casual speech"],
  },

  bengali: {
    language: "Bengali",
    wordOrder:
      "SOV. Verb LAST. Topic first, then details, then verb. Do NOT keep English SVO order.",
    prosody:
      "Natural breath before the final verb; light pause after topic marker. Never pause where English would just because the source did.",
    punctuation: "Use ' ।' as full stop, Bengali comma ',' fine. No English '.' as sentence end.",
    discourse: {
      well: ["আসলে,", "মানে,"],
      youKnow: ["বুঝলে,", "জানো তো,"],
      actually: ["আসলে,", "সত্যি বলতে,"],
      like: ["যেমন,"],
      hesitation: ["ইয়ে,"],
      agree: ["হ্যাঁ", "আচ্ছা", "ঠিক আছে"],
    },
    registerExamples: {
      casual: "আমার মনে হয় হয়ে যাবে।",
      polite: "আমার মনে হচ্ছে আমরা প্রস্তুত।",
      formal: "আমি মনে করি আমরা এগোতে পারি।",
    },
    idiomSwaps: [
      { from: "Well… I think…", to: "আমার মনে হয়…", note: "NOT 'আচ্ছা… আমি মনে করি…'" },
      { from: "you know what I mean", to: "বুঝতেই পারছ" },
      { from: "at the end of the day", to: "শেষ পর্যন্ত" },
    ],
    avoid: [
      "English SVO order",
      "literal 'আমি মনে করি' for 'I think' — use 'আমার মনে হয়'",
      "English '.' as sentence terminator",
    ],
  },

  hindi: {
    language: "Hindi",
    wordOrder: "SOV. Verb LAST. Postpositions after nouns. Topic before comment.",
    prosody: "Slight pause after topic ('मैं तो…'), breath before verb.",
    punctuation: "'।' as full stop; ',' okay. Question intonation via 'क्या' + '?'.",
    discourse: {
      well: ["अच्छा,", "देखो,", "तो,"],
      youKnow: ["पता है,", "यार,"],
      actually: ["असल में,", "सच बताऊँ तो,"],
      like: ["जैसे,"],
      hesitation: ["वो,", "मतलब,"],
      agree: ["हाँ", "बिलकुल", "सही"],
    },
    registerExamples: {
      casual: "मुझे लगता है हो जाएगा।",
      polite: "मुझे लगता है हम तैयार हैं।",
      formal: "मेरा मानना है कि हम आगे बढ़ सकते हैं।",
    },
    idiomSwaps: [
      { from: "at the end of the day", to: "आख़िर में" },
      { from: "to be honest", to: "सच कहूँ तो" },
      { from: "I mean…", to: "मतलब…" },
    ],
    avoid: [
      "English SVO",
      "over-Sanskritized vocabulary in casual speech",
      "literal 'मैं सोचता हूँ' — use 'मुझे लगता है'",
    ],
  },

  japanese: {
    language: "Japanese",
    wordOrder:
      "SOV. Verb LAST. Topic marked with は, subject with が. Drop subjects when clear from context — a native almost never says 'watashi wa' every sentence.",
    prosody:
      "Pause after particles (は, が, けど, から). Sentence-final particles (ね, よ, か) carry intonation — use them for warmth/questioning instead of '?'.",
    punctuation: "「」 for quotes, 、 for comma, 。 for period. Avoid '?' unless very casual.",
    discourse: {
      well: ["えっと,", "そうですね,", "まあ,"],
      youKnow: ["あのね,", "ほら,"],
      actually: ["実は,", "正直,"],
      like: ["なんか,"],
      hesitation: ["えっと", "あの", "うーん"],
      agree: ["はい", "うん", "そうそう"],
    },
    registerExamples: {
      casual: "できると思うよ。",
      polite: "できると思います。",
      formal: "実行可能かと存じます。",
    },
    idiomSwaps: [
      { from: "Well… I think…", to: "えっと、〜と思います。" },
      { from: "You know, like…", to: "えっと、なんか…" },
      { from: "let's do it", to: "やりましょう" },
    ],
    avoid: [
      "starting every sentence with 私は",
      "English '.' or '?' — use 。 and か/ね",
      "SVO order",
    ],
  },

  spanish: {
    language: "Spanish",
    wordOrder:
      "SVO but flexible; drop pronouns (pro-drop). Adjectives usually AFTER the noun. Use subjunctive where required.",
    prosody: "Breath before subordinate clauses; light pause after 'pues'.",
    punctuation: "Opening ¿ and ¡ are REQUIRED. Comma before subordinators fine.",
    discourse: {
      well: ["bueno,", "pues,", "mira,"],
      youKnow: ["¿sabes?,", "¿me entiendes?,"],
      actually: ["en realidad,", "la verdad,"],
      like: ["como,", "tipo,"],
      hesitation: ["eh", "este"],
      agree: ["sí", "claro", "vale", "ya"],
    },
    registerExamples: {
      casual: "creo que sí, tranquilo.",
      polite: "creo que estamos listos.",
      formal: "considero que podemos proceder.",
    },
    idiomSwaps: [
      { from: "I mean…", to: "o sea…" },
      { from: "you know", to: "¿sabes?" },
      { from: "at the end of the day", to: "al final del día" },
    ],
    avoid: [
      "keeping subject pronouns when unneeded ('yo pienso' instead of 'pienso')",
      "adjective-before-noun by default",
      "missing opening ¿ / ¡",
    ],
  },

  french: {
    language: "French",
    wordOrder: "SVO. Adjectives usually AFTER noun. Negation with ne…pas (drop 'ne' in casual speech).",
    prosody: "Light pause before 'que' / 'parce que'. Rising intonation on yes/no questions.",
    punctuation: "Space before ; : ! ?. Use « » for quotes.",
    discourse: {
      well: ["bon,", "alors,", "eh bien,"],
      youKnow: ["tu vois,", "tu sais,"],
      actually: ["en fait,", "franchement,"],
      like: ["genre,"],
      hesitation: ["euh", "ben"],
      agree: ["oui", "d'accord", "voilà"],
    },
    registerExamples: {
      casual: "ouais, ça va le faire.",
      polite: "je pense qu'on est prêts.",
      formal: "j'estime que nous pouvons procéder.",
    },
    idiomSwaps: [
      { from: "I mean…", to: "enfin,…" },
      { from: "you know", to: "tu vois" },
    ],
    avoid: ["missing space before punctuation", "translating 'actually' as 'actuellement' (false friend)"],
  },

  german: {
    language: "German",
    wordOrder:
      "V2 in main clauses (verb second). Verb goes to the END in subordinate clauses. Nouns capitalised.",
    prosody: "Long noun compounds — breathe BEFORE the compound, not inside it. Pause before 'weil' / 'dass'.",
    punctuation: "Comma before subordinate clauses is mandatory. „…“ quotes.",
    discourse: {
      well: ["also,", "na ja,", "tja,"],
      youKnow: ["weißt du,", "verstehst du,"],
      actually: ["eigentlich,", "ehrlich gesagt,"],
      like: ["so,", "quasi,"],
      hesitation: ["äh", "ähm"],
      agree: ["ja", "genau", "klar"],
    },
    registerExamples: {
      casual: "ja, das kriegen wir hin.",
      polite: "ich denke, wir sind bereit.",
      formal: "ich bin der Ansicht, dass wir fortfahren können.",
    },
    idiomSwaps: [
      { from: "at the end of the day", to: "letzten Endes" },
      { from: "I mean…", to: "ich meine,…" },
    ],
    avoid: ["English word order in subordinate clauses", "forgetting to capitalise nouns"],
  },

  portuguese: {
    language: "Portuguese",
    wordOrder: "SVO, pro-drop. Adjectives usually AFTER noun. Brazilian by default.",
    prosody: "Light pause before 'que'; final rising for questions.",
    punctuation: "Standard Latin. Use — for asides.",
    discourse: {
      well: ["bem,", "então,", "olha,"],
      youKnow: ["sabe?,", "entende?,"],
      actually: ["na verdade,", "sinceramente,"],
      like: ["tipo,"],
      hesitation: ["é", "eh"],
      agree: ["sim", "tá", "certo"],
    },
    registerExamples: {
      casual: "acho que dá, sim.",
      polite: "acho que estamos prontos.",
      formal: "considero que podemos prosseguir.",
    },
    idiomSwaps: [{ from: "you know", to: "sabe?" }, { from: "I mean…", to: "quer dizer,…" }],
    avoid: ["keeping subject pronouns unnecessarily", "European PT verb forms unless source signals PT-PT"],
  },

  italian: {
    language: "Italian",
    wordOrder: "SVO, pro-drop. Adjectives usually AFTER noun. Rich verb inflection — drop pronouns.",
    prosody: "Slight pause before 'che'/'perché'.",
    punctuation: "Standard Latin. « » or \"…\" for quotes.",
    discourse: {
      well: ["allora,", "beh,", "insomma,"],
      youKnow: ["sai?,", "capisci?,"],
      actually: ["in realtà,", "onestamente,"],
      like: ["tipo,", "cioè,"],
      hesitation: ["ehm"],
      agree: ["sì", "certo", "va bene"],
    },
    registerExamples: {
      casual: "sì, ce la facciamo.",
      polite: "credo che siamo pronti.",
      formal: "ritengo che possiamo procedere.",
    },
    avoid: ["keeping subject pronouns unnecessarily"],
  },

  russian: {
    language: "Russian",
    wordOrder:
      "Flexible word order — information structure drives it. New/important info goes LATER in the sentence. Case marks the role, not position.",
    prosody: "Pause before 'что' / 'потому что'. Questions marked by intonation as much as by '?'.",
    punctuation: "Comma-heavy: subordinate clauses always require commas. « » for quotes.",
    discourse: {
      well: ["ну,", "вот,", "значит,"],
      youKnow: ["знаешь,", "понимаешь,"],
      actually: ["на самом деле,", "честно говоря,"],
      like: ["типа,", "как бы,"],
      hesitation: ["эээ", "ммм"],
      agree: ["да", "ага", "конечно"],
    },
    registerExamples: {
      casual: "думаю, справимся.",
      polite: "думаю, мы готовы.",
      formal: "полагаю, мы можем продолжать.",
    },
    avoid: [
      "fixed English SVO when the info-structure calls for a different order",
      "missing commas before subordinate clauses",
    ],
  },

  arabic: {
    language: "Arabic",
    wordOrder:
      "VSO in Modern Standard Arabic (verb first) OR SVO in modern colloquial. Right-to-left script.",
    prosody: "Pause after connectors (و / ف / ثم). Emphatic tone via lengthening, not caps.",
    punctuation: "Use Arabic comma ، semicolon ؛ question mark ؟. RTL.",
    discourse: {
      well: ["طيب,", "حسناً,", "يعني,"],
      youKnow: ["تعرف,", "فاهم,"],
      actually: ["في الحقيقة,", "صراحة,"],
      like: ["يعني,", "زي,"],
      hesitation: ["يعني", "إم"],
      agree: ["نعم", "أيوة", "تمام"],
    },
    registerExamples: {
      polite: "أعتقد أننا جاهزون.",
      formal: "أرى أنه يمكننا المضي قدماً.",
    },
    avoid: ["Latin punctuation (, ; ?) — use ، ؛ ؟", "LTR flow"],
  },

  urdu: {
    language: "Urdu",
    wordOrder: "SOV. Verb LAST. Postpositions. RTL Nastaliq.",
    prosody: "Pause before final verb; breath after topic.",
    punctuation: "'۔' as full stop, '؟' for questions, '،' for comma. RTL.",
    discourse: {
      well: ["اچھا,", "دیکھیں,", "تو,"],
      youKnow: ["پتہ ہے,"],
      actually: ["دراصل,", "سچ پوچھیں تو,"],
      hesitation: ["مطلب,", "یعنی,"],
      agree: ["جی ہاں", "بالکل", "ٹھیک"],
    },
    registerExamples: {
      casual: "مجھے لگتا ہے ہو جائے گا۔",
      polite: "مجھے لگتا ہے ہم تیار ہیں۔",
      formal: "میرا خیال ہے کہ ہم آگے بڑھ سکتے ہیں۔",
    },
    avoid: ["English word order", "over-Persianate vocabulary in casual speech"],
  },

  chinese: {
    language: "Chinese (Mandarin)",
    wordOrder:
      "SVO, topic-prominent. Time/place BEFORE the verb. No tense inflection — use aspect markers (了/过/着) and time words.",
    prosody: "Pause after topic ('我啊,…'). Sentence-final particles (吧/呢/啊) carry mood.",
    punctuation: "Full-width: 。， ！？ 「」 or “”.",
    discourse: {
      well: ["那,", "嗯,", "这样吧,"],
      youKnow: ["你知道,", "你懂的,"],
      actually: ["其实,", "说实话,"],
      like: ["就是,", "比如,"],
      hesitation: ["嗯", "那个", "这个"],
      agree: ["对", "好的", "嗯"],
    },
    registerExamples: {
      casual: "我觉得没问题。",
      polite: "我觉得我们准备好了。",
      formal: "我认为我们可以继续。",
    },
    avoid: [
      "half-width ASCII punctuation (, . ? !) — use 。，？！",
      "putting time expressions after the verb",
    ],
  },

  korean: {
    language: "Korean",
    wordOrder:
      "SOV. Verb LAST. Topic marker 은/는, subject marker 이/가. Drop subjects when obvious.",
    prosody: "Pause after topic marker; sentence-final ending carries politeness/mood.",
    punctuation: "Standard ASCII in modern Korean.",
    discourse: {
      well: ["음,", "그,", "저기,"],
      youKnow: ["있잖아요,", "그러니까,"],
      actually: ["사실,", "솔직히,"],
      like: ["뭐랄까,"],
      hesitation: ["음", "어", "저"],
      agree: ["네", "응", "그래"],
    },
    registerExamples: {
      casual: "될 것 같아.",
      polite: "될 것 같아요.",
      formal: "가능할 것으로 판단됩니다.",
    },
    avoid: ["English SVO", "wrong politeness level for the source's register"],
  },

  turkish: {
    language: "Turkish",
    wordOrder: "SOV. Verb LAST. Agglutinative — suffixes stack on the verb.",
    prosody: "Pause before the final verb, which carries tense/person/mood.",
    punctuation: "Standard Latin with İ/ı distinction.",
    discourse: {
      well: ["şey,", "yani,", "peki,"],
      youKnow: ["biliyor musun,"],
      actually: ["aslında,", "açıkçası,"],
      like: ["gibi,"],
      hesitation: ["şey", "ııı"],
      agree: ["evet", "tamam", "tabii"],
    },
    registerExamples: {
      casual: "hallederiz bence.",
      polite: "hazır olduğumuzu düşünüyorum.",
      formal: "devam edebileceğimiz kanısındayım.",
    },
    avoid: ["English SVO", "İ/ı confusion"],
  },

  vietnamese: {
    language: "Vietnamese",
    wordOrder:
      "SVO, isolating. No inflection — use time words (đã/đang/sẽ) for tense. Modifiers usually AFTER the noun.",
    prosody: "Tones carry meaning — pronunciation is prosody. Comma pauses at clause breaks.",
    punctuation: "Standard Latin with diacritics; use them all.",
    discourse: {
      well: ["à,", "thì,", "vậy,"],
      youKnow: ["biết không,"],
      actually: ["thật ra,", "thực sự,"],
      like: ["kiểu,"],
      hesitation: ["à", "ừ"],
      agree: ["vâng", "dạ", "ừ"],
    },
    registerExamples: {
      casual: "chắc là ổn thôi.",
      polite: "mình nghĩ là mình sẵn sàng rồi.",
      formal: "tôi cho rằng chúng ta có thể tiến hành.",
    },
    avoid: ["dropping diacritics", "adjective-before-noun by default"],
  },

  indonesian: {
    language: "Indonesian",
    wordOrder: "SVO. Modifiers AFTER noun. No tense inflection — use time words (sudah/sedang/akan).",
    prosody: "Even, syllable-timed rhythm; light pauses at clause breaks.",
    punctuation: "Standard Latin.",
    discourse: {
      well: ["ya,", "gitu,", "jadi,"],
      youKnow: ["kan,", "tahu kan,"],
      actually: ["sebenarnya,", "jujur,"],
      like: ["kayak,"],
      hesitation: ["eh", "anu"],
      agree: ["iya", "oke", "betul"],
    },
    registerExamples: {
      casual: "kayaknya bisa deh.",
      polite: "saya rasa kita sudah siap.",
      formal: "saya berpendapat kita dapat melanjutkan.",
    },
    avoid: ["English verb inflection instead of time-word aspect", "adjective-before-noun order"],
  },

  thai: {
    language: "Thai",
    wordOrder:
      "SVO. Modifiers AFTER noun. No inflection — tense from context/particles. Politeness particles ครับ/ค่ะ end the sentence.",
    prosody: "Tones carry meaning. Sentence-final particles carry mood.",
    punctuation:
      "No spaces between words; spaces mark sentence/clause breaks. No '.' between sentences typically.",
    discourse: {
      well: ["คือ,", "แบบ,"],
      youKnow: ["รู้ไหม,"],
      actually: ["จริงๆ,", "ที่จริง,"],
      like: ["ประมาณว่า,"],
      hesitation: ["เอ่อ", "อืม"],
      agree: ["ใช่", "ครับ", "ค่ะ", "โอเค"],
    },
    registerExamples: {
      casual: "น่าจะได้อยู่นะ",
      polite: "คิดว่าเราพร้อมแล้วครับ/ค่ะ",
      formal: "ผมเห็นว่าเราสามารถดำเนินการต่อได้",
    },
    avoid: ["putting '.' between sentences", "adding spaces inside words"],
  },
};

/* -------------------------------------------------------------- fallback */

const FALLBACK: NativeStyle = {
  language: "target",
  wordOrder: "Use the natural grammatical order native speakers use in real conversation.",
  prosody: "Place pauses at native breath points — never mimic the source's pause locations.",
  punctuation: "Use the punctuation conventions native writers use for spoken text.",
  discourse: {},
  avoid: [
    "word-for-word translation",
    "source-language sentence order",
    "source-language discourse markers translated literally",
  ],
};

/* ------------------------------------------------------------------ API */

class NativeStyleLibraryImpl {
  get(language: string | null | undefined): NativeStyle {
    const key = (language ?? "").trim().toLowerCase();
    if (!key) return FALLBACK;
    if (ENTRIES[key]) return ENTRIES[key];
    // Loose match on common variants ("mandarin", "brazilian portuguese", …)
    if (/(mandarin|cantonese|chinese)/.test(key)) return ENTRIES.chinese;
    if (/portugu/.test(key)) return ENTRIES.portuguese;
    if (/espanol|castellano|spanish/.test(key)) return ENTRIES.spanish;
    if (/deutsch|german/.test(key)) return ENTRIES.german;
    if (/francais|french/.test(key)) return ENTRIES.french;
    if (/nihongo|japanese/.test(key)) return ENTRIES.japanese;
    if (/hangul|korean/.test(key)) return ENTRIES.korean;
    return { ...FALLBACK, language: language ?? "target" };
  }

  /**
   * Render a compact, model-ready style card for {TARGET}. Kept short on
   * purpose — big prompts slow first-token latency in a real-time voice loop.
   */
  buildStyleCard(language: string | null | undefined): string {
    const s = this.get(language);
    const d = s.discourse;

    const lines: string[] = [];
    lines.push(`## Native style reference for ${s.language}`);
    lines.push(`WORD ORDER: ${s.wordOrder}`);
    lines.push(`PROSODY: ${s.prosody}`);
    lines.push(`PUNCTUATION: ${s.punctuation}`);

    const dm: string[] = [];
    if (d.well?.length) dm.push(`"well/so" → ${d.well.join(" / ")}`);
    if (d.youKnow?.length) dm.push(`"you know / I mean" → ${d.youKnow.join(" / ")}`);
    if (d.actually?.length) dm.push(`"actually" → ${d.actually.join(" / ")}`);
    if (d.like?.length) dm.push(`"like" → ${d.like.join(" / ")}`);
    if (d.hesitation?.length) dm.push(`hesitation → ${d.hesitation.join(" / ")}`);
    if (d.agree?.length) dm.push(`agreement → ${d.agree.join(" / ")}`);
    if (dm.length) lines.push(`DISCOURSE MARKERS (use these instead of translating source markers literally):\n- ${dm.join("\n- ")}`);

    if (s.registerExamples) {
      const reg = Object.entries(s.registerExamples)
        .map(([k, v]) => `  ${k}: ${v}`).join("\n");
      lines.push(`REGISTER — same idea across politeness levels (match the speaker's register):\n${reg}`);
    }

    if (s.idiomSwaps?.length) {
      const idi = s.idiomSwaps
        .map(x => `  "${x.from}" → ${x.to}${x.note ? `  (${x.note})` : ""}`)
        .join("\n");
      lines.push(`IDIOM SWAPS (never translate these literally):\n${idi}`);
    }

    if (s.avoid.length) {
      lines.push(`AVOID:\n- ${s.avoid.join("\n- ")}`);
    }

    return lines.join("\n");
  }

  list(): string[] { return Object.keys(ENTRIES); }
}

export const NativeStyleLibrary = new NativeStyleLibraryImpl();
