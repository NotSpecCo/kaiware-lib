import { CommandStep, ConsoleCommand } from '../types';

export function parseConsoleCommand(command: string): ConsoleCommand {
	const steps = command.match(/(\w+\[\d+\])|(\w+\([^)]*\))|(\w+)/g);
	const result: CommandStep[] = [];

	steps?.forEach((step) => {
		let matches;
		if ((matches = step.match(/^(\w+)\((.*)\)$/))) {
			result.push(createStep('function', matches as RegExpMatchArray));
		} else if ((matches = step.match(/^(\w+)\[(.*?)\]$/))) {
			result.push(createStep('array', matches as RegExpMatchArray));
		} else {
			result.push({
				type: 'property',
				value: step,
				params: []
			});
		}
	});

	return {
		steps: result
	};
}

function createStep(type: CommandStep['type'], matches: RegExpMatchArray): CommandStep {
	return {
		type,
		value: matches[1] as string,
		params: parseParams(matches[2] as string)
	};
}

function parseParams(paramString: string): unknown[] {
	const matches = paramString.match(/(\d+)|('[^']*')|("[^"]*")|(\[[^\]]*\])|({[^}]*})/g);
	if (!matches) return [];

	return matches.map((match) => {
		if (match.startsWith('[') || match.startsWith('{')) {
			return JSON.parse(match);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} else if (!isNaN(match as any)) {
			return Number(match);
		} else {
			return match.slice(1, -1);
		}
	});
}
