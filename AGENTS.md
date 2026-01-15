# Stock Analyzer - Agent Guidelines

This file provides guidelines for AI agents working on this codebase.

## Build, Lint, and Test Commands

```bash
# Development
pnpm dev              # Start Next.js dev server (http://localhost:3000)
pnpm dev:fe           # Start frontend only
pnpm dev:be           # Start Python backend only
pnpm start:all        # Start both frontend and backend

# Build and Deployment
pnpm build            # Build for production using Rspack
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Testing
pnpm test             # Run all tests (if configured)
pnpm test -- path/to/test.test.ts  # Run specific test file

# Python Service (74+ tests available)
cd python-service
PYTHONPATH=. python -m pytest tests/ -v                    # Run all tests
PYTHONPATH=. python -m pytest tests/test_api.py -v         # Run API tests
PYTHONPATH=. python -m pytest tests/test_config.py -v      # Run config tests
PYTHONPATH=. python -m pytest tests/test_api.py::TestCollectEndpoint::test_collect_a_share_success -v  # Run single test

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Package Manager:** pnpm
- **Build Tool:** Rspack
- **Styling:** Tailwind CSS v4
- **Type Checking:** TypeScript (strict mode)
- **Linting:** ESLint
- **Icons:** lucide-react
- **Charts:** Highcharts, Recharts
- **Auth:** NextAuth.js with MongoDB adapter

### Backend
- **Framework:** Python FastAPI
- **Package Manager:** pip (requirements.txt)
- **Database:** MongoDB (Mongoose for frontend)
- **Data Sources:** AkShare (A股), yFinance (港股/美股)
- **AI/ML:** CrewAI, LangChain, LiteLLM (DeepSeek, MiniMax, Zhipu, Qwen)
- **Testing:** pytest with async support

## Code Style Guidelines

### File Organization

- **Client Components:** Add `'use client'` at the top of the file
- **Server Components:** Default (no directive)
- **API Routes:** Place in `app/api/` directory as `route.ts`
- **Models:** Define in `models/` using Mongoose schemas

### Import Style

```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextRequest, NextResponse } from 'next/server';

// 2. Third-party libraries
import { ArrowUp, TrendingUp } from 'lucide-react';
import mongoose from 'mongoose';

// 3. Local imports (use path aliases)
import connectDB from '@/lib/mongodb';
import StockAnalysis from '@/models/StockAnalysis';
```

**Path Aliases:** Use `@/` for root imports (configured in tsconfig.json)

### TypeScript

- **Strict mode** is enabled - always type your code
- **Components:** Use `interface` for props, `type` for unions/intersections
- **API Responses:** Define response interfaces or use `any` for dynamic data sparingly
- **Enums:** Use string unions for recommendation types: `'strong_buy' | 'buy' | 'hold' | 'wait' | 'sell'`

```typescript
// Good
interface StockData {
  symbol: string;
  overallScore: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'wait' | 'sell';
}

// Avoid
let data: any;
```

### Naming Conventions

- **Components:** PascalCase (`Home`, `AnalyzePage`, `StockAnalysisCard`)
- **Functions:** camelCase (`fetchAnalysis`, `handleAnalyze`, `calculateScore`)
- **Constants:** camelCase or UPPER_CASE for global constants (`roleNames`, `API_BASE_URL`)
- **Variables:** camelCase (`symbol`, `loading`, `overallScore`)
- **API Routes:** lowercase paths (`/api/analyze`, `/api/stocks`)
- **Models:** PascalCase (`StockAnalysis`, `StockBasic`)

### Component Patterns

```typescript
'use client';
import { useState, useEffect } from 'react';

export default function MyComponent({ prop }: { prop: string }) {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Side effects
  }, [dependency]);

  const handleClick = () => {
    // Event handlers
  };

  return (
    <div className="glass-effect rounded-3xl p-8 card-hover">
      {/* JSX */}
    </div>
  );
}
```

### Styling (Tailwind CSS v4)

- Use Tailwind utility classes extensively
- Glass effects: `glass-effect` class for modern blur backgrounds
- Gradient backgrounds: `bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332]`
- Status colors: Green (利好), Red (利空), Yellow (中性), Blue (信息)

### Error Handling

**API Routes:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Error message' }, { status: 500 });
  }
}
```

## Environment Variables

Create `.env.local` (frontend):
```
MONGODB_URI=mongodb://localhost:27017/stock_analyzer
PYTHON_API_URL=http://localhost:8000
```

Create `python-service/.env.local` (for development):
```
LLM_PROVIDER=deepseek  # deepseek, minimax, zhipu, qwen
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
MINIMAX_API_KEY=sk-your_minimax_api_key_here
ZHIPU_API_KEY=sk-your_zhipu_api_key_here
QWEN_API_KEY=sk-your_qwen_api_key_here
LLM_TEMPERATURE=0.5
LLM_MAX_TOKENS=2000
```

**Never commit environment files to version control.**

## Common Patterns

### Loading States
Use consistent loading UI with spinner:
```tsx
{loading && (
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
)}
```

### Responsive Design
- Mobile-first approach with `md:` and `lg:` breakpoints
- Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Enhanced Components
- **TechnicalIndicators**: RSI, MACD, 布林带, 均线分析
- **FinancialMetrics**: 盈利能力, 成长性, 财务健康指标
- **NewsFeed**: 情感分析新闻流
- **DataQualityIndicator**: 数据质量和时效性监控

### Glass Effect Design
```tsx
<div className="glass-effect rounded-3xl p-8 card-hover">
  {/* Content with modern glass morphism */}
</div>
```
