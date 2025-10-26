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
			'.ytp-chrome-bottom, .ytp-gradient-bottom, .ytp-player-content, .ytp-gradient-top, .ytp-chrome-top',
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
