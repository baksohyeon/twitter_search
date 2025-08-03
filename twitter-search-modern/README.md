# Twitter Search Query Generator

A modern, user-friendly Twitter search query generator built with React, Vite, TanStack Query, and Shadcn UI.

## ✨ Features

- **Intuitive UI**: Clean, modern interface with Twitter-inspired design
- **Real-time Query Generation**: Queries update automatically as you type
- **Advanced Search Options**: Comprehensive search criteria including:
  - User targeting (from, to, mentions)
  - Date ranges
  - Engagement filters (min retweets, likes, replies)
  - Content filters (images, videos, links)
  - Text search (exact phrases, keywords, hashtags)
  - Account filters (verified users)

- **Smart Features**:
  - One-click copy to clipboard
  - Direct "Open in Twitter" functionality
  - Collapsible advanced options
  - Helpful tooltips and guidance
  - Responsive design for all devices

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for state management
- **Shadcn UI** for beautiful, accessible components
- **Tailwind CSS** for styling
- **Lucide React** for icons

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage

1. **Basic Search**: Fill in the user fields and date ranges for simple searches
2. **Advanced Options**: Click "Show Advanced Options" for more filters
3. **Copy Query**: Click "Copy Query" to copy the generated search string
4. **Open in Twitter**: Click "Open in Twitter" to search directly

### Example Use Cases

- Find viral tweets: Set minimum retweets to 1000+
- Search user's tweet history: Use "From User" with date range
- Find popular content about a topic: Combine hashtags with engagement filters
- Discover quality discussions: Use "Has Links" + minimum likes

## 🎯 Query Syntax Generated

The app generates standard Twitter search syntax:
- `from:username` - Tweets by user
- `to:username` - Tweets to user
- `since:YYYY-MM-DD` - After date
- `until:YYYY-MM-DD` - Before date
- `min_retweets:N` - Minimum retweets
- `filter:verified` - Verified accounts only
- And many more...

## 🌟 Improvements over Basic HTML Version

- **Modern React Architecture**: Component-based, maintainable codebase
- **State Management**: TanStack Query for optimal performance
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Mobile-First**: Responsive design that works on all devices
- **User Experience**: Tooltips, real-time feedback, loading states
- **Professional Design**: Shadcn UI components with consistent styling

## 📦 Project Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── TwitterSearchForm.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Main app with TanStack setup
└── main.tsx              # Entry point
```

## 🔧 Configuration

The app includes sensible defaults but can be customized:
- Query caching via TanStack Query
- Tailwind theme customization
- Component variants via Shadcn UI

---

Built with ❤️ for better Twitter searching