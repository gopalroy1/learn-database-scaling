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
        fromPrepared = true;
        // (1) TODO: mark that the debit shard has promised

        // ---- Phase 1: credit shard ----
        await toClient.query('BEGIN');
        const credit = await toClient.query(
            'UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND NOT frozen', [amount, to]);
        if (credit?.rowCount === 0) {
            throw new Error("Unable to update the balance")
        }
        await toClient.query(`PREPARE TRANSACTION '${gid}'`);
        toPrepared = true
        if (process.env.CRASH_AFTER_PREPARE === '1') {
            console.log(`crash after prepare, gid = ${gid}`);
            process.exit(1);
        }

        // ---- Phase 2: both said ready ----
        await fromClient.query(`COMMIT PREPARED '${gid}'`);
        await toClient.query(`COMMIT PREPARED '${gid}'`);
    } catch (e) {
        await fromClient.query(fromPrepared ? `ROLLBACK PREPARED '${gid}'` : 'ROLLBACK');
        await toClient.query(toPrepared ? `ROLLBACK PREPARED '${gid}'` : 'ROLLBACK');
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