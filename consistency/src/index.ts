import { shards } from './db';

async function main(): Promise<void> {
    //Get initial total
    let total = 0;
    for (let i = 0; i < shards.length; i++) {
        const { rows } = await shards[i].query('SELECT id, balance FROM accounts ORDER BY id');
        for (const r of rows) {
            console.log(`shard${i} ${r.id}: ${r.balance}`);
            total += r.balance;
        }
    }
    console.log(`TOTAL: ${total}`);
    //
    // const [from, to, amt] = process.argv.slice(2);
    // const from = 'alice'
    // const to = 'bob'
    // const amount = Number(100);
    // const crash = '1'
    // await poolFor(from).query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from]);
    // console.log(`debited ${from}`);
    // if (crash === '1') { console.log('crash!'); process.exit(1); }
    // await poolFor(to).query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, to]);
    // console.log(`credited ${to}`);
}


// main().finally(closeAll);