import { TOTAL_SHARD } from "./const";

// [write yourself] which shard holds this user?
export function shardFor(userId: number): number {
    // throw new Error('not implemented');
    return userId % TOTAL_SHARD;
}