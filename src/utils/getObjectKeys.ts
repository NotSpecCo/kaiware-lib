export function getObjectKeys(obj: object): string[] {
	const keys: string[] = [];
	for (const key in obj) {
		keys.push(key);
	}
	return keys;
}
