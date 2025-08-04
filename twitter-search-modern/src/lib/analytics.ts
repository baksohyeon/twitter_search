// Advanced Google Analytics 4 (GA4) utility functions

declare global {
  interface Window {
    gtag: (command: string, action: string, parameters?: Record<string, unknown>) => void;
    dataLayer: Array<Record<string, unknown>>;
  }
}

// Enhanced event tracking with GA4 parameters
export const trackEvent = (
  action: string,
  parameters?: {
    category?: string;
    label?: string;
    value?: number;
    currency?: string;
    custom_parameters?: Record<string, unknown>;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventParams: Record<string, unknown> = {
      event_category: parameters?.category || 'general',
      event_label: parameters?.label,
      value: parameters?.value,
      currency: parameters?.currency || 'KRW',
      timestamp: new Date().toISOString(),
      page_title: document.title,
      page_location: window.location.href,
      ...parameters?.custom_parameters
    };

    // Remove undefined values
    Object.keys(eventParams).forEach(key => {
      if (eventParams[key] === undefined) {
        delete eventParams[key];
      }
    });

    window.gtag('event', action, eventParams);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Analytics Event:', action, eventParams);
    }
  }
};

// Enhanced page view tracking
export const trackPageView = (pagePath?: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title,
      page_location: window.location.href
    });
  }
};

// User engagement tracking
export const trackEngagement = (engagementType: string, details?: Record<string, unknown>) => {
  trackEvent('user_engagement', {
    category: 'engagement',
    label: engagementType,
    custom_parameters: {
      engagement_time_msec: Date.now(),
      session_id: sessionStorage.getItem('analytics_session_id') || 'unknown',
      ...details
    }
  });
};

// Specific event tracking functions

// Track search query generation with detailed parameters
export const trackSearchQuery = (queryType: string, queryLength: number) => {
  trackEvent('generate_query', {
    category: 'search',
    label: queryType,
    value: queryLength,
    custom_parameters: {
      query_complexity: queryLength > 50 ? 'complex' : 'simple',
      query_type: queryType,
      estimated_results: queryLength > 100 ? 'narrow' : 'broad'
    }
  });
};

// Track query copying with success metrics
export const trackQueryCopy = (queryLength: number) => {
  trackEvent('copy_query', {
    category: 'interaction',
    label: 'copy_success',
    value: queryLength,
    custom_parameters: {
      copy_method: 'clipboard_api',
      query_length_category: queryLength < 50 ? 'short' : queryLength < 100 ? 'medium' : 'long'
    }
  });
};

// Track Twitter opening with referral info
export const trackTwitterOpen = () => {
  trackEvent('open_twitter', {
    category: 'external_navigation',
    label: 'twitter_redirect',
    custom_parameters: {
      destination: 'twitter.com',
      action_type: 'search_redirect',
      user_intent: 'execute_search'
    }
  });
};

// Track form field usage with detailed interaction data
export const trackFieldUsage = (fieldName: string) => {
  trackEvent('form_interaction', {
    category: 'user_input',
    label: fieldName,
    custom_parameters: {
      field_name: fieldName,
      field_type: getFieldType(fieldName),
      form_section: getFormSection(fieldName),
      interaction_time: Date.now()
    }
  });
};

// Track advanced options toggle with usage patterns
export const trackAdvancedToggle = (isOpen: boolean) => {
  trackEvent('interface_interaction', {
    category: 'ui_toggle',
    label: isOpen ? 'advanced_open' : 'advanced_close',
    custom_parameters: {
      toggle_state: isOpen,
      user_level: isOpen ? 'advanced' : 'basic',
      session_advanced_usage: getAdvancedUsageCount()
    }
  });
};

// Track clear all action with context
export const trackClearAll = () => {
  trackEvent('form_reset', {
    category: 'user_action',
    label: 'clear_all_fields',
    custom_parameters: {
      fields_cleared: getActiveFieldsCount(),
      reset_reason: 'user_initiated',
      time_since_last_change: getTimeSinceLastChange()
    }
  });
};

// Performance and Core Web Vitals tracking
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    trackEvent('performance_metrics', {
      category: 'site_performance',
      label: 'page_load',
      value: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
      custom_parameters: {
        dns_time: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
        connect_time: Math.round(perfData.connectEnd - perfData.connectStart),
        response_time: Math.round(perfData.responseEnd - perfData.responseStart),
        dom_load_time: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        total_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart)
      }
    });
  }
};

