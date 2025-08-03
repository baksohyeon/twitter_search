// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Event tracking for user interactions
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track search query generation
export const trackSearchQuery = (queryType: string, queryLength: number) => {
  trackEvent('generate_query', 'search', queryType, queryLength);
};

// Track query copying
export const trackQueryCopy = (queryLength: number) => {
  trackEvent('copy_query', 'interaction', 'copy', queryLength);
};

// Track Twitter opening
export const trackTwitterOpen = () => {
  trackEvent('open_twitter', 'external', 'twitter_redirect');
};

// Track form field usage
export const trackFieldUsage = (fieldName: string) => {
  trackEvent('use_field', 'form', fieldName);
};

// Track advanced options toggle
export const trackAdvancedToggle = (isOpen: boolean) => {
  trackEvent('toggle_advanced', 'interface', isOpen ? 'open' : 'close');
};

// Track clear all action
export const trackClearAll = () => {
  trackEvent('clear_all', 'interaction', 'reset');
};