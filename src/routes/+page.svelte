<script lang="ts">
	import { Parser } from 'm3u8-parser';
	import { onMount } from 'svelte';
	import DarkButton from '$lib/components/DarkButton.svelte';
	import { PUBLIC_BASEPATH } from '$env/static/public';
	let metaData;
	let m3u8Prefix = '';
	let src = '';
	let count = 0;
	let firstTimeCursor = 0;

	let spaceInfo = {};

	const sourceOpen = async () => {
		let bufferList = [],
			aacBuffer;
		for (const index in metaData.manifest.segments) {
			//if (index < 1990) {continue}

			count = Number(index) + 1;
			const segment = metaData.manifest.segments[index];
			const mediaBuffer = await (
				await fetch(PUBLIC_BASEPATH + '/media/proxy/' + m3u8Prefix + segment.uri)
			).arrayBuffer();

			let tmpBuffer = toDataView(mediaBuffer);
			let cursor = 0;
			let offset = 0;

			do {
				cursor = arrayBufferUint8HexIndexOf(
					new Uint8Array(tmpBuffer.buffer),
					[0x49, 0x44, 0x33],
					cursor
				);

				//TODO precheck version and others
				//bufferList.push(Buffer.from([0xFF, 0xF1, 0x4C, 0x80, 0x20, 0x02, 0x80, 0x21]))
				if (cursor === -1) {
					bufferList.push(tmpBuffer.buffer.slice(offset));
					break;
				} else if (cursor > offset) {
					bufferList.push(tmpBuffer.buffer.slice(offset, cursor));
				}
				let size = 0;
				for (let sizeOffset = 0; sizeOffset < 4; sizeOffset++) {
					size =
						(size << 7) +
						new Uint8Array(
							tmpBuffer.buffer.slice(cursor + 6 + sizeOffset, cursor + 7 + sizeOffset)
						)[0];
				}
				if (size < 0 || size > tmpBuffer.byteLength) {
					offset = cursor;
					cursor++;
					continue;
				}
				size += 10;
				const id3 = id3FrameParser(tmpBuffer.buffer.slice(cursor, cursor + size));
				frameInfoList = frameInfoList.concat([id3]);
				offset = cursor += size;

				console.log(index);
				//bufferList.push(tmpBuffer.buffer.slice(offset))
				//break
			} while (true);
		}
		const bufferByteLength = bufferList.reduce((a, b) => a + b.byteLength, 0);
		aacBuffer = bufferList.reduce(
			(a, b) => {
				a[0].set(new Uint8Array(b), a[1]);
				return [a[0], a[1] + b.byteLength || 0];
			},
			[new Uint8Array(bufferByteLength), 0]
		)[0];
		src = URL.createObjectURL(new Blob([aacBuffer], { type: 'audio/aac' }));
		frameInfoList = frameInfoList
			.map((frame) => frame.filter((frameItem) => ['TIT3', 'TXXX'].includes(frameItem[0])))
			.filter((x) => x.length > 0)
			.map((x) =>
				Object.fromEntries(
					x.map((y) => [
						y[0] === 'TIT3' ? 'currentTime' : y[3][0],
						y[0] === 'TIT3' ? Number(y[3]) : y[3][1]
					])
				)
			);
	};

	function toDataView(arrayBuffer) {
		//const arrayBuffer = new ArrayBuffer(buffer.length);
		//const view = new Uint8Array(arrayBuffer);
		//for (let i = 0; i < buffer.length; ++i) {
		//	view[i] = buffer[i];
		//}
		return new DataView(arrayBuffer);
	}

	const arrayBufferUint8HexIndexOf = (content, find = [], offset = 0) => {
		if (find.length < 0 || find.length > content.byteLength || offset > content.byteLength) {
			return -1;
		}
		while (true) {
			const firstWord = content.indexOf(find[0], offset);
			if (firstWord === -1) {
				return -1;
			} else if (
				!find
					.slice(1)
					.some((findItem, index) => content.indexOf(findItem, offset) !== firstWord + index + 1)
			) {
				return firstWord;
			} else if (offset > content.byteLength) {
				return -1;
			} else {
				offset++;
			}
		}
	};

	const id3FrameParser = (content) => {
		//console.log(content)
		if (content.byteLength <= 0) {
			return [];
		}
		const realContent = content.slice(10);
		let offset = 0;
		const frameList = [];

		while (offset <= realContent.byteLength) {
			const type = [...new Uint8Array(realContent.slice(offset, offset + 4))]
				.map((x) => String.fromCharCode(x))
				.join('');
			const size = [...new Uint8Array(realContent.slice(offset + 4, offset + 8))].reduce(
				(a, b) => (a << 7) + b,
				0
			);
			const flags = realContent.slice(offset + 8, offset + 10);
			const encodeType = new Uint8Array(realContent)[10];
			const isText = ['TXXX', 'TIT3'].includes(type);
			const tmpFrameContent = realContent.slice(
				offset + 10 + (isText !== false ? 1 : 0),
				offset + 10 + size
			);
			const frameContent = isText
				? [...new Uint8Array(tmpFrameContent)]
						.map((x) => String.fromCharCode(x))
						.join('')
						.slice(0, -1)
				: tmpFrameContent; //.split("\x00").slice(0, -1)//realContent.slice(offset + 10)

			if (type) {
				switch (type) {
					case 'TXXX':
						let tmpFrameContent = frameContent.split('\x00');
						try {
							tmpFrameContent[1] = JSON.parse(tmpFrameContent[1]);
						} catch (e) {}

						frameList.push([type, size, flags, tmpFrameContent]);
						break;
					case 'TIT3':
						if (firstTimeCursor === 0) {
							firstTimeCursor = Number(frameContent);
						}
					default:
						frameList.push([type, size, flags, frameContent]);
				}
			}

			//console.log([...(new Uint8Array(frameContent))].map(x => String.fromCharCode(x)).join(''))
			offset += 10 + size;
		}
		return frameList;
	};
	const getDate = (timestamp: number = 0) => {
		const tmpDate = new Date(timestamp);
		const monthName = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Set',
			'Oct',
			'Nov',
			'Dec'
		];
		//4:22 PM · 19 Aug, 2022
		return `${tmpDate.getHours()}:${tmpDate
			.getMinutes()
			.toString()
			.padStart(2, '0')} · ${tmpDate.getDate()} ${
			monthName[tmpDate.getMonth()]
		}, ${tmpDate.getFullYear()}`;
	};

	const getSpaceInfo = async (link) => {
		const id = ((match) => match?.[2] || match?.[1] || null)(
			/^(1\w+)$|\/(1\w+)(?:\?|#|$)/g.exec(link)
		);
		if (!id) {
			return;
		}
		try {
			spaceInfo = await (
				await fetch(`${PUBLIC_BASEPATH}/online/api/v3/data/audiospace/?id=${id}`)
			).json();
			console.log(spaceInfo);
			if (spaceInfo?.data?.playback) {
				m3u8Prefix =
					((x) => x.host + x.pathname)(new URL(spaceInfo.data.playback))
						.split('/')
						.slice(0, -1)
						.join('/') + '/';
				await getM3U8(spaceInfo.data.playback);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getM3U8 = async (link) => {
		if (!link) {
			return;
		}
		try {
			const m3u8Str = await (
				await fetch(`${PUBLIC_BASEPATH}/media/proxy/${link.replace(/http(?:s):\/\//g, '')}`)
			).text();
			let m3u8Parser = new Parser();
			m3u8Parser.push(m3u8Str);
			m3u8Parser.end();
			metaData = m3u8Parser;
			await sourceOpen();
		} catch (e) {
			console.log(e);
		}
	};

	let frameInfoList = [];
	let audioCurrentTime = 0;
	let spaceId = '';
	onMount(() => {
		const audioDom = document.getElementsByTagName('audio')[0]
		audioDom.addEventListener('timeupdate', e => {
			audioCurrentTime = e.target?.currentTime || 0
		})
	})
	$: percent = (count / (metaData?.manifest?.segments?.length || 0)) * 100;
	$: currentFrameInfo =
		frameInfoList.find((x) => x.currentTime > firstTimeCursor + audioCurrentTime) || {};
	$: participants = [
		...(spaceInfo?.data?.admins || []),
		...(currentFrameInfo?.HydraParticipants || []).map(
			(user) => spaceInfo.data.speakers.find((x) => x.name === user.UserName) || user
		)
	];
	//$: HydraAudioLevel = (() => {
	//	const tmpList = frameInfoList.filter(x => x.currentTime).map(x => ({currentTime: x.currentTime, HydraAudioLevel: x.HydraAudioLevel}))
	//	const tmpL = JSON.parse(JSON.stringify(new Array(spaceInfo.data.admins.length + spaceInfo.data.speakers.length + 1).fill([])))
	//	for (const index in tmpList) {
	//		tmpL[0].push(tmpList[index].currentTime)
	//		for (const index2 in tmpList[index].HydraAudioLevel) {
	//			tmpL[Number(index2) + 1].push(tmpList[index].HydraAudioLevel[index2])
	//		}
	//	}
	//	return tmpL
	//})()
</script>
<svelte:head>
	<title>Space</title>
	<meta name="description" content="Download space audio by pure js" />
</svelte:head>
<div class="flex justify-between py-5 lg:px-20 p-5">
	<div id="nav-title" class="text-3xl font-bold">
		Space <span class="ml-1 bg-sky-500 text-white text-sm px-2 rounded-full">beta</span>
	</div>
	<DarkButton />
</div>

<div class="grid grid-cols-12 p-3 md:p-10 gap-4">
	<div id="ad-1" class="col-span-12 md:col-span-2 text-center border-2">AD</div>
	<div class="col-span-12 md:col-span-8">
		{#if !spaceInfo?.data?.id}
			<div class="flex justify-between gap-3">
				<input
					type="text"
					class="form-input w-full rounded-xl h-[2em] md:h-[2.5em] dark:bg-black"
					bind:value={spaceId}
					placeholder="https://twitter.com/i/spaces/<ANY_VALUE>"
				/>
				<button
					class="px-4 rounded-xl bg-gray-200 dark:bg-gray-800"
					on:click={() => {
						if (!spaceId) {
							return;
						}
						getSpaceInfo(spaceId);
					}}>Go</button
				>
			</div>
		{/if}
		{#if spaceInfo?.data?.id}
			<div class="flex justify-between mb-2">
				<h4 class="text-2xl font-bold">{spaceInfo.data.title}</h4>
				<a
					href={'https://twitter.com/i/spaces/' + spaceInfo.data.id}
					target="_blank"
					class="inline-block mr-1 text-sm border-2 border-[#9C63FA] rounded-full max-w-[15em] h-6"
					><span class="bg-[#9C63FA] px-2 rounded-full text-white">Space</span><span
						class="text-black dark:text-white px-2">{spaceInfo.data.total}</span
					></a
				>
			</div>
			<div class="font-light">
				<span>Since {getDate(Number(spaceInfo.data.start))}</span>
				<span class="px-2 text-sm">{spaceInfo.data.state}</span>
			</div>
			<div
				class={'h-8 w-full text-center relative ' + (percent >= 100 ? 'hidden' : 'inline-block')}
			>
				<span class="absolute py-1 -translate-x-1/2 text-current"
					>{count} / {metaData?.manifest?.segments?.length || 0}</span
				>
				<div class="h-full bg-sky-500 rounded-xl" style={`width: ${percent}%;`} />
			</div>
			{#if src}
				<div class="grid grid-cols-3 md:grid-col-4 lg:grid-cols-6 gap-2">
					{#each participants as user, index}
						<a
							class="col-span-1 p-2 rounded-xl hover:text-white hover:bg-sky-500 dark:hover:bg-sky-800 transition-colors text-center"
							href={`https://twitter.com/${user.name || user.UserName}`}
							target="_blank"
						>
							<div class="flex justify-center w-full">
								<div class="relative">
									<div
										class={'absolute rounded-full bg-sky-500 p-1 -right-1 -bottom-1 ' +
											(currentFrameInfo?.HydraAudioLevel?.[index] || 0 ? 'inline-block' : 'hidden')}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="text-white"
											width="0.65rem"
											height="0.65rem"
											fill="currentColor"
											viewBox="0 0 16 16"
										>
											<path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
											<path
												d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"
											/>
										</svg>
									</div>
									<img
										class="rounded-full w-[50px]"
										src={(user.avatar || user.ProfileUrl).replace('_normal.', '.')}
										alt={user.display_name || user.UserName}
									/>
								</div>
							</div>
							<span class="block font-bold">{user.display_name || user.UserName}</span>
						</a>
					{/each}
				</div>
			{/if}
		{/if}
		<div class={"py-3 " + (src ? 'block' : 'hidden')}>
			<audio {src} controls class="w-full" />
		</div>
	</div>
	<div id="ad-2" class="col-span-12 md:col-span-2 text-center border-2">AD</div>
</div>
