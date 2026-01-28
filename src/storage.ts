/**
 * Browser storage utilities
 */

export function setItem(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function getItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue ?? null;
  } catch (e) {
    return defaultValue ?? null;
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export function clear(): void {
  localStorage.clear();
}

export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

export function getKeys(): string[] {
  return Object.keys(localStorage);
}

export function getSize(): number {
  let total = 0;
  for (const key of getKeys()) {
    const value = localStorage.getItem(key);
    if (value) {
      total += key.length + value.length;
    }
  }
  return total;
}

export function setWithExpiry(key: string, value: any, ttl: number): void {
  const item = {
    value,
    expiry: Date.now() + ttl
  };
  setItem(key, item);
}

export function getWithExpiry<T>(key: string): T | null {
  const item = getItem<{ value: T; expiry: number }>(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    removeItem(key);
    return null;
  }

  return item.value;
}
