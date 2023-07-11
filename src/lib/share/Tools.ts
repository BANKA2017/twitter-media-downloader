const DynamicAttr = (attr: { [p in string]: boolean }) =>
	Object.entries(attr)
		.filter((x) => x[1])
		.map((x) => x[0])
		.join(' ');

export { DynamicAttr };
