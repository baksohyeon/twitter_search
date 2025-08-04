import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import TwitterSearchForm from './components/TwitterSearchForm'
import { initializeAnalytics, trackUserJourney } from './lib/analytics'
import { shouldCollectAnalytics } from './lib/utils'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  useEffect(() => {
    // Initialize analytics if user consent is given
    if (shouldCollectAnalytics()) {
      try {
        initializeAnalytics()
        
        // Track app initialization
        trackUserJourney('app_start', {
          app_version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString()
        })
        
        // Track when user leaves the page
        const handleBeforeUnload = () => {
          trackUserJourney('app_exit', {
            session_duration: Date.now() - parseInt(sessionStorage.getItem('session_start') || '0', 10),
            page_views: parseInt(sessionStorage.getItem('session_page_views') || '1', 10)
          })
        }
        
        window.addEventListener('beforeunload', handleBeforeUnload)
        
        // Track visibility changes
        const handleVisibilityChange = () => {
          if (document.hidden) {
            trackUserJourney('page_hidden', {
              hidden_time: Date.now()
            })
          } else {
            trackUserJourney('page_visible', {
              visible_time: Date.now()
            })
          }
        }
        
        document.addEventListener('visibilitychange', handleVisibilityChange)
        
        // Cleanup event listeners
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
      } catch (error) {
        console.warn('Analytics initialization failed:', error)
      }
    } else {
      console.log('Analytics disabled by user preference or Do Not Track')
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TwitterSearchForm />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default App
