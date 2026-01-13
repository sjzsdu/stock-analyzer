# Stock Analyzer - Agent Guidelines

This file provides guidelines for AI agents working on this codebase.

## Build, Lint, and Test Commands

```bash
# Development
pnpm dev              # Start Next.js dev server (http://localhost:3000)

# Build and Deployment
pnpm build            # Build for production using Rspack
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Python Service
cd python-service
python main.py           # Start Python FastAPI service (http://localhost:8000)
pip install -r requirements.txt  # Install Python dependencies
```

**Note:** This project currently has no test suite. When adding tests:
- For Jest: `pnpm test -- path/to/test.test.ts`
- For Vitest: `pnpm test -- path/to/test.test.ts`

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Package Manager:** pnpm
- **Build Tool:** Rspack
- **Styling:** Tailwind CSS
- **Type Checking:** TypeScript
- **Linting:** ESLint
- **Icons:** lucide-react

### Backend
- **Framework:** Python FastAPI
- **Package Manager:** pip (requirements.txt)
- **Database:** MongoDB (Mongoose for frontend)

## Project Architecture

### Frontend (Next.js 16 App Router)
- `app/` - Pages and API routes (App Router)
- `components/` - Reusable React components
- `lib/` - Utility functions and helpers
- `models/` - Mongoose schemas
- `styles/` - Global CSS files
- `public/` - Static assets

### Backend (Python FastAPI)
- `python-service/main.py` - FastAPI application
- `python-service/agents/` - CrewAI agents (planned)
- `python-service/data/` - Data collection tools
- `python-service/utils/` - Utility functions

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
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Styling (Tailwind CSS)

- Use Tailwind utility classes extensively
- Gradient backgrounds are common: `bg-gradient-to-br from-blue-50 to-indigo-50`
- Rounded corners: `rounded-2xl` or `rounded-3xl` for modern look
- Spacing: Use `p-8`, `mb-6`, `gap-4` for padding, margins, and gaps
- Colors: Indigo/purple gradients for primary, green/red for indicators

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  <div className="container mx-auto px-4 py-8">
    <div className="bg-white rounded-3xl shadow-xl p-8">
      {/* Content */}
    </div>
  </div>
</div>
```

### Error Handling

**API Routes:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error message' },
      { status: 500 }
    );
  }
}
```

**Client Side:**
```typescript
try {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol }),
  });
  const result = await response.json();
  if (result.success) {
    setData(result.data);
  } else {
    setError(result.error);
  }
} catch (err) {
  setError('Network error');
}
```

### MongoDB / Mongoose

- Connection singleton: Use the cached connection pattern from `lib/mongodb.ts`
- Models: Define schemas in `models/` directory
- Index fields used in queries (especially `symbol`)

```typescript
// Import and use the connection singleton
import connectDB from '@/lib/mongodb';

// In API route or server component
await connectDB();
const result = await Model.findOne({ symbol });
```

### API Route Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Model from '@/models/Model';

export async function POST(request: NextRequest) {
  // 1. Parse request
  const { param } = await request.json();

  // 2. Validate input
  if (!param) {
    return NextResponse.json({ success: false, error: '...' }, { status: 400 });
  }

  // 3. Connect to database
  await connectDB();

  // 4. Execute logic
  // 5. Return response
  return NextResponse.json({ success: true, data });
}
```

### Python Service Guidelines

- Use FastAPI with async functions
- Import and configure environment variables with `python-dotenv`
- CORS is configured to allow all origins (for development)
- Use Pydantic models for request/response validation
- Include docstrings for endpoints

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class RequestModel(BaseModel):
    symbol: str

@app.post("/api/endpoint")
async def endpoint(request: RequestModel):
    try:
        # Logic
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Environment Variables

Create `.env.local` (frontend):
```
MONGODB_URI=mongodb://localhost:27017/stock_analyzer
PYTHON_API_URL=http://localhost:8000
```

Create `python-service/.env`:
```
DEEPSEEK_API_KEY=your_key_here
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

### Icons
Use `lucide-react` icons consistently:
```tsx
import { Search, TrendingUp, ArrowUp } from 'lucide-react';
<Search className="w-6 h-6" />
```

## Deployment

- **Frontend:** Vercel (recommended for Next.js)
- **Python Service:** Railway, Fly.io, or Render
- **MongoDB:** MongoDB Atlas or local instance
