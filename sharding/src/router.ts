import { TOTAL_BUCKET } from "./const";

// [write yourself] which shard holds this user?
//For sharding
//Maintain a map for buckets and shards
//Lets say there are 16 buckets
// lets say there are 3 shards. 1-> 0,5, 2->6-11, 3->12-16
// type ShardId = '0' | '1' | '2';

// interface BucketRange {
//     min: number;
//     max: number;
// }

// export const SHARD_CONFIG: Record<ShardId, BucketRange> = {
//     '0': { min: 0, max: 5 },
//     '1': { min: 6, max: 11 },
//     '2': { min: 12, max: TOTAL_BUCKET - 1 },
//     // '3': { min: 12, max: TOTAL_BUCKET - 1 },
// };
export const SHARD_CONFIG_NEW = {
    0: [0, 1, 2, 3],
    1: [6, 7, 8, 9],
    2: [12, 13, 14, 15],
    3: [4, 5, 10, 11]
}
export function shardFor(userId: number): number {
    // throw new Error('not implemented');
    const bucketForUser = userId % TOTAL_BUCKET
    let ansShard = -1;
    for (let key in SHARD_CONFIG_NEW) {
        //@ts-ignore
        const arr = SHARD_CONFIG_NEW[key]
        if (arr.includes(bucketForUser)) {
            ansShard = Number(key)
            break;
        }
    }
    if (ansShard < 0 || isNaN(ansShard)) {
        throw new Error("Wrong shard for function")

    }
    return ansShard
}