import { describe, expect, test } from 'vitest';
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

	test.each(testCases)(`%s`, (json, expected) => {
		const result = isJson(json);
		expect(result).toBe(expected);
	});
});
