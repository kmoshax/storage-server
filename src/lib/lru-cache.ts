interface CacheEntry {
    value: Buffer;
    size: number;
}

export class LRUCache {
    private maxSize: number; // size in bytes
    private currentSize: number = 0;
    private cache: Map<string, CacheEntry> = new Map();

    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    get(key: string): Buffer | undefined {
        const entry = this.cache.get(key);
        if (entry) {
            // move to front
            this.cache.delete(key);
            this.cache.set(key, entry);
            return entry.value;
        }
        return undefined;
    }

    set(key: string, value: Buffer): void {
        const size = value.byteLength;
        if (size > this.maxSize) return;

        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        while (this.currentSize + size > this.maxSize) {
            const oldestKey = this.cache.keys().next().value;

            if (oldestKey) {
                this.currentSize -= this.cache.get(oldestKey)!.size;
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, { value, size });
        this.currentSize += size;
    }
}

// 256MB cache
export const fileCache = new LRUCache(256 * 1024 * 1024);