const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const navigationToggle = document.querySelector('.nav-toggle')
const navigation = document.querySelector('.site-navigation')

if (navigationToggle && navigation) {
  const setNavigationState = (isOpen) => {
    navigation.classList.toggle('is-open', isOpen)
    navigationToggle.setAttribute('aria-expanded', String(isOpen))
    navigationToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation')
    navigationToggle.textContent = isOpen ? 'Close' : 'Menu'
  }

  navigationToggle.addEventListener('click', () => {
    setNavigationState(!navigation.classList.contains('is-open'))
  })

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavigationState(false))
  })
}

const originStory = document.querySelector('.origin-story')

if (originStory) {
  const video = originStory.querySelector('.origin-story-video')
  const phone = originStory.querySelector('.origin-story-phone')
  const soundButton = originStory.querySelector('.origin-story-sound')
  let hasStarted = false

  const safelyPlayVideo = () => {
    const playAttempt = video.play()

    if (playAttempt) {
      playAttempt.catch(() => {
        originStory.dataset.autoplayBlocked = 'true'
      })
    }
  }

  const updateSoundButton = () => {
    const isMuted = video.muted
    soundButton.classList.toggle('is-muted', isMuted)
    soundButton.setAttribute('aria-label', isMuted ? 'Play video with sound' : 'Mute video')
    soundButton.setAttribute('aria-pressed', String(!isMuted))
  }

  const startOrResumeVideo = () => {
    if (video.ended) {
      return
    }

    hasStarted = true
    safelyPlayVideo()
  }

  updateSoundButton()

  soundButton.addEventListener('click', () => {
    video.muted = !video.muted
    updateSoundButton()
    startOrResumeVideo()
  })

  video.addEventListener('click', () => {
    startOrResumeVideo()
  })

  if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
    phone.classList.add('is-pending-reveal')

    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          phone.classList.remove('is-pending-reveal')

          if (!video.ended && (!hasStarted || video.paused)) {
            startOrResumeVideo()
          }
        } else if (!video.paused) {
          video.pause()
        }
      })
    }, { threshold: 0.45 })

    storyObserver.observe(originStory)
  }
}

const journeyItems = document.querySelectorAll('.journey-item')

if (!prefersReducedMotion.matches && 'IntersectionObserver' in window && journeyItems.length) {
  journeyItems.forEach((item) => item.classList.add('is-pending-reveal'))

  const journeyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending-reveal')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.18 })

  journeyItems.forEach((item) => journeyObserver.observe(item))
}

const lightbox = document.querySelector('.image-lightbox')
const lightboxImage = lightbox?.querySelector('.lightbox-image')
const lightboxClose = lightbox?.querySelector('.lightbox-close')
let lightboxTrigger = null

if (lightbox && lightboxImage && lightboxClose) {
  document.querySelectorAll('[data-lightbox-source]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lightboxTrigger = trigger
      lightboxImage.src = trigger.dataset.lightboxSource
      lightboxImage.alt = trigger.dataset.lightboxAlt || ''
      lightbox.showModal()
      lightboxClose.focus()
    })
  })

  const closeLightbox = () => {
    lightbox.close()
  }

  lightboxClose.addEventListener('click', closeLightbox)

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox()
    }
  })

  lightbox.addEventListener('close', () => {
    lightboxImage.removeAttribute('src')
    lightboxImage.alt = ''
    lightboxTrigger?.focus()
  })
}

const currentYear = document.getElementById('current-year')

if (currentYear) {
  currentYear.textContent = new Date().getFullYear()
}
