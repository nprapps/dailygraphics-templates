module.exports = {
  isMobile: window.matchMedia("(max-width: 500px)"),
  isDesktop: window.matchMedia("(min-width: 501px)"),
  hasTouchscreen: window.matchMedia("(hover: none), (pointer: coarse)"),
  hasHover: window.matchMedia("(hover: hover) and (pointer: fine)")
};