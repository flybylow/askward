/**
 * ElevenLabs WebRTC embeds its own LiveKit build. Our `setLogLevel` on the
 * app's `livekit-client` copy does not reach that bundle.
 *
 * On disconnect / HMR the lossy RTCDataChannel often fires an opaque error
 * (`Unknown DataChannel error on lossy {}`). It is harmless; suppress it so
 * Next.js Turbopack does not surface it as a console error overlay.
 */

const LOSSY_DC_ERROR =
  /Unknown DataChannel error on lossy|DataChannel error on lossy/i;

function shouldSuppress(args: unknown[]): boolean {
  return args.some(
    (arg) => typeof arg === 'string' && LOSSY_DC_ERROR.test(arg)
  );
}

export function suppressLivekitConsoleNoise(): void {
  if (typeof window === 'undefined') return;

  const w = window as Window & { __askWardLivekitConsolePatched?: boolean };
  if (w.__askWardLivekitConsolePatched) return;
  w.__askWardLivekitConsolePatched = true;

  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    originalError(...args);
  };

  void import('livekit-client')
    .then(({ setLogLevel, LogLevel }) => {
      setLogLevel(LogLevel.silent);
    })
    .catch(() => {
      /* optional dependency path */
    });
}

suppressLivekitConsoleNoise();
