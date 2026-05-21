/** Navigation + client-tool debug logging (dev or NEXT_PUBLIC_DEBUG_NAV=1). */
export const NAV_DEBUG_ENABLED =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEBUG_NAV === '1';

export type NavDebugToolPhase =
  | 'requested'
  | 'running'
  | 'done'
  | 'error'
  | 'unhandled';

export type NavDebugToolEvent = {
  name: string;
  phase: NavDebugToolPhase;
  at: number;
  parameters?: Record<string, unknown>;
  result?: string;
  error?: string;
};

export function debugNav(event: string, detail?: unknown): void {
  if (!NAV_DEBUG_ENABLED) return;
  console.log('[ask-ward:nav]', event, detail ?? '');
}
