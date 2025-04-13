
export function isValidDashFormat(str: string): boolean {
	try {
		const parsed = JSON.parse(str);
		return (
			Array.isArray(parsed) &&
			parsed.length === 2 &&
			typeof parsed[0] === 'number' &&
			typeof parsed[1] === 'number'
		);
	} catch (e) {
		return false;
	}
}