const hash = (id: number) => (id * 37) % 100;   // toy hash, values 0–99
type Node = { name: string; pos: number };
const before: Node[] = [{ name: 'A', pos: 0 }, { name: 'B', pos: 33 }, { name: 'C', pos: 66 }];
const after: Node[] = [...before, { name: 'D', pos: 50 }].sort((a, b) => a.pos - b.pos);
console.log(after)