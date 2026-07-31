import type { IAudioProcessingProvider, AudioProcessingOptions } from "../../interfaces";

/**
 * Browser-native audio processing via the WebRTC MediaStream constraints:
 * noise suppression, echo cancellation, AGC. Works with any modern browser.
 * No server calls, no external SDK.
 */
export class WebRTCAudioProcessingProvider implements IAudioProcessingProvider {
  readonly name = "webrtc";

  isAvailable(): boolean {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  }

  async process(stream: MediaStream, opts: AudioProcessingOptions = {}): Promise<MediaStream> {
    const track = stream.getAudioTracks()[0];
    if (!track || typeof track.applyConstraints !== "function") return stream;
    try {
      await track.applyConstraints({
        noiseSuppression: opts.noiseSuppression ?? true,
        echoCancellation: opts.echoCancellation ?? true,
        autoGainControl: opts.autoGainControl ?? true,
      } as MediaTrackConstraints);
    } catch {
      // Not fatal — some browsers reject unknown constraints.
    }
    return stream;
  }
}
