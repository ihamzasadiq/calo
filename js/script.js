if (document.getElementById('my-work-link')) {
  document.getElementById('my-work-link').addEventListener('click', () => {
    document.getElementById('my-work-section').scrollIntoView({behavior: "smooth"})
  })
}

const originStory = document.querySelector('.origin-story')

if (originStory) {
  const video = originStory.querySelector('.origin-story-video')
  const phone = originStory.querySelector('.origin-story-phone')
  const soundButton = originStory.querySelector('.origin-story-sound')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const safelyPlayVideo = () => {
    const playAttempt = video.play()

    if (playAttempt) {
      playAttempt.catch(() => {})
    }
  }

  const updateSoundButton = () => {
    const isMuted = video.muted
    soundButton.classList.toggle('is-muted', isMuted)
    soundButton.setAttribute('aria-label', isMuted ? 'Play with sound' : 'Mute video')
    soundButton.setAttribute('aria-pressed', String(!isMuted))
  }

  soundButton.addEventListener('click', (event) => {
    event.stopPropagation()
    video.muted = !video.muted
    updateSoundButton()
    safelyPlayVideo()
  })

  video.addEventListener('click', () => {
    if (video.muted) {
      video.muted = false
      updateSoundButton()
    }

    safelyPlayVideo()
  })

  updateSoundButton()

  if (!prefersReducedMotion.matches && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger)
    gsap.set(phone, { autoAlpha: 0, y: 28 })

    let hasRevealed = false

    ScrollTrigger.create({
      trigger: phone,
      start: 'top 65%',
      end: 'bottom 35%',
      onEnter: () => {
        if (!hasRevealed) {
          hasRevealed = true
          gsap.to(phone, { autoAlpha: 1, duration: 0.65, ease: 'power2.out', y: 0 })
        }

        safelyPlayVideo()
      },
      onEnterBack: safelyPlayVideo,
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    })
  }
}
