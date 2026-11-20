import express, { Request } from 'express';
import { Pool } from 'pg';

type ReadNode = { name: string; pool: Pool };

const conn = { host: 'localhost', user: 'postgres', password: 'pass', database: 'postgres' };
const primary = new Pool({ ...conn, port: 5440, max: 5 });
const replica1 = new Pool({ ...conn, port: 5441, max: 10 });  // no delay
const replica2 = new Pool({ ...conn, port: 5442, max: 10 });  // 5 s behind
//
export async function seed(primary: Pool): Promise<void> {
    await primary.query('CREATE TABLE IF NOT EXISTS orders (id serial PRIMARY KEY, item text)');
    console.log('seed: orders table ready');
}

const app = express();
app.use(express.json());

// [write yourself] decide where a read goes
//initiaze a map
let usersFreshWrittenMap = new Map<Number, Number>()

function pickReadNodeBasedOnUserId(userId: number): ReadNode {
    // console.log("Pick read node user id", userId)
    const lastTime: any = usersFreshWrittenMap.get(Number(userId))
    const currTime: any = Date.now()
    // console.log({ lastTime }, { currTime })
    if (false && lastTime && currTime - lastTime < 30000) {
        console.log("Fresh order serving read from primary")
        return {
            name: 'primary',
            pool: primary
        }
    }
    return pickReadNode()
}
let userId = 0
function pickReadNode(req?: Request): ReadNode {
    // const userId = Number(req?.headers?.['x-user-id'])
    userId++;

    // console.dir("Returing replica2", usersFreshWrittenMap)
    return {
        name: userId % 2 == 0 ? 'replica2' : 'replica1',
        pool: userId % 2 == 0 ? replica2 : replica1
    }
    // if
    // Task 4: always replica2
    // Task 5: read-your-writes
    // Task 6: monotonic reads
    // throw new Error('not implemented');
}

app.post('/orders', async (req, res) => {
    const userId = req?.headers?.['x-user-id']
    console.log("The user id is ", { userId })
    const { rows } = await primary.query(
        'INSERT INTO orders (item) VALUES ($1) RETURNING id', [req.body.item]);
    // const orderId = rows[0]?.id
    // Task 5: remember this write here
    //@ts-ignore
    usersFreshWrittenMap.set(Number(userId), Date.now())
    res.json(rows[0]);
});

app.get('/orders/:id', async (req, res) => {
    const orderId = req.params.id
    const userId = req?.headers?.['x-user-id']
    const node = pickReadNodeBasedOnUserId(Number(userId));
    const { rows } = await node.pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!rows.length) {
        console.log({ error: 'not found', servedBy: node.name })
        res.status(404).json({ error: 'not found', servedBy: node.name });
        return;
    }
    console.log("Res is ", { ...rows[0], servedBy: node.name })
    res.json({ ...rows[0], servedBy: node.name });
});

app.listen(3000, () => {
    console.log('listening on 3000')
    seed(primary)
});