export type ChapterId =
  | 'intro'
  | 'agent-experience'
  | 'why-open'
  | 'tabulas-deep'
  | 'customer-facing'
  | 'prompt-engineering'
  | 'design-history'
  | 'logistics'
  | 'ask-anything';

export type ClientToolsState = {
  setActiveChapter: (id: ChapterId) => void;
  setCvVisible: (visible: boolean) => void;
  setReadMode: (on: boolean) => void;
};

export const makeClientTools = (state: ClientToolsState) => ({
  highlightChapter: ({ chapterId }: { chapterId: ChapterId }) => {
    state.setActiveChapter(chapterId);
    return 'Chapter highlighted';
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
