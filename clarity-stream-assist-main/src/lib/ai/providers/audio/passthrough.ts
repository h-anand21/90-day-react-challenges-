import type { IAudioProcessingProvider } from "../../interfaces";

/** No-op fallback. Guarantees the audio pipeline never blocks on processing. */
export class PassthroughAudioProcessingProvider implements IAudioProcessingProvider {
  readonly name = "passthrough";
  isAvailable(): boolean { return true; }
  async process(stream: MediaStream): Promise<MediaStream> { return stream; }
}
