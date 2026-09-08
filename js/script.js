const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

document.documentElement.classList.add('has-js')

const progressIndicator = document.querySelector('.nav-progress > span')

const updateScrollProgress = () => {
  if (!progressIndicator) {
    return
  }

  const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollableDistance > 0 ? Math.min(window.scrollY / scrollableDistance, 1) : 0
  progressIndicator.style.transform = `scaleX(${progress})`
}

if (progressIndicator) {
  updateScrollProgress()
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  window.addEventListener('resize', updateScrollProgress)
}

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

  const prewarmVideo = () => {
    if (video.dataset.prewarmed) {
      return
    }

    video.dataset.prewarmed = 'true'
    video.preload = 'auto'
    video.load()
  }

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

    const preloadObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prewarmVideo()
          observer.unobserve(entry.target)
        }
      })
    }, { rootMargin: '900px 0px' })

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

    preloadObserver.observe(originStory)
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

  const setActiveJourneyItem = (activeItem) => {
    const activeIndex = Array.from(journeyItems).indexOf(activeItem)

    journeyItems.forEach((item, index) => {
      item.classList.toggle('is-active', index === activeIndex)
      item.classList.toggle('is-complete', index < activeIndex)
    })
  }

  const visibleJourneyItems = new Set()

  const journeyStateObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleJourneyItems.add(entry.target)
      } else {
        visibleJourneyItems.delete(entry.target)
      }
    })

    const currentJourneyItems = Array.from(visibleJourneyItems)
      .sort((first, second) => Math.abs(first.getBoundingClientRect().top) - Math.abs(second.getBoundingClientRect().top))

    if (currentJourneyItems.length) {
      setActiveJourneyItem(currentJourneyItems[0])
    }
  }, { rootMargin: '-28% 0px -54% 0px', threshold: 0 })

  journeyItems.forEach((item) => journeyStateObserver.observe(item))
} else if (journeyItems.length) {
  journeyItems[0].classList.add('is-active')
}

const lightbox = document.querySelector('.image-lightbox')
const lightboxImage = lightbox?.querySelector('.lightbox-image')
const lightboxClose = lightbox?.querySelector('.lightbox-close')
let lightboxTrigger = null
let lightboxCloseTimer = null

if (lightbox && lightboxImage && lightboxClose) {
  document.querySelectorAll('[data-lightbox-source]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lightboxTrigger = trigger
      lightboxImage.src = trigger.dataset.lightboxSource
      lightboxImage.alt = trigger.dataset.lightboxAlt || ''
      lightbox.classList.remove('is-closing')
      lightbox.showModal()
      lightboxClose.focus()
    })
  })

  const closeLightbox = () => {
    if (lightboxCloseTimer || !lightbox.open) {
      return
    }

    if (prefersReducedMotion.matches) {
      lightbox.close()
      return
    }

    lightbox.classList.add('is-closing')
    lightboxCloseTimer = window.setTimeout(() => {
      lightbox.close()
      lightboxCloseTimer = null
    }, 220)
  }

  lightboxClose.addEventListener('click', closeLightbox)

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox()
    }
  })

  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeLightbox()
  })

  lightbox.addEventListener('close', () => {
    window.clearTimeout(lightboxCloseTimer)
    lightboxCloseTimer = null
    lightbox.classList.remove('is-closing')
    lightboxImage.removeAttribute('src')
    lightboxImage.alt = ''
    lightboxTrigger?.focus()
  })
}

const currentYear = document.getElementById('current-year')

if (currentYear) {
  currentYear.textContent = new Date().getFullYear()
}
