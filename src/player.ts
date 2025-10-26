import {getHidablePlayerElements, isShorts} from './index.js'

export const PlayerState = {
	UNSTARTED: -1,
	ENDED: 0,
	PLAYING: 1,
	PAUSED: 2,
	BUFFERING: 3,
	CUED: 5,
} as const

type VideoType = HTMLVideoElement | (() => HTMLVideoElement | null) | null

export class YouTubePlayer {
	#video: VideoType
	#areControlsVisible = true

	constructor(video: VideoType) {
		this.#video = video
	}

	get video() {
		if (typeof this.#video === 'function') {
			return this.#video()!
		} else {
			return this.#video!
		}
	}

	get FPS(): number | null {
		const quality = this.video.getVideoPlaybackQuality?.()
		if (!quality) return null

		// Rough estimate of FPS
		return quality.totalVideoFrames / (this.video.currentTime || 1)
	}

	get isPlaying() {
		return !this.video.paused
	}

	play() {
		this.video.play()
	}
	pause() {
		this.video.pause()
	}
	togglePlay() {
		if (this.isPlaying) {
			this.pause()
		} else {
			this.play()
		}
	}

	resumeLive() {
		const liveBadge = document.querySelector<HTMLElement>('.ytp-live-badge')
		if (liveBadge) {
			if (!liveBadge.classList.contains('ytp-live-badge-is-livehead')) {
				liveBadge.click()
			}
		}
	}

	hideControls() {
		getHidablePlayerElements().forEach((el) => (el.style.visibility = 'hidden'))
	}
	showControls() {
		getHidablePlayerElements().forEach(
			(el) => (el.style.visibility = 'initial'),
		)
	}
	toggleControls() {
		if (this.#areControlsVisible) {
			this.hideControls()
			this.#areControlsVisible = false
		} else {
			this.showControls()
			this.#areControlsVisible = true
		}
	}

	rewind(s?: number) {
		if (s === undefined && !isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowLeft',
					code: 'ArrowLeft',
					keyCode: 37,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			this.video.currentTime -= s ?? 5
		}
	}
	fastforward(s?: number) {
		if (s === undefined && !isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowRight',
					code: 'ArrowRight',
					keyCode: 39,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			this.video.currentTime += s ?? 5
		}
	}
	oneFrameBack() {
		if (!isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: ',',
					code: 'Comma',
					keyCode: 188,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			const fps = this.FPS
			if (!fps) return
			this.rewind(1 / fps)
		}
	}

	oneFrameForward() {
		if (!isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: '.',
					code: 'Period',
					keyCode: 190,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			const fps = this.FPS
			if (!fps) return
			this.fastforward(1 / fps)
		}
	}

	setSpeed(playbackRate: number) {
		this.video.playbackRate = playbackRate
	}

	decreaseSpeed(rate?: number) {
		if (rate === undefined && !isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: '<',
					code: 'Comma',
					keyCode: 188,
					shiftKey: true,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			this.video.playbackRate -= rate ?? 0.25
		}
	}
	increaseSpeed(rate?: number) {
		if (rate === undefined && !isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: '>',
					code: 'Period',
					keyCode: 190,
					shiftKey: true,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			this.video.playbackRate += rate ?? 0.25
		}
	}

	volumeUp(increment = 0.1) {
		if (!isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowUp',
					code: 'ArrowUp',
					keyCode: 38,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			this.video.volume = Math.min(1, this.video.volume + increment)
		}
	}

	volumeDown(increment = 0.1) {
		if (!isShorts()) {
			this.video.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowDown',
					code: 'ArrowDown',
					keyCode: 40,
					bubbles: true,
					cancelable: true,
				}),
			)
		} else {
			this.video.volume = Math.max(0, this.video.volume - increment)
		}
	}

	fullscreen(resume = true) {
		if (document.fullscreenElement) {
			document.exitFullscreen()
		} else {
			// this.videoElement.requestFullscreen()
			this.video.querySelector<HTMLElement>('.ytp-fullscreen-button')?.click()
		}
		if (resume) {
			this.play()
		}
	}

	toggleSubtitles() {
		this.video.querySelector<HTMLElement>('.ytp-subtitles-button')?.click()
	}
}
