export function getVisibleYouTubeVideo(): HTMLVideoElement | null {
	const videos = Array.from(
		document.querySelectorAll('video'),
	) as HTMLVideoElement[]

	for (const video of videos) {
		const rect = video.getBoundingClientRect()
		const visible =
			rect.width > 100 &&
			rect.height > 100 &&
			rect.top < window.innerHeight &&
			rect.bottom > 0 &&
			getComputedStyle(video).visibility !== 'hidden' &&
			getComputedStyle(video).display !== 'none' &&
			video.offsetParent !== null

		// YouTube’s main player video is usually largest and visible
		if (visible) return video
	}

	return null
}

export function isShorts() {
	return window.location.href.includes('shorts')
}

export function getVideoId() {
	var urlParams = new URLSearchParams(window.location.search)
	return urlParams.get('v')
}

export function waitUntilVideoIsAvailable(
	timeoutMs = 10000,
): Promise<HTMLVideoElement> {
	return new Promise((resolve, reject) => {
		const start = Date.now()

		const interval = setInterval(() => {
			const video = getVisibleYouTubeVideo()
			if (video) {
				clearInterval(interval)
				clearTimeout(timeout)
				resolve(video)
			} else if (Date.now() - start >= timeoutMs) {
				clearInterval(interval)
				reject(new Error('Video not found within timeout'))
			}
		}, 300)

		const timeout = setTimeout(() => {
			clearInterval(interval)
			reject(new Error('Video not found within timeout'))
		}, timeoutMs)
	})
}

export function getHidablePlayerElements() {
	const moviePlayer = document.querySelector('#movie_player')
	if (moviePlayer) {
		return moviePlayer.querySelectorAll<HTMLElement>(
			'.ytp-chrome-bottom, .ytp-gradient-bottom, .ytp-player-content, .ytp-gradient-top, .ytp-chrome-top, .ytp-overlay-top-left, .ytp-chrome-bottom, .ytp-overlay-bottom-right',
		)
	}
	return []
}

export function previousShort() {
	const button = document.querySelector(
		'#navigation-button-up yt-touch-feedback-shape',
	) as HTMLElement
	if (button) {
		button.click()
		return true
	}
	return false
}

export function nextShort() {
	const button = document.querySelector(
		'#navigation-button-down yt-touch-feedback-shape',
	) as HTMLElement
	if (button) {
		button.click()
		return true
	}
	return false
}

export function isValidYouTubeUrl(url: string): boolean {
	try {
		const parsed = new URL(url)

		if (
			!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(parsed.hostname)
		) {
			return false
		}

		if (parsed.hostname === 'youtu.be') {
			return !!parsed.pathname.slice(1)
		}

		if (parsed.hostname.includes('youtube.com')) {
			const videoId = parsed.searchParams.get('v')
			if (videoId && /^[\w-]{11}$/.test(videoId)) return true

			// support /shorts/<id>
			const pathParts = parsed.pathname.split('/')
			const shortId = pathParts[pathParts.indexOf('shorts') + 1]
			return !!shortId && /^[\w-]{11}$/.test(shortId)
		}

		return false
	} catch {
		return false
	}
}

export function extractYouTubeId(input: string): string | null {
	if (!input) return null

	// Case 1: it's already an ID
	if (/^[\w-]{11}$/.test(input)) {
		return input
	}

	try {
		const url = new URL(input)

		if (url.hostname === 'youtu.be') {
			const id = url.pathname.slice(1)
			return /^[\w-]{11}$/.test(id) ? id : null
		}

		if (url.hostname.includes('youtube.com')) {
			const id = url.searchParams.get('v')
			if (id && /^[\w-]{11}$/.test(id)) return id

			const parts = url.pathname.split('/')
			const shortsIndex = parts.indexOf('shorts')
			if (shortsIndex !== -1) {
				const shortId = parts[shortsIndex + 1]
				if (shortId && /^[\w-]{11}$/.test(shortId)) {
					return shortId
				}
			}
		}

		return null
	} catch {
		return null
	}
}

export function buildYouTubeUrl(id: string, time: number): string {
	return `https://www.youtube.com/watch?v=${id}&t=${Math.floor(time)}s`
}

export function toggleSubtitles() {
	const button = document.querySelector<HTMLElement>(
		'.ytp-subtitles-button-icon',
	)
	if (button) {
		button.click()
	}
}
