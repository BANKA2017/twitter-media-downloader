const DynamicAttr = (attr: { [p in string]: boolean }) =>
    Object.entries(attr)
        .filter((x) => x[1])
        .map((x) => x[0])
        .join(' ');
const Download = (url: string, fileName: string) => {
    let element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
export { DynamicAttr, Download };
