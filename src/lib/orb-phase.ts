/** Visual phase for the voice orb and status line. */

export type OrbPhase =
  | 'idle'
  | 'connecting'
  | 'thinking'
  | 'listening'
  | 'user-speaking'
  | 'agent-speaking';

export type OrbPhaseInput = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  agentSpeaking: boolean;
  userSpeaking: boolean;
  thinking: boolean;
};

export function resolveOrbPhase({
  status,
  agentSpeaking,
  userSpeaking,
  thinking,
}: OrbPhaseInput): OrbPhase {
  if (status === 'connecting') return thinking ? 'thinking' : 'connecting';
  if (status !== 'connected') return thinking ? 'thinking' : 'idle';
  if (agentSpeaking) return 'agent-speaking';
  if (thinking) return 'thinking';
  if (userSpeaking) return 'user-speaking';
  return 'listening';
}

export function orbStatusLine(
  phase: OrbPhase,
  errorMessage?: string,
  status?: OrbPhaseInput['status']
): string {
  if (errorMessage && (status === 'error' || status === 'disconnected')) {
    return errorMessage;
  }
  switch (phase) {
    case 'connecting':
      return 'Connecting';
    case 'thinking':
      return 'Thinking';
    case 'agent-speaking':
      return 'Speaking';
    case 'user-speaking':
      return 'You’re speaking';
    case 'listening':
      return 'Listening';
    default:
      return 'Start agent';
  }
}
