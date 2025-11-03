declare module "redis-mock" {
	interface RedisClient {
		get(
			key: string,
			callback: (err: Error | null, reply: string | null) => void,
		): void;
		set(
			key: string,
			value: string,
			...args: Array<string | number | ((err: Error | null) => void)>
		): void;
		del(
			key: string,
			callback: (err: Error | null, reply: number) => void,
		): void;
		setex(
			key: string,
			ttl: number,
			value: string,
			callback: (err: Error | null) => void,
		): void;
		flushall(callback: (err: Error | null) => void): void;
	}

	export function createClient(): RedisClient;
}
