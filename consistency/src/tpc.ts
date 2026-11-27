import { closeAll, poolFor } from "./db";

export const transfer2pc = async (from: string, to: string, amount: number): Promise<void> => {
    const gid = `tx-${Date.now()}`;
    const fromClient = await poolFor(from).connect();
    const toClient = await poolFor(to).connect();
    let fromPrepared = false;
    let toPrepared = false;

    try {
        // ---- Phase 1: debit shard ----
        await fromClient.query('BEGIN');
        await fromClient.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from]);
        await fromClient.query(`PREPARE TRANSACTION '${gid}'`);
        // (1) TODO: mark that the debit shard has promised

        // ---- Phase 1: credit shard ----
        await toClient.query('BEGIN');
        const credit = await toClient.query(
            'UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND NOT frozen', [amount, to]);
        // (2) TODO: if credit.rowCount is 0 → throw an Error (this shard votes "no")
        await toClient.query(`PREPARE TRANSACTION '${gid}'`);
        // (3) TODO: mark that the credit shard has promised

        if (process.env.CRASH_AFTER_PREPARE === '1') {
            console.log(`crash after prepare, gid = ${gid}`);
            process.exit(1);
        }

        // ---- Phase 2: both said ready ----
        await fromClient.query(`COMMIT PREPARED '${gid}'`);
        await toClient.query(`COMMIT PREPARED '${gid}'`);
    } catch (e) {
        // (4) TODO debit shard:  if it promised → `ROLLBACK PREPARED '${gid}'`, otherwise 'ROLLBACK'
        // (5) TODO credit shard: same rule
        throw e;
    } finally {
        fromClient.release();
        toClient.release();
    }
};
const [from, to, amt] = process.argv.slice(2);
transfer2pc(from, to, Number(amt))
    .then(() => console.log('committed'))
    .catch((e) => console.error('rolled back:', (e as Error).message))
    .finally(closeAll);