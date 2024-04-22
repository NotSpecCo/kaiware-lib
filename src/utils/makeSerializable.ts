import { getObjectKeys } from './getObjectKeys';

export function makeSerializable(obj: object, spaces = 2): object {
	const newObj: { [key: string]: unknown } = {};

	const keys = getObjectKeys(obj);
	keys.forEach((key) => {
		const val = (obj as { [key: string]: unknown })[key];
		newObj[key] = typeof val === 'function' ? `${val.name}()` : val;
	});

	return JSON.parse(JSON.stringify(newObj, keys, spaces));
}
