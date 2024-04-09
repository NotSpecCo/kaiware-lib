export function isJson(data: string): boolean {
	try {
		JSON.parse(data);
	} catch (error) {
		return false;
	}

	return true;
}
