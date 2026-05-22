import type { SubItemId } from '@/lib/topics';

/** KB optional deeper-cut ids (not `navigate_to_topic` chapters). */
export type DeeperCutId =
  | 'momuse-deeper'
  | 'talk-to-product-deeper'
  | 'pawn-shop-deeper'
  | 'this-agent-deeper';

export const DEEPER_CUT_IDS: DeeperCutId[] = [
  'momuse-deeper',
  'talk-to-product-deeper',
  'pawn-shop-deeper',
  'this-agent-deeper',
];

const SUB_ITEM_TO_DEEPER_CUT: Record<SubItemId, DeeperCutId> = {
  momuse: 'momuse-deeper',
  'talk-to-product': 'talk-to-product-deeper',
  'pawn-shop': 'pawn-shop-deeper',
  'this-agent': 'this-agent-deeper',
};

const DEEPER_CUT_TO_SUB_ITEM: Record<DeeperCutId, SubItemId> = {
  'momuse-deeper': 'momuse',
  'talk-to-product-deeper': 'talk-to-product',
  'pawn-shop-deeper': 'pawn-shop',
  'this-agent-deeper': 'this-agent',
};

export function getDeeperCutId(subItemId: SubItemId): DeeperCutId {
  return SUB_ITEM_TO_DEEPER_CUT[subItemId];
}

export function isDeeperCutId(value: string): value is DeeperCutId {
  return (DEEPER_CUT_IDS as string[]).includes(value);
}

export function subItemFromDeeperCutId(
  deeperCutId: DeeperCutId
): SubItemId {
  return DEEPER_CUT_TO_SUB_ITEM[deeperCutId];
}
