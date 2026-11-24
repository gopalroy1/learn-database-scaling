import { TOTAL_SHARD } from "../const"
import { shards } from "../db"

export const move = async () => {
    console.log("User migration from one shard to another is started")
    shards.forEach(async (pool, shardIndex) => {
        const data = await pool.query('SELECT id,name,score FROM users')

        console.log("The total data found in the shard ", shardIndex, " is ", data?.rowCount)
        data?.rows?.forEach(async (value) => {
            const shardValue = Number(value?.id) % TOTAL_SHARD
            console.log('The shard value and id is ', shardValue, value?.id)
            if (shardValue !== shardIndex) {
                //delete from this shard
                try {
                    const userAdded = await shards[shardValue]?.query('INSERT INTO users (id,name,score) values ($1,$2,$3) on conflict(id) do nothing returning * ;', [value?.id, value?.name, value?.score])
                    console.log("User ", userAdded?.rows, " is added in shard ", shardValue)

                } catch (error) {
                    console.error("Error while adding user")
                    throw error
                }
                const deletedUser = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [value?.id])
                console.log("User ", deletedUser?.rows, " is deleted")
                //add to next shard
                //I guess it should be in a transaction but how because different shards? should I add them in this task??
            }
        })
    })
    console.log("User migration from one shard to another is completed")

}
move()