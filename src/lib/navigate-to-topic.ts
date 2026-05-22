import type { ChapterId, SubItemId } from '@/lib/topics';
import { getDeeperCutId } from '@/lib/deeper-cuts';

/** UI card / CTA payload — mirrors `navigate_to_topic` + optional deeper cut. */
export type NavigateToTopicRequest = {
  chapterId: ChapterId;
  subItemId?: SubItemId;
};

export function resolveNavigateToTopic(request: NavigateToTopicRequest): {
  chapterId: ChapterId;
  subItemId: SubItemId | null;
  deeperCutId: string | null;
} {
  const subItemId = request.subItemId ?? null;
  const deeperCutId =
    request.chapterId === 'what-ive-built' && subItemId
      ? getDeeperCutId(subItemId)
      : null;

  return {
    chapterId: request.chapterId,
    subItemId,
    deeperCutId,
  };
}
