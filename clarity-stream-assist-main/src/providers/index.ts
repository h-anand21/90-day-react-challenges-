/**
 * Provider barrel — thin re-export layer so app code can `import from
 * "@/providers"` and stay decoupled from the current file layout under
 * `src/lib/ai`.
 *
 * UI components MUST prefer `InterpreterService` for live-session work. These
 * services exist for server functions and non-live flows (uploads, meeting
 * imports, chat).
 */
export {
  getSpeechService,
  getTranslationService,
  getSummaryService,
  getChatService,
} from "@/lib/ai/services";

export {
  SpeechProviderFactory,
  SpeechRecognitionProviderFactory,
  TranslationProviderFactory,
  InterpretationProviderFactory,
  SummaryProviderFactory,
  ChatProviderFactory,
  AudioProcessingProviderFactory,
  LanguageDetectionProviderFactory,
  SpeechSynthesisProviderFactory,
  InterpretationValidatorFactory,
} from "@/lib/ai/factory";

export type {
  IAudioProcessingProvider,
  IChatProvider,
  IInterpretationProvider,
  IInterpretationValidator,
  ILanguageDetectionProvider,
  ISpeechRecognitionProvider,
  ISpeechSynthesisProvider,
  ISummaryProvider,
  ITranscriptionProvider,
  ITranslationProvider,
  TranscribeResult,
  SummaryFormat,
  AudienceProfile,
  LanguageDetectionResult,
  SpeechSynthesisOptions,
  SpeechSynthesisResult,
} from "@/lib/ai/interfaces";
