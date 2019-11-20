/**
 * SVG related utilities
 */

/**
 * Parse and return svg element
 * @param {String} s svg string
 */
export function parseSVG (s) {
  const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'
  const frag = document.createDocumentFragment()
  while (div.firstChild.firstChild) {
    frag.appendChild(div.firstChild.firstChild)
  }
  return frag
}
