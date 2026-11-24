import express from 'express';
import { shards } from './db.js';
import { shardFor } from './router.js';

const app = express();
app.use(express.json());

app.post('/users', async (req, res) => {
    const { id, name, score } = req.body;
    const s = shardFor(id);
    await shards[s].query('INSERT INTO users (id, name, score) VALUES ($1, $2, $3)', [id, name, score]);
    res.json({ id, shard: s });
});

app.get('/users/:id', async (req, res) => {
    const id = Number(req.params.id);
    const s = shardFor(id);
    const { rows } = await shards[s].query('SELECT * FROM users WHERE id = $1', [id]);
    if (!rows.length) { res.status(404).json({ error: 'not found', shard: s }); return; }
    res.json({ ...rows[0], shard: s });
});

// Task 2 routes go here

app.listen(3000, () => console.log('listening on 3000'));