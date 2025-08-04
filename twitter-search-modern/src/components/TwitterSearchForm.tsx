import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { TooltipProvider } from './ui/tooltip'
import { cn, generateTwitterUrl } from '@/lib/utils'
import { 
  trackSearchQuery, 
  trackQueryCopy, 
  trackTwitterOpen, 
  trackFieldUsage, 
  trackAdvancedToggle, 
  trackClearAll 
} from '@/lib/analytics'

interface SearchCriteria {
  fromUser: string
  toUser: string
  mentionsUser: string
  sinceDate: string
  untilDate: string
  minRetweets: string
  minLikes: string
  minReplies: string
  exactPhrase: string
  anyWords: string
  excludeWords: string
  hashtag: string
  language: string
  nativeRetweets: boolean
  hasImages: boolean
  hasVideos: boolean
  hasLinks: boolean
  verified: boolean
  isRetweet: boolean
}

const initialCriteria: SearchCriteria = {
  fromUser: '',
  toUser: '',
  mentionsUser: '',
  sinceDate: new Date().toISOString().split('T')[0],
  untilDate: new Date().toISOString().split('T')[0],
  minRetweets: '',
  minLikes: '',
  minReplies: '',
  exactPhrase: '',
  anyWords: '',
  excludeWords: '',
  hashtag: '',
  language: '',
  nativeRetweets: false,
  hasImages: false,
  hasVideos: false,
  hasLinks: false,
  verified: false,
  isRetweet: false,
}

const useGenerateQuery = (criteria: SearchCriteria) => {
  return useQuery({
    queryKey: ['twitterQuery', criteria],
    queryFn: () => {
      const parts: string[] = []

      if (criteria.fromUser) parts.push(`from:${criteria.fromUser}`)
      if (criteria.toUser) parts.push(`to:${criteria.toUser}`)
      if (criteria.mentionsUser) parts.push(`@${criteria.mentionsUser}`)
      if (criteria.exactPhrase) parts.push(`"${criteria.exactPhrase}"`)
      if (criteria.anyWords) parts.push(`(${criteria.anyWords.split(' ').join(' OR ')})`)
      if (criteria.excludeWords) parts.push(`-${criteria.excludeWords.split(' ').join(' -')}`)
      if (criteria.hashtag) parts.push(`#${criteria.hashtag}`)
      if (criteria.sinceDate) parts.push(`since:${criteria.sinceDate}`)
      if (criteria.untilDate) parts.push(`until:${criteria.untilDate}`)
      if (criteria.minRetweets) parts.push(`min_retweets:${criteria.minRetweets}`)
      if (criteria.minLikes) parts.push(`min_faves:${criteria.minLikes}`)
      if (criteria.minReplies) parts.push(`min_replies:${criteria.minReplies}`)
      if (criteria.language) parts.push(`lang:${criteria.language}`)
      
      if (criteria.nativeRetweets) parts.push('filter:nativeretweets')
      if (criteria.hasImages) parts.push('filter:images')
      if (criteria.hasVideos) parts.push('filter:videos')
      if (criteria.hasLinks) parts.push('filter:links')
      if (criteria.verified) parts.push('filter:verified')
      if (criteria.isRetweet) parts.push('filter:retweets')

      const query = parts.join(' ')
      
      // Track query generation
      if (query) {
        const queryType = parts.length > 3 ? 'complex' : 'simple'
        trackSearchQuery(queryType, query.length)
      }

      return query
    },
    enabled: true,
    staleTime: 0,
  })
}

