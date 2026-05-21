import type { ChapterId } from './topics';

export type { ChapterId };
/** @deprecated Use ChapterId */
export type TopicId = ChapterId;

export type ListenerRole = 'founder' | 'hiring_manager' | 'recruiter';

export type ClientToolsState = {
  selectChapter: (id: ChapterId, source: 'ui' | 'tool') => void;
  setCvVisible: (visible: boolean) => void;
  setReadMode: (on: boolean) => void;
  setRole: (role: ListenerRole) => void;
  openSidePanel: () => void;
  connectToWard: () => void;
};

export const makeClientTools = (state: ClientToolsState) => ({
  navigate_to_topic: ({ topicId }: { topicId: ChapterId }) => {
    state.selectChapter(topicId, 'tool');
    return 'Chapter navigated';
  },

  highlightChapter: ({ chapterId }: { chapterId: string }) => {
    state.selectChapter(chapterId as ChapterId, 'tool');
    return 'Chapter navigated (legacy tool)';
  },

  set_role: ({ role }: { role: ListenerRole }) => {
    state.setRole(role);
    return `Role set to ${role}`;
  },

  connect_to_ward: () => {
    state.connectToWard();
    return 'WhatsApp overlay opened';
  },

  open_side_panel: () => {
    state.openSidePanel();
    return 'Side panel opened';
  },

  showCVDownload: () => {
    state.setCvVisible(true);
    return 'CV download surfaced';
  },

  switchToReadMode: () => {
    state.setReadMode(true);
    return 'Switched to read mode';
  },
});
