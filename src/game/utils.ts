export function get_random_numbers(count: number, max_value: number, repeats: number) {
    const list: number[] = [];
    for (let i = 0; i < count; i++) {
      list.push(Math.floor(math.random() * max_value) + 1);
    }
    for (let i = 0; i < repeats; i++) {
      const r = Math.floor(math.random() * list.length);
      list.push(list[r]);
    }
    return list;
  }

export function get_neighbors(x: number, y: number, size: number) {
    const neighbors: { x: number; y: number }[] = [];
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size && !(i === x && j === y)) {
                neighbors.push({ x: i, y: j });
            }
        }
    }
    return neighbors;
}