export default function TwitterSearchForm() {
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria)
  const [copiedQuery, setCopiedQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const { data: query = '' } = useGenerateQuery(criteria)

  const updateCriteria = (field: keyof SearchCriteria, value: string | boolean) => {
    setCriteria(prev => ({ ...prev, [field]: value }))
    trackFieldUsage(field)
  }

  const clearAll = () => {
    setCriteria(initialCriteria)
    trackClearAll()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopiedQuery(query)
      trackQueryCopy(query.length)
      setTimeout(() => setCopiedQuery(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openInTwitter = () => {
    if (query) {
      window.open(generateTwitterUrl(query), '_blank')
      trackTwitterOpen()
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <Search className="h-7 w-7 text-primary" />
              Twitter Search Builder
            </h1>
            <p className="text-muted-foreground">
              Create advanced Twitter search queries easily
            </p>
          </div>

          {/* Main Form */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Search Criteria</CardTitle>
              <CardDescription>
                Fill in the fields you want to search by
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromUser">From User</Label>
                  <Input
                    id="fromUser"
                    placeholder="user id"
                    value={criteria.fromUser}
                    onChange={(e) => updateCriteria('fromUser', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exactPhrase">Exact Phrase</Label>
                  <Input
                    id="exactPhrase"
                    placeholder="exact words to find"
                    value={criteria.exactPhrase}
                    onChange={(e) => updateCriteria('exactPhrase', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sinceDate">From Date</Label>
                  <Input
                    id="sinceDate"
                    type="date"
                    value={criteria.sinceDate}
                    onChange={(e) => updateCriteria('sinceDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="untilDate">To Date</Label>
                  <Input
                    id="untilDate"
                    type="date"
                    value={criteria.untilDate}
                    onChange={(e) => updateCriteria('untilDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minRetweets">Min Retweets</Label>
                  <Input
                    id="minRetweets"
                    type="number"
                    placeholder="100"
                    min="0"
                    value={criteria.minRetweets}
                    onChange={(e) => updateCriteria('minRetweets', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minLikes">Min Likes</Label>
                  <Input
                    id="minLikes"
                    type="number"
                    placeholder="50"
                    min="0"
                    value={criteria.minLikes}
                    onChange={(e) => updateCriteria('minLikes', e.target.value)}
                  />
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newValue = !showAdvanced
                    setShowAdvanced(newValue)
                    trackAdvancedToggle(newValue)
                  }}
                >
                  {showAdvanced ? 'Less Options' : 'More Options'}
                </Button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hashtag">Hashtag</Label>
                      <Input
                        id="hashtag"
                        placeholder="AI (without #)"
                        value={criteria.hashtag}
                        onChange={(e) => updateCriteria('hashtag', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excludeWords">Exclude Words</Label>
                      <Input
                        id="excludeWords"
                        placeholder="spam ads"
                        value={criteria.excludeWords}
                        onChange={(e) => updateCriteria('excludeWords', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filter Checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nativeRetweets"
                        checked={criteria.nativeRetweets}
                        onCheckedChange={(checked) => updateCriteria('nativeRetweets', !!checked)}
                      />
                      <Label htmlFor="nativeRetweets" className="text-sm">리트윗만 보기</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasImages"
                        checked={criteria.hasImages}
                        onCheckedChange={(checked) => updateCriteria('hasImages', !!checked)}
                      />
                      <Label htmlFor="hasImages" className="text-sm">Has Images</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasVideos"
                        checked={criteria.hasVideos}
                        onCheckedChange={(checked) => updateCriteria('hasVideos', !!checked)}
                      />
                      <Label htmlFor="hasVideos" className="text-sm">Has Videos</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasLinks"
                        checked={criteria.hasLinks}
                        onCheckedChange={(checked) => updateCriteria('hasLinks', !!checked)}
                      />
                      <Label htmlFor="hasLinks" className="text-sm">Has Links</Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Query Display */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Your Search Query</CardTitle>
              <CardDescription>
                Copy and paste this into Twitter's search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div 
                  className={cn(
                    "bg-muted rounded-lg p-4 font-mono text-sm min-h-[80px] flex items-center",
                    query ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {query || "Your search query will appear here..."}
                </div>
                {copiedQuery === query && query && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                    Copied!
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={copyToClipboard}
                  disabled={!query}
                  size="sm"
                >
                  Copy
                </Button>
                
                <Button 
                  onClick={openInTwitter}
                  disabled={!query}
                  variant="outline"
                  size="sm"
                >
                  Open in Twitter
                </Button>
                
                <Button 
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </TooltipProvider>
  )
}