/**
 * ElevenLabs SDK can throw when `error` events arrive without `error_event`
 * (seen after chapter launch). Guard the handler so the session does not crash.
 */
import { VoiceConversation } from '@elevenlabs/client';

type ErrorEventPayload = {
  error_event?: {
    error_type?: string;
    message?: string;
    reason?: string;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = VoiceConversation.prototype as any;

if (typeof proto.handleErrorEvent === 'function' && !proto.__askWardErrorPatched) {
  const original = proto.handleErrorEvent as (
    event: ErrorEventPayload
  ) => void;

  proto.handleErrorEvent = function (event: ErrorEventPayload) {
    if (!event?.error_event) {
      console.warn(
        '[ask-ward] Ignoring malformed ElevenLabs error event (missing error_event)',
        event
      );
      return;
    }
    return original.call(this, event);
  };

  proto.__askWardErrorPatched = true;
}
