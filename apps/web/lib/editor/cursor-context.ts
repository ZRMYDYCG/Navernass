const NATIVE_CURSOR_SELECTORS = [
  'button',
  'a[href]',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  'label[for]',
  'select',
  'input',
  'textarea',
  'summary',
  '[data-panel-resize-handle-id]',
  '.ProseMirror',
  '[contenteditable="true"]',
  '.cursor-pointer',
  '.cursor-text',
  '.cursor-col-resize',
  '.cursor-row-resize',
  '.cursor-grab',
  '.cursor-grabbing',
  '.cursor-crosshair',
  '.cursor-not-allowed',
  '.cursor-move',
  '.cursor-help',
  '.cursor-wait',
  '.cursor-progress',
  '.cursor-zoom-in',
  '.cursor-zoom-out',
  '.cursor-alias',
  '.cursor-copy',
  '.cursor-no-drop',
  '.cursor-cell',
] as const

function elementUsesNativeCursor(element: Element) {
  if (element.matches(':disabled, [aria-disabled="true"]')) {
    return element.classList.contains('cursor-not-allowed')
      || element.classList.contains('cursor-pointer')
      || element.matches('button, input, select, textarea')
  }

  for (const selector of NATIVE_CURSOR_SELECTORS) {
    if (element.matches(selector)) {
      return true
    }
  }

  for (const className of element.classList) {
    if (className.startsWith('cursor-') && className !== 'cursor-auto') {
      return true
    }
  }

  return false
}

function isTextSelectionDrag(event: PointerEvent, container: HTMLElement) {
  if (event.buttons === 0) return false

  const target = event.target
  if (!(target instanceof Element) || !container.contains(target)) {
    return false
  }

  return Boolean(target.closest('.ProseMirror, input, textarea, [contenteditable="true"], select'))
}

export function shouldUseNativeCursor(
  event: PointerEvent,
  container: HTMLElement,
): boolean {
  const target = event.target
  if (!(target instanceof Element) || !container.contains(target)) {
    return true
  }

  if (isTextSelectionDrag(event, container)) {
    return true
  }

  let current: Element | null = target
  while (current && current !== container) {
    if (elementUsesNativeCursor(current)) {
      return true
    }
    current = current.parentElement
  }

  return false
}
