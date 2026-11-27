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


// Task 2 scatter and gather
app.get('/users', async (req, res) => {
    const name = req?.query?.name
    console.log("Searching user for name ", { name })
    const result = shards.map((pool) => {
        return pool.query('SELECT * FROM users WHERE name = $1', [name])
    })
    // console.dir(result[0])
    const promiseRes = await Promise.all(result)
    const allData: any = []
    promiseRes.map((data) => {
        allData.push(...data?.rows)
    })
    return res.send({ rowCount: allData?.length, data: allData })

})
app.get('/stats/avg-score', async (req, res) => {
    const result = shards.map((pool) => {
        return pool.query('SELECT COUNT(*) AS rows, SUM(score) as total_sum, AVG(score) as avg FROM users')
    })
    // console.dir(result[0])
    const promiseRes = await Promise.all(result)
    let totalSum = 0;
    let totalCount = 0;
    const dataRes = {}
    promiseRes.map((data, i) => {
        console.dir(data?.rows)
        const { rows, total_sum, avg } = data?.rows[0]
        if (!avg) {
            return
        }
        totalSum += Number(total_sum)
        totalCount += Number(rows)
        //@ts-ignore
        dataRes[`shard${i}`] = {
            rows, total_sum, avg
        }
    })
    return res.send({ ...dataRes, totalSum, totalCount, avg: Number(totalSum) / Number(totalCount) })

})


app.listen(3000, () => console.log('listening on 3000'));