import { getObjectKeys } from './getObjectKeys';

export function makeSerializable(obj: object, spaces = 2): object {
	const newObj: { [key: string]: unknown } = {};

	const keys = getObjectKeys(obj);
	keys.forEach((key) => {
		newObj[key] = (obj as { [key: string]: unknown })[key];
	});

	return JSON.parse(JSON.stringify(newObj, null, spaces));
}