// Error tracking
export const trackError = (error: Error, errorInfo?: Record<string, unknown>) => {
  trackEvent('application_error', {
    category: 'error',
    label: error.name,
    custom_parameters: {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      error_type: error.name,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...errorInfo
    }
  });
};

// User journey tracking
export const trackUserJourney = (step: string, data?: Record<string, unknown>) => {
  trackEvent('user_journey', {
    category: 'user_flow',
    label: step,
    custom_parameters: {
      journey_step: step,
      session_duration: getSessionDuration(),
      steps_completed: getCompletedSteps(),
      ...data
    }
  });
};

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', {
    category: 'goal_completion',
    label: conversionType,
    value: value,
    custom_parameters: {
      conversion_type: conversionType,
      conversion_value: value,
      time_to_conversion: getTimeToConversion(),
      session_page_views: getSessionPageViews()
    }
  });
};

// Helper functions for analytics data
function getFieldType(fieldName: string): string {
  const typeMap: Record<string, string> = {
    'fromUser': 'text',
    'exactPhrase': 'text',
    'sinceDate': 'date',
    'untilDate': 'date',
    'minRetweets': 'number',
    'minLikes': 'number',
    'hashtag': 'text',
    'excludeWords': 'text',
    'nativeRetweets': 'checkbox',
    'hasImages': 'checkbox',
    'hasVideos': 'checkbox',
    'hasLinks': 'checkbox'
  };
  return typeMap[fieldName] || 'unknown';
}

function getFormSection(fieldName: string): string {
  const sectionMap: Record<string, string> = {
    'fromUser': 'user_content',
    'exactPhrase': 'user_content',
    'sinceDate': 'date_range',
    'untilDate': 'date_range',
    'minRetweets': 'engagement',
    'minLikes': 'engagement',
    'hashtag': 'advanced',
    'excludeWords': 'advanced',
    'nativeRetweets': 'filters',
    'hasImages': 'filters',
    'hasVideos': 'filters',
    'hasLinks': 'filters'
  };
  return sectionMap[fieldName] || 'unknown';
}

function getAdvancedUsageCount(): number {
  const count = sessionStorage.getItem('advanced_usage_count');
  return count ? parseInt(count, 10) : 0;
}

function getActiveFieldsCount(): number {
  // This would be implemented based on your form state
  return 0; // Placeholder
}

function getTimeSinceLastChange(): number {
  const lastChange = sessionStorage.getItem('last_form_change');
  return lastChange ? Date.now() - parseInt(lastChange, 10) : 0;
}

function getSessionDuration(): number {
  const sessionStart = sessionStorage.getItem('session_start');
  return sessionStart ? Date.now() - parseInt(sessionStart, 10) : 0;
}

function getCompletedSteps(): number {
  const steps = sessionStorage.getItem('completed_steps');
  return steps ? parseInt(steps, 10) : 0;
}

function getTimeToConversion(): number {
  const conversionStart = sessionStorage.getItem('conversion_start');
  return conversionStart ? Date.now() - parseInt(conversionStart, 10) : 0;
}

function getSessionPageViews(): number {
  const pageViews = sessionStorage.getItem('session_page_views');
  return pageViews ? parseInt(pageViews, 10) : 1;
}

// Initialize analytics session
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Set session ID
    if (!sessionStorage.getItem('analytics_session_id')) {
      sessionStorage.setItem('analytics_session_id', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }

    // Set session start time
    if (!sessionStorage.getItem('session_start')) {
      sessionStorage.setItem('session_start', Date.now().toString());
    }

    // Initialize page view counter
    const currentPageViews = parseInt(sessionStorage.getItem('session_page_views') || '0', 10);
    sessionStorage.setItem('session_page_views', (currentPageViews + 1).toString());

    // Track page view
    trackPageView();

    // Track performance after load
    if (document.readyState === 'complete') {
      setTimeout(trackPerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(trackPerformance, 1000);
      });
    }

    // Track errors
    window.addEventListener('error', (event) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      trackError(new Error('Unhandled Promise Rejection'), {
        reason: event.reason
      });
    });
  }
};