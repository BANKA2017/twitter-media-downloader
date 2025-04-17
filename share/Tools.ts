import Noty from 'noty'

export const Notice = (text: string = '', type: Noty.Type = 'success', timeout: number = 1500) => {
    new Noty({
        text,
        type,
        timeout,
        theme: 'nest',
        layout: 'topRight',
        progressBar: true,
        closeWith: ['click']
    }).show()
}

export const DynamicAttr = (attr: { [p in string]: boolean }) =>
    Object.entries(attr)
        .filter((x) => x[1])
        .map((x) => x[0])
        .join(' ')

export const Download = (url: string, fileName: string) => {
    let element = document.createElement('a')
    element.setAttribute('href', url)
    element.setAttribute('download', fileName)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}
