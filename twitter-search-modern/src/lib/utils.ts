import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-')
}

export function generateTwitterUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query)
    return `https://twitter.com/search?q=${encodedQuery}&src=typed_query&f=live`
}

// Analytics utility functions

/**
 * Debounce function for analytics events to prevent spam
 */
export function debounceAnalytics<T extends (...args: any[]) => void>(
    func: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }
}

/**
 * Generate unique session identifier
 */
export function generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
}

/**
 * Get device and browser information for analytics
 */
export function getDeviceInfo(): {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    colorDepth: number;
    timezone: string;
    cookieEnabled: boolean;
    onlineStatus: boolean;
} {
    if (typeof window === 'undefined') {
        return {
            userAgent: 'unknown',
            platform: 'unknown',
            language: 'unknown',
            screenResolution: 'unknown',
            colorDepth: 0,
            timezone: 'unknown',
            cookieEnabled: false,
            onlineStatus: false
        }
    }

    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || 'unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
    }
}

/**
 * Calculate page performance metrics
 */
export function getPerformanceMetrics(): {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number | null;
    largestContentfulPaint: number | null;
    cumulativeLayoutShift: number | null;
    firstInputDelay: number | null;
} {
    if (typeof window === 'undefined' || !window.performance) {
        return {
            loadTime: 0,
            domContentLoaded: 0,
            firstContentfulPaint: null,
            largestContentfulPaint: null,
            cumulativeLayoutShift: null,
            firstInputDelay: null
        }
    }

    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    // Core Web Vitals
    let firstContentfulPaint: number | null = null
    let largestContentfulPaint: number | null = null
    let cumulativeLayoutShift: number | null = null
    let firstInputDelay: number | null = null

    // Get FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcpEntry) {
        firstContentfulPaint = fcpEntry.startTime
    }

    // Get LCP
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        largestContentfulPaint = lastEntry.startTime
    })

    try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
        // LCP not supported
    }

    return {
        loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        firstInputDelay
    }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get connection information
 */
export function getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
} {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
        return {
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0,
            saveData: false
        }
    }

    const connection = (navigator as any).connection
    return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
    }
}

/**
 * Generate user fingerprint for analytics (privacy-friendly)
 */
export function generateUserFingerprint(): string {
    if (typeof window === 'undefined') return 'unknown'

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'unknown'

    // Create a simple canvas fingerprint
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Analytics fingerprint', 2, 2)

    const canvasData = canvas.toDataURL()

    // Combine with other non-PII data
    const fingerprint = [
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.language,
        new Date().getTimezoneOffset(),
        canvasData.slice(-50) // Last 50 chars of canvas data
    ].join('|')

    // Create hash
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36)
}

/**
 * Format analytics data for transmission
 */
export function formatAnalyticsPayload(data: Record<string, unknown>): Record<string, unknown> {
    const deviceInfo = getDeviceInfo()
    const connectionInfo = getConnectionInfo()

    return {
        ...data,
        timestamp: new Date().toISOString(),
        session_id: sessionStorage.getItem('analytics_session_id') || generateSessionId(),
        user_fingerprint: generateUserFingerprint(),
        device_info: deviceInfo,
        connection_info: connectionInfo,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer || 'direct'
    }
}

/**
 * Validate analytics event data
 */
export function validateAnalyticsEvent(eventName: string, parameters: Record<string, unknown>): boolean {
    // Basic validation
    if (!eventName || typeof eventName !== 'string') {
        console.warn('Invalid analytics event name:', eventName)
        return false
    }

    if (eventName.length > 40) {
        console.warn('Analytics event name too long:', eventName)
        return false
    }

    // Check for PII in parameters
    const piiPatterns = [
        /email/i,
        /password/i,
        /ssn/i,
        /credit.?card/i,
        /phone/i,
        /@.*\./
    ]

    const paramString = JSON.stringify(parameters)
    for (const pattern of piiPatterns) {
        if (pattern.test(paramString)) {
            console.warn('Potential PII detected in analytics data:', eventName)
            return false
        }
    }

    return true
}

/**
 * Batch analytics events for better performance
 */
export class AnalyticsBatcher {
    private batch: Array<{ eventName: string; parameters: Record<string, unknown>; timestamp: number }> = []
    private batchSize = 10
    private flushInterval = 5000 // 5 seconds
    private flushTimer: ReturnType<typeof setTimeout> | null = null

    constructor(private sendFunction: (events: any[]) => void) {
        this.startFlushTimer()
    }

    addEvent(eventName: string, parameters: Record<string, unknown>) {
        if (!validateAnalyticsEvent(eventName, parameters)) {
            return
        }

        this.batch.push({
            eventName,
            parameters: formatAnalyticsPayload(parameters),
            timestamp: Date.now()
        })

        if (this.batch.length >= this.batchSize) {
            this.flush()
        }
    }

    flush() {
        if (this.batch.length === 0) return

        const eventsToSend = [...this.batch]
        this.batch = []

        this.sendFunction(eventsToSend)
        this.resetFlushTimer()
    }

    private startFlushTimer() {
        this.flushTimer = setTimeout(() => {
            this.flush()
            this.startFlushTimer()
        }, this.flushInterval)
    }

    private resetFlushTimer() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer)
        }
        this.startFlushTimer()
    }

    destroy() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer)
        }
        this.flush() // Send any remaining events
    }
}

/**
 * Privacy-compliant data collection
 */
export function shouldCollectAnalytics(): boolean {
    if (typeof window === 'undefined') return false

    // Check for Do Not Track
    if (navigator.doNotTrack === '1') {
        return false
    }

    // Check for user consent (you might want to implement a consent banner)
    const consent = localStorage.getItem('analytics_consent')
    if (consent === 'false') {
        return false
    }

    // Default to true if consent is not explicitly denied
    return true
}