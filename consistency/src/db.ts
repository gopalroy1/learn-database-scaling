import { Pool } from 'pg';

const base = { host: 'localhost', user: 'postgres', password: 'pass', database: 'postgres', max: 5 };
export const shards = [new Pool({ ...base, port: 5470 }), new Pool({ ...base, port: 5471 })];

const home: Record<string, number> = { alice: 0, bob: 1, carol: 1 };
export function poolFor(account: string): Pool {
    const s = home[account];
    if (s === undefined) throw new Error(`unknown account ${account}`);
    return shards[s];
}

export const closeAll = () => Promise.all(shards.map((p) => p.end()));