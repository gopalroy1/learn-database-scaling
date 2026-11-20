import express, { Request } from 'express';
import { Pool } from 'pg';

type ReadNode = { name: string; pool: Pool };

const conn = { host: 'localhost', user: 'postgres', password: 'pass', database: 'postgres' };
const primary = new Pool({ ...conn, port: 5440, max: 5 });
const replica1 = new Pool({ ...conn, port: 5441, max: 10 });  // no delay
const replica2 = new Pool({ ...conn, port: 5442, max: 10 });  // 5 s behind

const app = express();
app.use(express.json());

// [write yourself] decide where a read goes
function pickReadNode(req: Request): ReadNode {
    return {
        name: 'replica2',
        pool: replica2
    }
    // Task 4: always replica2
    // Task 5: read-your-writes
    // Task 6: monotonic reads
    throw new Error('not implemented');
}

app.post('/orders', async (req, res) => {
    const { rows } = await primary.query(
        'INSERT INTO orders (item) VALUES ($1) RETURNING id', [req.body.item]);
    // Task 5: remember this write here
    res.json(rows[0]);
});

app.get('/orders/:id', async (req, res) => {
    const node = pickReadNode(req);
    const { rows } = await node.pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!rows.length) {
        res.status(404).json({ error: 'not found', servedBy: node.name });
        return;
    }
    res.json({ ...rows[0], servedBy: node.name });
});

app.listen(3000, () => console.log('listening on 3000'));