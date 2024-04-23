import { getObjectKeys } from './getObjectKeys';

export function makeSerializable(obj: unknown, depth = 0): unknown {
	if (
		typeof obj === 'string' ||
		typeof obj === 'number' ||
		typeof obj === 'boolean' ||
		obj === null ||
		obj === undefined
	) {
		return obj;
	}

	const result: { [key: string]: unknown } = {};

	const keys = getObjectKeys(obj);
	keys.forEach((key) => {
		const val = (obj as { [key: string]: unknown })[key];
		if (val && typeof val === 'function') {
			result[key] = `function()`;
		} else if (Array.isArray(val) && depth > 0) {
			result[key] = val.map((v) => makeSerializable(v, depth - 1));
		} else if (val && typeof val === 'object' && depth > 0) {
			result[key] = makeSerializable(val, depth - 1);
		} else {
			result[key] = val;
		}
	});

	return result;
}
