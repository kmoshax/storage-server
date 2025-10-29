import type { File } from '../../prisma/generated/client';

export class LRUCache<Key, Value> {
	private capacity: number;
	private cache: Map<Key, Value>;

	constructor(capacity: number = 100) {
		this.capacity = capacity;
		this.cache = new Map<Key, Value>();
	}

	get(key: Key): Value | undefined {
		if (!this.cache.has(key)) return undefined;

		const value = this.cache.get(key);

		this.cache.delete(key);
		this.cache.set(key, value as Value);

		return value;
	}

	set(key: Key, value: Value): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		} else if (this.cache.size >= this.capacity) {
			// remove the least recently used item (the first one)
			const firstKey = this.cache.keys().next().value;

			this.cache.delete(firstKey as Key);
		}

		this.cache.set(key, value);
	}

	delete(key: Key): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

export const fileMetadataCache = new LRUCache<string, File>(200);
