import { describe, expect, it } from 'vitest';
import { isJson } from './isJson';

describe('isJson', () => {
	const testCases = [
		['{"a": 1}', true],
		['{"a": "1"}', true],
		['{"a": "1', false],
		['{"a": 1', false],
		['{a: 1}', false],
		['{a: "1"}', false],
		['{a: "1}', false],
		['a', false]
	];

	it.each(testCases)(`should test %s`, (json, expected) => {
		const result = isJson(json);
		expect(result).toBe(expected);
	});
});
