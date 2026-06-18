/*
Component: test
Webflow attribute: data-component="test"
*/

import '../style.css'

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='test']
 */
export default function (elements) {
  // Init: runs when the component loads
  console.log(
    `%c✅ [test] Component loaded — ${elements.length} element(s)`,
    'color: #22c55e; font-weight: bold'
  )
  elements.forEach((element) => {
    console.log(element)
  })

  // Return lifecycle hooks (optional)
  return {
    // Runs on window resize (debounced 150ms)
    resize() {},

    // Runs when crossing a Webflow breakpoint (1920/1440/1280/992/768/480)
    // breakpoint(current, previous) {},
  }
}
