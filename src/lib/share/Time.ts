const getPubDate = (date: Date | string = new Date()): string => {
	if (typeof date === 'string') {
		date = new Date(date.replaceAll('-', '/'));
	}
	return (
		dayToShortString[date.getUTCDay()] +
		', ' +
		date.getUTCDate().toString().padStart(2, '0') +
		' ' +
		monthToShortString[date.getUTCMonth()] +
		' ' +
		date.getUTCFullYear() +
		' ' +
		date.getUTCHours().toString().padStart(2, '0') +
		':' +
		date.getUTCMinutes().toString().padStart(2, '0') +
		':' +
		date.getUTCSeconds().toString().padStart(2, '0') +
		' GMT'
	);
};

const dayToShortString: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthToShortString: string[] = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

export { getPubDate, dayToShortString, monthToShortString };
