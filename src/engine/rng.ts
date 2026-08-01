export function range(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function rangeInt(min: number, max: number): number {
  return Math.floor(range(min, max + 1));
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function chance(p: number): boolean {
  return Math.random() < p;
}
