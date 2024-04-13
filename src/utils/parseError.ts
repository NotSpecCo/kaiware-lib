export function parseError(err: Error | ErrorEvent): object {
	return JSON.parse(
		JSON.stringify(err, [
			'message',
			'type',
			'name',
			'stack',
			'fileName',
			'lineNumber',
			'columnNumber'
		])
	);
}
