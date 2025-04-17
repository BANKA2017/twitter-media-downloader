const toDataView = (arrayBuffer: ArrayBuffer | unknown) => {
    //const arrayBuffer = new ArrayBuffer(buffer.length);
    //const view = new Uint8Array(arrayBuffer);
    //for (let i = 0; i < buffer.length; ++i) {
    //	view[i] = buffer[i];
    //}
    try {
        // @ts-ignore
        return new DataView(arrayBuffer)
    } catch (e) {
        console.log(e)
        return new DataView(new ArrayBuffer(0))
    }
}

const arrayBufferUint8HexIndexOf = (content: Uint8Array, find: number[] = [], offset = 0): number => {
    if (find.length < 0 || find.length > content.byteLength || offset > content.byteLength) {
        return -1
    }
    while (true) {
        const firstWord = content.indexOf(find[0], offset)
        if (firstWord === -1) {
            return -1
        } else if (!find.slice(1).some((findItem, index) => content.indexOf(findItem, offset) !== firstWord + index + 1)) {
            return firstWord
        } else if (offset > content.byteLength) {
            return -1
        } else {
            offset++
        }
    }
}
export type id3FrameParserType = ['PRIV' | 'TXXX' | 'TIT3' | unknown, number, ArrayBuffer, ArrayBuffer | string | object]
const id3FrameParser = (content: ArrayBuffer): id3FrameParserType[] => {
    //console.log(content)
    if (content.byteLength <= 0) {
        return []
    }
    const realContent = content.slice(10)
    let offset = 0
    const frameList: id3FrameParserType[] = []

    while (offset <= realContent.byteLength) {
        const type = [...new Uint8Array(realContent.slice(offset, offset + 4))].map((x) => String.fromCharCode(x)).join('')
        const size = [...new Uint8Array(realContent.slice(offset + 4, offset + 8))].reduce((a, b) => (a << 7) + b, 0)
        const flags = realContent.slice(offset + 8, offset + 10)
        //const encodeType = new Uint8Array(realContent)[10];
        const isText = ['TXXX', 'TIT3'].includes(type)
        const tmpFrameContent = realContent.slice(offset + 10 + (isText ? 1 : 0), offset + 10 + size)
        const frameContent = isText
            ? [...new Uint8Array(tmpFrameContent)]
                  .map((x) => String.fromCharCode(x))
                  .join('')
                  .slice(0, -1)
            : tmpFrameContent //.split("\x00").slice(0, -1)//realContent.slice(offset + 10)

        if (type) {
            switch (type) {
                case 'TXXX':
                    //@ts-ignore
                    let tmpFrameContent = frameContent.split('\x00')
                    try {
                        tmpFrameContent[1] = JSON.parse(tmpFrameContent[1])
                    } catch (e) {}

                    frameList.push([type, size, flags, tmpFrameContent])
                    break
                //case 'TIT3':
                default:
                    frameList.push([type, size, flags, frameContent])
            }
        }

        //console.log([...(new Uint8Array(frameContent))].map(x => String.fromCharCode(x)).join(''))
        offset += 10 + size
    }
    return frameList
}

const concatBuffer = (bufferList: ArrayBuffer[]) => {
    const bufferByteLength = bufferList.reduce((a, b) => a + b.byteLength, 0)
    return bufferList.reduce<[Uint8Array, number]>(
        (a, b) => {
            a[0].set(new Uint8Array(b), a[1])
            return [a[0], a[1] + b.byteLength || 0]
        },
        [new Uint8Array(bufferByteLength), 0]
    )[0]
}

export { toDataView, arrayBufferUint8HexIndexOf, id3FrameParser, concatBuffer }
