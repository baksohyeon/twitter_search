import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Calendar,
  User,
  MessageCircle,
  Repeat,
  Heart,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { cn, generateTwitterUrl } from '@/lib/utils'

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

      return parts.join(' ')
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
  }

  const clearAll = () => {
    setCriteria(initialCriteria)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopiedQuery(query)
      setTimeout(() => setCopiedQuery(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openInTwitter = () => {
    if (query) {
      window.open(generateTwitterUrl(query), '_blank')
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-blue-600 flex items-center justify-center gap-2">
              <Search className="h-8 w-8" />
              Twitter Search Generator
            </h1>
            <p className="text-gray-600 text-lg">
              Build powerful Twitter search queries with ease
            </p>
          </div>

          {/* Main Form */}
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Search Criteria
              </CardTitle>
              <CardDescription>
                Start with the fundamental search parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromUser" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    From User
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Tweets written by this specific user
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="fromUser"
                    placeholder="e.g., rjfjdqoddl"
                    value={criteria.fromUser}
                    onChange={(e) => updateCriteria('fromUser', e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toUser" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    To User
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Tweets sent to this specific user
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="toUser"
                    placeholder="e.g., username"
                    value={criteria.toUser}
                    onChange={(e) => updateCriteria('toUser', e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sinceDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Since Date
                  </Label>
                  <Input
                    id="sinceDate"
                    type="date"
                    value={criteria.sinceDate}
                    onChange={(e) => updateCriteria('sinceDate', e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="untilDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Until Date
                  </Label>
                  <Input
                    id="untilDate"
                    type="date"
                    value={criteria.untilDate}
                    onChange={(e) => updateCriteria('untilDate', e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minRetweets" className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Min Retweets
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Tweets with at least this many retweets (popular content)
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="minRetweets"
                    type="number"
                    placeholder="e.g., 100"
                    min="0"
                    value={criteria.minRetweets}
                    onChange={(e) => updateCriteria('minRetweets', e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minLikes" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Min Likes
                  </Label>
                  <Input
                    id="minLikes"
                    type="number"
                    placeholder="e.g., 50"
                    min="0"
                    value={criteria.minLikes}
                    onChange={(e) => updateCriteria('minLikes', e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full md:w-auto"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-6 border-t pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="exactPhrase">Exact Phrase</Label>
                      <Input
                        id="exactPhrase"
                        placeholder="e.g., machine learning"
                        value={criteria.exactPhrase}
                        onChange={(e) => updateCriteria('exactPhrase', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hashtag">Hashtag</Label>
                      <Input
                        id="hashtag"
                        placeholder="e.g., AI (without #)"
                        value={criteria.hashtag}
                        onChange={(e) => updateCriteria('hashtag', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="anyWords">Any of These Words</Label>
                      <Input
                        id="anyWords"
                        placeholder="e.g., react vue angular"
                        value={criteria.anyWords}
                        onChange={(e) => updateCriteria('anyWords', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excludeWords">Exclude Words</Label>
                      <Input
                        id="excludeWords"
                        placeholder="e.g., spam ads"
                        value={criteria.excludeWords}
                        onChange={(e) => updateCriteria('excludeWords', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filter Checkboxes */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nativeRetweets"
                        checked={criteria.nativeRetweets}
                        onCheckedChange={(checked) => updateCriteria('nativeRetweets', !!checked)}
                      />
                      <Label htmlFor="nativeRetweets">Native Retweets</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasImages"
                        checked={criteria.hasImages}
                        onCheckedChange={(checked) => updateCriteria('hasImages', !!checked)}
                      />
                      <Label htmlFor="hasImages">Has Images</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasVideos"
                        checked={criteria.hasVideos}
                        onCheckedChange={(checked) => updateCriteria('hasVideos', !!checked)}
                      />
                      <Label htmlFor="hasVideos">Has Videos</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasLinks"
                        checked={criteria.hasLinks}
                        onCheckedChange={(checked) => updateCriteria('hasLinks', !!checked)}
                      />
                      <Label htmlFor="hasLinks">Has Links</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={criteria.verified}
                        onCheckedChange={(checked) => updateCriteria('verified', !!checked)}
                      />
                      <Label htmlFor="verified">Verified Users</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRetweet"
                        checked={criteria.isRetweet}
                        onCheckedChange={(checked) => updateCriteria('isRetweet', !!checked)}
                      />
                      <Label htmlFor="isRetweet">Include Retweets</Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Query Display */}
          <Card className="border-2 border-green-100 shadow-xl">
            <CardHeader className="bg-green-50/50">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Generated Search Query
              </CardTitle>
              <CardDescription>
                Copy this query and paste it into Twitter's search box
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <div 
                    className={cn(
                      "bg-gray-50 border-2 border-gray-200 rounded-lg p-4 font-mono text-sm min-h-[60px] flex items-center",
                      query ? "text-gray-900" : "text-gray-400"
                    )}
                  >
                    {query || "Your search query will appear here..."}
                  </div>
                  {copiedQuery === query && query && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Copied!
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={copyToClipboard}
                    disabled={!query}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Query
                  </Button>
                  
                  <Button 
                    onClick={openInTwitter}
                    disabled={!query}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Twitter
                  </Button>
                  
                  <Button 
                    onClick={clearAll}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="border border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Twitter Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Popular Use Cases:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Find viral tweets with min retweets: 1000+</li>
                  <li>• Search user's old tweets by date range</li>
                  <li>• Find mentions of specific topics</li>
                  <li>• Discover trending hashtags</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pro Tips:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use 100+ retweets to find quality content</li>
                  <li>• Combine filters for precise results</li>
                  <li>• Try different date ranges for trends</li>
                  <li>• Exclude spam with negative keywords</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}