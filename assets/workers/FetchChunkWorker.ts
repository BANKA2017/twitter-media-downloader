import { arrayBufferUint8HexIndexOf, concatBuffer, id3FrameParser, toDataView, type id3FrameParserType } from '~/share/Parser'

onmessage = async (e) => {
    //console.log(e)
    postMessage(await getAndParseBuffer(e.data.uri, e.data.index))
}

const getAndParseBuffer = async (uri: string, index: number = 0, justConcat = false) => {
    let mediaBuffer = null
    try {
        mediaBuffer = await (await fetch(uri)).arrayBuffer()
    } catch (e) {
        console.log(e)
        return { uri, index, bufferList: [], frameInfoList: [], err: e }
    }

    let tmpBuffer = toDataView(mediaBuffer)
    let cursor = 0
    let offset = 0

    let bufferList = []
    let frameInfoList: id3FrameParserType[] = []
    do {
        if (justConcat) {
            bufferList.push(tmpBuffer.buffer)
            break
        }
        cursor = arrayBufferUint8HexIndexOf(new Uint8Array(tmpBuffer.buffer), [0x49, 0x44, 0x33], cursor)

        //TODO precheck version and others
        //bufferList.push(Buffer.from([0xFF, 0xF1, 0x4C, 0x80, 0x20, 0x02, 0x80, 0x21]))
        if (cursor === -1) {
            bufferList.push(tmpBuffer.buffer.slice(offset))
            break
        } else if (cursor > offset) {
            bufferList.push(tmpBuffer.buffer.slice(offset, cursor))
        }
        let size = 0
        for (let sizeOffset = 0; sizeOffset < 4; sizeOffset++) {
            size = (size << 7) + new Uint8Array(tmpBuffer.buffer.slice(cursor + 6 + sizeOffset, cursor + 7 + sizeOffset))[0]
        }
        if (size < 0 || size > tmpBuffer.byteLength) {
            offset = cursor
            cursor++
            continue
        }
        size += 10
        const id3 = id3FrameParser(tmpBuffer.buffer.slice(cursor, cursor + size))
        //console.log(id3);
        // @ts-ignore
        frameInfoList = frameInfoList.concat([id3])
        offset = cursor += size

        //bufferList.push(tmpBuffer.buffer.slice(offset))
        //break
    } while (true)
    return { uri, index, bufferList: concatBuffer(bufferList), frameInfoList, err: null }
}
