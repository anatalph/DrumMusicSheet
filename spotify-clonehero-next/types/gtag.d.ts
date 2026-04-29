// Centralized window.gtag declaration. Consumers (analytics facade,
// consent banner) share one type so there's no risk of conflicting
// `declare global` blocks.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export {};
