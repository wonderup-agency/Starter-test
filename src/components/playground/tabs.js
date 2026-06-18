/*
Component: tabs
Webflow attribute: data-component="tabs"

Standalone auto-cycling tabs. No markup required in Webflow — the JS builds the
entire DOM. Panels transition with an expanding clip-path circle (GSAP).
Requires the global `gsap` (loaded via Webflow's CDN script).
*/

import './tabs.css'

// Demo content — standalone, no Webflow HTML needed.
const TABS = [
  {
    label: 'Discover',
    title: 'Discover',
    body: 'Auto-cycling tabs revealed with an expanding clip-path circle.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    label: 'Design',
    title: 'Design',
    body: 'Each panel grows from the centre out — pure GSAP, no CSS keyframes.',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
  },
  {
    label: 'Build',
    title: 'Build',
    body: 'Hover to pause. Click a tab to jump. The progress bar drives the timing.',
    gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
  },
  {
    label: 'Ship',
    title: 'Ship',
    body: 'Respects prefers-reduced-motion: the reveal is instant when requested.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
]

const AUTO_DELAY = 4 // seconds each tab stays on screen
const REVEAL_DURATION = 0.9

/**
 * Builds one tabs instance inside the given root element.
 * @param {HTMLElement} root
 */
function createTabs(root) {
  root.classList.add('pg-tabs')
  root.innerHTML = ''

  // --- Build stage + panels ---
  const stage = document.createElement('div')
  stage.className = 'pg-tabs__stage'

  const panels = TABS.map((tab) => {
    const panel = document.createElement('article')
    panel.className = 'pg-tabs__panel'
    panel.style.backgroundImage = tab.gradient
    panel.innerHTML = `
      <h3 class="pg-tabs__title">${tab.title}</h3>
      <p class="pg-tabs__body">${tab.body}</p>
    `
    stage.appendChild(panel)
    return panel
  })

  // --- Build nav ---
  const nav = document.createElement('div')
  nav.className = 'pg-tabs__nav'

  const buttons = []
  const progressBars = []

  TABS.forEach((tab, i) => {
    const btn = document.createElement('button')
    btn.className = 'pg-tabs__btn'
    btn.type = 'button'
    btn.textContent = tab.label

    const progress = document.createElement('span')
    progress.className = 'pg-tabs__progress'
    btn.appendChild(progress)

    btn.addEventListener('click', () => goTo(i))

    nav.appendChild(btn)
    buttons.push(btn)
    progressBars.push(progress)
  })

  root.appendChild(stage)
  root.appendChild(nav)

  // --- Animation state ---
  let current = -1
  let progressTween = null

  // Honour reduced-motion preference.
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const revealDuration = prefersReduced ? 0 : REVEAL_DURATION

  // Initial stacking: hide everything below.
  gsap.set(panels, { autoAlpha: 0, zIndex: 0 })
  gsap.set(progressBars, { scaleX: 0, transformOrigin: 'left center' })

  function killTimer() {
    if (progressTween) progressTween.kill()
  }

  function startTimer() {
    killTimer()
    gsap.set(progressBars, { scaleX: 0 })
    progressTween = gsap.to(progressBars[current], {
      scaleX: 1,
      duration: AUTO_DELAY,
      ease: 'none',
      onComplete: () => goTo((current + 1) % TABS.length),
    })
  }

  function goTo(index) {
    if (index === current) return
    const incoming = panels[index]

    // Active button state.
    buttons.forEach((b, i) => b.classList.toggle('is-active', i === index))

    // Bring the incoming panel to the top, reveal with an expanding circle.
    gsap.set(panels, { zIndex: 0 })
    gsap.set(incoming, { zIndex: 2, autoAlpha: 1 })
    gsap.fromTo(
      incoming,
      { clipPath: 'circle(0% at 50% 50%)' },
      {
        clipPath: 'circle(75% at 50% 50%)',
        duration: revealDuration,
        ease: 'power2.inOut',
        onComplete: () => {
          // Hide the panels now fully covered (keeps the stage clean).
          panels.forEach((p, i) => {
            if (i !== index) gsap.set(p, { autoAlpha: 0 })
          })
        },
      }
    )

    current = index
    startTimer()
  }

  // Pause on hover, resume on leave.
  root.addEventListener(
    'mouseenter',
    () => progressTween && progressTween.pause()
  )
  root.addEventListener(
    'mouseleave',
    () => progressTween && progressTween.play()
  )

  // Kick off.
  goTo(0)

  return { killTimer }
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='tabs']
 */
export default function (elements) {
  if (typeof gsap === 'undefined') {
    console.warn(
      '[tabs] GSAP not found — make sure the GSAP CDN script is loaded in Webflow.'
    )
    return
  }

  console.log(
    `%c🧪 [tabs] Playground loaded — ${elements.length} instance(s)`,
    'color: #8b5cf6; font-weight: bold'
  )

  const instances = elements.map((el) => createTabs(el))

  return {
    resize() {},
    // No destroy hook in the loader yet, but expose cleanup for completeness.
    destroy() {
      instances.forEach((inst) => inst.killTimer())
    },
  }
}
