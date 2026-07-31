/**
 * Application service layer. Server functions and API routes call these
 * services — never a concrete provider — so the AI backend can be swapped
 * by editing config/env alone.
 */

import {
  ChatProviderFactory,
  LanguageDetectionProviderFactory,
  SpeechProviderFactory,
  SpeechSynthesisProviderFactory,
  SummaryProviderFactory,
  TranslationProviderFactory,
} from "./factory";
import type {
  IChatProvider,
  ILanguageDetectionProvider,
  ISpeechSynthesisProvider,
  ISummaryProvider,
  ITranscriptionProvider,
  ITranslationProvider,
} from "./interfaces";

export function getSpeechService(): ITranscriptionProvider {
  return SpeechProviderFactory.create();
}
export function getTranslationService(): ITranslationProvider {
  return TranslationProviderFactory.create();
}
export function getSummaryService(): ISummaryProvider {
  return SummaryProviderFactory.create();
}
export function getChatService(): IChatProvider {
  return ChatProviderFactory.create();
}
export function getLanguageDetectionService(): ILanguageDetectionProvider {
  return LanguageDetectionProviderFactory.create();
}
export function getSpeechSynthesisService(): ISpeechSynthesisProvider {
  return SpeechSynthesisProviderFactory.create();
}
