const ScrollTo = (top: number | Element | Event | null = 0): void => {
	if (typeof top === 'number' || top?.target) {
		if (typeof top === 'number') {
			top = 0;
		}
		window.scrollTo({
			top,
			behavior: 'smooth'
		});
	} else if (top !== null) {
		top.scrollIntoView({ behavior: 'smooth' });
	}
};

// @ts-ignore
export const ScrollToHere = (e) => {
	if (e.target) {
		ScrollTo(e.target);
	}
};

export default ScrollTo;
