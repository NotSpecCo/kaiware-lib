export function isJson(data: unknown): boolean {
	try {
		JSON.parse(data as string);
	} catch (error) {
		return false;
	}

	return true;
}
