import { Pool } from 'pg';

const base = { host: 'localhost', user: 'postgres', password: 'pass', database: 'postgres' };
export const shards: Pool[] = [5460, 5461, 5462, 5463].map((port) => new Pool({ ...base, port, max: 5 }));