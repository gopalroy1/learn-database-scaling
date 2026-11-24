const names = ['asha', 'ravi', 'meera', 'arjun', 'neha'];

async function main() {
    for (let id = 1; id <= 1000; id++) {
        await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id, name: names[id % 5], score: Math.floor(Math.random() * 100) }),
        });
    }
    console.log('loaded 1000 users');
}
main();