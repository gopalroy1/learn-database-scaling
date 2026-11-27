import { closeAll, shards } from './db';

async function main(): Promise<void> {
    let total = 0;
    for (let i = 0; i < shards.length; i++) {
        const { rows } = await shards[i].query('SELECT id, balance FROM accounts ORDER BY id');
        for (const r of rows) {
            console.log(`shard${i} ${r.id}: ${r.balance}`);
            total += r.balance;
        }
    }
    console.log(`TOTAL: ${total}`);
}
main().finally(closeAll);