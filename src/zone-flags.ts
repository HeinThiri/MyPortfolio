/**
 * Zone.js configuration — MUST be loaded before `zone.js` (see angular.json
 * polyfills order).
 *
 * By default zone.js monkey-patches `addEventListener`, which can drop the
 * `{ passive: false }` flag that Lenis sets on its wheel/touch listeners. The
 * browser then refuses Lenis's `preventDefault()` call:
 *   "Unable to preventDefault inside passive event listener invocation."
 *
 * Listing these high-frequency events as UNPATCHED tells zone.js to use the
 * native `addEventListener` for them, so the original options (passive:false)
 * are preserved. Bonus: these events no longer run inside Angular's zone, so
 * they never trigger change detection — a real performance win for smooth
 * scrolling, the WebGL pointer parallax and the custom cursor.
 */
(window as unknown as Record<string, string[]>)['__zone_symbol__UNPATCHED_EVENTS'] = [
  'scroll',
  'wheel',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'pointermove',
  'pointerover',
  'pointerout',
  'pointerenter',
  'pointerleave',
  'mousemove',
];
