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