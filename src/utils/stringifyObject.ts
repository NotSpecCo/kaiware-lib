import { getObjectKeys } from './getObjectKeys';

export function stringifyObject(obj: object, spaces = 2): string {
	const keys = getObjectKeys(obj);
	return JSON.stringify(obj, keys, spaces);
}
