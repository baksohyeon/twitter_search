import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  User, 
  Calendar, 
  Hash, 
  MessageSquare, 
  Image, 
  Video, 
  Link, 
  Copy, 
  ExternalLink, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Repeat2,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'
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
  smartSearch: string // 새로운 통합 검색 필드
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
  smartSearch: '',
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

// 스마트 검색어 파싱 함수 (OR 조건 기본)
const parseSmartSearch = (smartSearch: string): string[] => {
  if (!smartSearch.trim()) return []
  
  const items = smartSearch.split(',').map(item => item.trim()).filter(Boolean)
  
  if (items.length === 0) return []
  if (items.length === 1) return [items[0]]
  
  // 여러 항목이 있으면 OR 조건으로 묶기
  return [`(${items.join(' OR ')})`]
}

const useGenerateQuery = (criteria: SearchCriteria) => {
  return useQuery({
    queryKey: ['twitterQuery', criteria],
    queryFn: () => {
      const parts: string[] = []

      // 스마트 검색어 처리
      if (criteria.smartSearch) {
        const smartParts = parseSmartSearch(criteria.smartSearch)
        parts.push(...smartParts)
      }

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
  const [showSmartSearchTooltip, setShowSmartSearchTooltip] = useState(false)
  const [showReactionTooltip, setShowReactionTooltip] = useState(false)
  
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
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <header className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl mb-6 transform hover:scale-105 transition-transform duration-300">
              <Search className="h-10 w-10 text-white" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                Twitter Search Builder
              </h1>
            </div>
            

            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              </p>
              
              {/* Developer Info */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full shadow-sm">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">개발자:</span>
                  <a 
                    href="https://x.com/aguming_" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    @aguming_
                  </a>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full shadow-sm">
                  <ExternalLink className="h-4 w-4 text-purple-500" />
                  <a 
                    href="https://github.com/baksohyeon/twitter_search" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    GitHub 소스코드
                  </a>
                </div>
              </div>
            </div>
          </header>


          {/* Main Form */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                검색 조건 설정
              </CardTitle>
              <CardDescription>
                원하는 조건을 입력하여 정확한 트윗을 찾아보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* User & Content Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                  <User className="h-4 w-4" />
                  사용자 & 콘텐츠
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromUser" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      특정 사용자
                    </Label>
                    <Input
                      id="fromUser"
                      placeholder="@username (@ 없이 입력)"
                      value={criteria.fromUser}
                      onChange={(e) => updateCriteria('fromUser', e.target.value)}
                      className="transition-all duration-200 focus:shadow-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smartSearch" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      스마트 검색
                      <Tooltip 
                        open={showSmartSearchTooltip} 
                        onOpenChange={setShowSmartSearchTooltip}
                        delayDuration={300}
                      >
                        <TooltipTrigger asChild>
                          <button 
                            className="p-2 hover:bg-green-50 active:bg-green-100 rounded-full transition-colors touch-manipulation"
                            aria-label="스마트 검색 사용법 보기"
                            onClick={() => setShowSmartSearchTooltip(!showSmartSearchTooltip)}
                          >
                            <Info className="h-3 w-3 text-green-500" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="bottom" 
                          align="start"
                          className="max-w-xs sm:max-w-md z-50"
                          sideOffset={8}
                          onPointerDownOutside={() => setShowSmartSearchTooltip(false)}
                          onEscapeKeyDown={() => setShowSmartSearchTooltip(false)}
                        >
                          <div className="text-xs leading-relaxed space-y-1">
                            <p><strong>사용법:</strong> 쉼표(,)로 구분하면 OR 조건으로 검색</p>
                            <p><strong>예시:</strong></p>
                            <p>• 고양이, 개, 강아지 → (고양이 OR 개 OR 강아지)</p>
                            <p>• 단일 단어는 그대로 검색됩니다</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="smartSearch"
                      placeholder='고양이, 개, 강아지'
                      value={criteria.smartSearch}
                      onChange={(e) => updateCriteria('smartSearch', e.target.value)}
                      className="transition-all duration-200 focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                  <Calendar className="h-4 w-4" />
                  날짜 범위
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sinceDate" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      시작 날짜
                    </Label>
                    <Input
                      id="sinceDate"
                      type="date"
                      value={criteria.sinceDate}
                      onChange={(e) => updateCriteria('sinceDate', e.target.value)}
                      className="transition-all duration-200 focus:shadow-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="untilDate" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      종료 날짜
                    </Label>
                    <Input
                      id="untilDate"
                      type="date"
                      value={criteria.untilDate}
                      onChange={(e) => updateCriteria('untilDate', e.target.value)}
                      className="transition-all duration-200 focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Engagement Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                  <Heart className="h-4 w-4" />
                  리액션
                  <Tooltip 
                    open={showReactionTooltip} 
                    onOpenChange={setShowReactionTooltip}
                    delayDuration={300}
                  >
                    <TooltipTrigger asChild>
                      <button 
                        className="p-2 hover:bg-blue-50 active:bg-blue-100 rounded-full transition-colors touch-manipulation"
                        aria-label="리액션 검색 팁 보기"
                        onClick={() => setShowReactionTooltip(!showReactionTooltip)}
                      >
                        <Info className="h-3 w-3 text-blue-500" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      align="start"
                      className="max-w-xs sm:max-w-md z-50"
                      sideOffset={8}
                      onPointerDownOutside={() => setShowReactionTooltip(false)}
                      onEscapeKeyDown={() => setShowReactionTooltip(false)}
                    >
                      <p className="text-xs leading-relaxed">
                        <strong>팁:</strong> min_retweets:1 을 매크로넣어서 검색어 뒤에 붙여보세요. 
                        아무래도 스팸 계정은 알티가 안되기마련이라 이러면 걸러지더라구요. 
                        알티못받은 트윗 못보게되지만… 일단 검색이라는게 가능해집니다.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minRetweets" className="flex items-center gap-2">
                      <Repeat2 className="h-4 w-4 text-green-500" />
                      최소 리트윗
                    </Label>
                    <Input
                      id="minRetweets"
                      type="number"
                      placeholder="100"
                      min="0"
                      value={criteria.minRetweets}
                      onChange={(e) => updateCriteria('minRetweets', e.target.value)}
                      className="transition-all duration-200 focus:shadow-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minLikes" className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      최소 좋아요
                    </Label>
                    <Input
                      id="minLikes"
                      type="number"
                      placeholder="50"
                      min="0"
                      value={criteria.minLikes}
                      onChange={(e) => updateCriteria('minLikes', e.target.value)}
                      className="transition-all duration-200 focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-6 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newValue = !showAdvanced
                    setShowAdvanced(newValue)
                    trackAdvancedToggle(newValue)
                  }}
                  className="w-full flex items-center justify-center gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      고급 옵션 숨기기
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      고급 옵션 보기
                    </>
                  )}
                </Button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-6 pt-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Additional Search Terms */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                      <Hash className="h-4 w-4" />
                      추가 검색 조건
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hashtag" className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-blue-500" />
                          해시태그
                        </Label>
                        <Input
                          id="hashtag"
                          placeholder="AI (# 없이 입력)"
                          value={criteria.hashtag}
                          onChange={(e) => updateCriteria('hashtag', e.target.value)}
                          className="transition-all duration-200 focus:shadow-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="excludeWords" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-red-500" />
                          제외할 단어
                        </Label>
                        <Input
                          id="excludeWords"
                          placeholder="스팸 광고"
                          value={criteria.excludeWords}
                          onChange={(e) => updateCriteria('excludeWords', e.target.value)}
                          className="transition-all duration-200 focus:shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Filters */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                      <Image className="h-4 w-4" />
                      콘텐츠 필터
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        <Checkbox
                          id="nativeRetweets"
                          checked={criteria.nativeRetweets}
                          onCheckedChange={(checked) => updateCriteria('nativeRetweets', !!checked)}
                        />
                        <Label htmlFor="nativeRetweets" className="text-sm flex items-center gap-2 cursor-pointer">
                          <Repeat2 className="h-4 w-4 text-green-500" />
                          리트윗만
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        <Checkbox
                          id="hasImages"
                          checked={criteria.hasImages}
                          onCheckedChange={(checked) => updateCriteria('hasImages', !!checked)}
                        />
                        <Label htmlFor="hasImages" className="text-sm flex items-center gap-2 cursor-pointer">
                          <Image className="h-4 w-4 text-blue-500" />
                          이미지 포함
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        <Checkbox
                          id="hasVideos"
                          checked={criteria.hasVideos}
                          onCheckedChange={(checked) => updateCriteria('hasVideos', !!checked)}
                        />
                        <Label htmlFor="hasVideos" className="text-sm flex items-center gap-2 cursor-pointer">
                          <Video className="h-4 w-4 text-purple-500" />
                          영상 포함
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        <Checkbox
                          id="hasLinks"
                          checked={criteria.hasLinks}
                          onCheckedChange={(checked) => updateCriteria('hasLinks', !!checked)}
                        />
                        <Label htmlFor="hasLinks" className="text-sm flex items-center gap-2 cursor-pointer">
                          <Link className="h-4 w-4 text-orange-500" />
                          링크 포함
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Query Display */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-500" />
                생성된 검색 쿼리
              </CardTitle>
              <CardDescription>
                완성된 검색 쿼리를 복사하여 트위터에서 사용하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <div 
                  className={cn(
                    "bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 font-mono text-sm min-h-[100px] flex items-center border-2 transition-all duration-200",
                    query ? "text-foreground border-blue-200" : "text-muted-foreground border-gray-200"
                  )}
                >
                  {query || "검색 조건을 입력하면 여기에 쿼리가 나타납니다..."}
                </div>
                {copiedQuery === query && query && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-in slide-in-from-top-1 duration-300">
                    ✓ 복사됨!
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={copyToClipboard}
                  disabled={!query}
                  size="lg"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <Copy className="h-4 w-4" />
                  쿼리 복사
                </Button>
                
                <Button 
                  onClick={openInTwitter}
                  disabled={!query}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  트위터에서 열기
                </Button>
                
                <Button 
                  onClick={clearAll}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-all duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  전체 초기화
                </Button>
              </div>

              {/* Query Statistics */}
              {query && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>쿼리 길이: {query.length}자</span>
                    <span>조건 개수: {query.split(' ').filter(Boolean).length}개</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="mt-16 pt-12 border-t border-gray-200">
            <div className="text-center space-y-8">
              {/* Main Footer Content */}
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">


              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              {/* Bottom Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Made with love by @aguming_</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span>Twitter Search Builder</span>
                </div>
              </div>

            </div>
          </footer>

        </div>
      </div>
    </TooltipProvider>
  )
}