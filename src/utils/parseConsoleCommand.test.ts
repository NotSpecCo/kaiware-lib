import { describe, expect, it } from 'vitest';
import { parseConsoleCommand } from './parseConsoleCommand';

describe('parseConsoleCommand', () => {
	const testCases = [
		[
			'prop1',
			{
				steps: [{ type: 'property', value: 'prop1', params: [] }]
			}
		],
		[
			'arr1[1]',
			{
				steps: [{ type: 'array', value: 'arr1', params: [1] }]
			}
		],
		[
			`arr1['1']`,
			{
				steps: [
					{ type: 'property', value: 'arr1', params: [] },
					{ type: 'property', value: '1', params: [] }
				]
			}
		],
		[
			`func1(1)`,
			{
				steps: [{ type: 'function', value: 'func1', params: [1] }]
			}
		],
		[
			`func1(1,'2',[3],{"x":4})`,
			{
				steps: [{ type: 'function', value: 'func1', params: [1, '2', [3], { x: 4 }] }]
			}
		],
		[
			`prop1.prop2.prop3`,
			{
				steps: [
					{ type: 'property', value: 'prop1', params: [] },
					{ type: 'property', value: 'prop2', params: [] },
					{ type: 'property', value: 'prop3', params: [] }
				]
			}
		],
		[
			'prop1.func1(1,2,3).arr[1].prop2',
			{
				steps: [
					{ type: 'property', value: 'prop1', params: [] },
					{ type: 'function', value: 'func1', params: [1, 2, 3] },
					{ type: 'array', value: 'arr', params: [1] },
					{ type: 'property', value: 'prop2', params: [] }
				]
			}
		],
		[
			`prop1.func1(1,'2',[3],{"x":4}).arr1[1].prop2`,
			{
				steps: [
					{ type: 'property', value: 'prop1', params: [] },
					{ type: 'function', value: 'func1', params: [1, '2', [3], { x: 4 }] },
					{ type: 'array', value: 'arr1', params: [1] },
					{ type: 'property', value: 'prop2', params: [] }
				]
			}
		],
		[
			`func1()[1].prop1`,
			{
				steps: [
					{ type: 'function', value: 'func1', params: [] },
					{ type: 'property', value: '1', params: [] },
					{ type: 'property', value: 'prop1', params: [] }
				]
			}
		]
	];

	it.each(testCases)(`should parse '%s'`, (commandStr, expected) => {
		const result = parseConsoleCommand(commandStr as string);
		expect(result).toEqual(expected);
	});
});
