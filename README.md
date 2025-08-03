# Twitter Search Builder
**30분만에 배포까지 ~ 트위터 검색 쿼리 생성기**

## Project Overview
Complex Twitter/X search query builder with intuitive UI interface.

**Demo**: [만들게 된 계기](https://x.com/aguming_/status/1951797721137819962)

## Core Features
- **Search Filters**: User targeting, date ranges, content matching, hashtags
- **Advanced Options**: Engagement metrics, media filters, verification status, language selection
- **User Experience**: Real-time query generation, clipboard copy, direct Twitter integration

## Tech Stack Report

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | Frontend framework |
| TypeScript | ~5.8.3 | Type safety |
| Vite | 7.0.4 | Build tool |

### UI & Design
| Library | Version | Usage |
|---------|---------|-------|
| Tailwind CSS | 4.1.11 | Styling framework |
| Radix UI | Latest | Accessible components |
| Lucide React | 0.536.0 | Icons |

### State & Data
| Package | Version | Function |
|---------|---------|----------|
| TanStack React Query | 5.84.1 | Data fetching |
| date-fns | 4.1.0 | Date utilities |

### Development
| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.30.1 | Code linting |
| PostCSS | 8.5.6 | CSS processing |

### Deployment
| Technology | Usage |
|------------|-------|
| Docker | Containerization |
| Nginx | Web server |
| Docker Compose | Orchestration |

## Quick Start
```bash
# Development
npm install && npm run dev

# Production
docker-compose up --build
```

**Local**: `http://localhost:3000` | **Docker**: `http://localhost:80`

## Project Structure
```
src/
├── components/
│   ├── ui/                    # Reusable components
│   └── TwitterSearchForm.tsx  # Main form
├── lib/
│   ├── analytics.ts          # Tracking
│   └── utils.ts              # Utilities
└── App.tsx                   # Root component
```