# 🗺️ AI Map Assistant

> **An intelligent location assistant powered by LLMs with interactive Google Maps integration**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

### 🤖 Dual LLM Support
- **Ollama (Default)** - Free, local, private AI inference
- **Google Gemini** - Cloud-based fallback with API key
- **Automatic Fallback** - Seamlessly switches if primary provider is unavailable

### 🗺️ Google Maps Integration
- **Places Search** - Find restaurants, cafes, attractions, and more
- **Interactive Map** - Clickable markers with info windows
- **Directions** - Get turn-by-turn directions to any place
- **Open in Maps** - Deep links to Google Maps app

### 💬 Smart Chat Interface
- **Natural Language** - Ask questions like "Where can I find good sushi in Tokyo?"
- **Conversation History** - Persistent chat history stored in database
- **Place Extraction** - AI automatically identifies places from queries

### ⚙️ Customizable Settings
- **Provider Selection** - Switch between Ollama and Gemini
- **Model Selection** - Choose from available models dynamically
- **API Key Management** - Secure input for Gemini API key

### 🔒 Security & Performance
- **Server-side API Proxy** - API keys never exposed to client
- **Rate Limiting** - Prevents abuse with configurable limits
- **Search Caching** - Reduces API calls with TTL-based cache
- **Input Validation** - Sanitized user inputs

---

## 🏗️ Architecture

This project follows **Atomic Design** principles for a scalable and maintainable component structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                          PAGES                                   │
│                    (Complete pages)                              │
├─────────────────────────────────────────────────────────────────┤
│                        TEMPLATES                                 │
│                  (Page layouts, MainLayout)                      │
├─────────────────────────────────────────────────────────────────┤
│                        ORGANISMS                                 │
│        (ChatPanel, MapView, Header, Footer, Settings)           │
├─────────────────────────────────────────────────────────────────┤
│                        MOLECULES                                 │
│      (ChatInput, PlaceCard, ProviderSelect, ModelSelect)        │
├─────────────────────────────────────────────────────────────────┤
│                          ATOMS                                   │
│         (Button, Input, Icon, Badge, Spinner, Card)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** and **Bun** (or npm/yarn/pnpm)
2. **Ollama** (for local LLM) - [Install Guide](https://ollama.com)
3. **Google Cloud Account** with Maps APIs enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/abbayosua/test-heypico.git
cd test-heypico

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
bun run db:push

# Start development server
bun run dev
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Database (SQLite for local, Neon for production)
DATABASE_URL="file:./dev.db"
# For Neon (production):
# DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
# DIRECT_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# LLM Provider Configuration
LLM_PROVIDER="ollama"

# Ollama Settings
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_DEFAULT_MODEL="llama3.2"

# Gemini Settings (optional, for cloud fallback)
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_DEFAULT_MODEL="gemini-2.0-flash-exp"

# Google Maps API
GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# Rate Limiting (optional)
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"
CACHE_TTL_SECONDS="3600"
```

### Setting Up Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download a model
ollama pull llama3.2

# Start Ollama server (usually auto-starts)
ollama serve
```

### Getting API Keys

| Service | Where to Get |
|---------|-------------|
| **Google Maps** | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| **Gemini** | [Google AI Studio](https://makersuite.google.com/app/apikey) |

**Required Google Maps APIs:**
- Maps JavaScript API
- Places API
- Geocoding API
- Directions API

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── chat/               # LLM chat endpoint
│   │   ├── models/             # Available models
│   │   ├── status/             # Provider status
│   │   ├── settings/           # User settings
│   │   ├── history/            # Conversation history
│   │   ├── places/             # Google Places API
│   │   ├── geocode/            # Geocoding API
│   │   ├── directions/         # Directions API
│   │   └── map-config/         # Map configuration
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/
│   ├── atoms/                  # Basic UI elements
│   ├── molecules/              # Composed components
│   ├── organisms/              # Complex UI sections
│   └── templates/              # Page layouts
│
├── lib/
│   ├── llm/                    # LLM provider implementations
│   │   ├── ollama.ts           # Ollama provider
│   │   ├── gemini.ts           # Gemini provider
│   │   ├── provider.ts         # Provider factory
│   │   └── prompts.ts          # System prompts
│   ├── maps/                   # Google Maps utilities
│   │   ├── places.ts           # Places API wrapper
│   │   ├── geocode.ts          # Geocoding wrapper
│   │   └── directions.ts       # Directions wrapper
│   ├── cache.ts                # Search caching
│   ├── rate-limit.ts           # Rate limiting
│   └── db.ts                   # Prisma client
│
├── hooks/                      # Custom React hooks
│   ├── use-chat.ts             # Chat state management
│   ├── use-map.ts              # Map state management
│   └── use-settings.ts         # Settings management
│
├── types/                      # TypeScript definitions
│   ├── llm.ts                  # LLM types
│   ├── chat.ts                 # Chat types
│   ├── place.ts                # Place types
│   └── settings.ts             # Settings types
│
└── constants/                  # App constants
    ├── llm-providers.ts        # LLM configurations
    └── map-config.ts           # Map configurations
```

---

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | Prisma ORM (SQLite/Neon PostgreSQL) |
| **LLM - Local** | Ollama (Llama 3.2, Mistral, etc.) |
| **LLM - Cloud** | Google Gemini |
| **Maps** | Google Maps Platform |
| **State** | React Hooks + Custom Hooks |

---

## 📱 Screenshots

### Chat Interface
Ask natural language questions about places:

```
User: "Where can I find good sushi restaurants in Tokyo?"

AI: Here are some highly-rated sushi restaurants in Tokyo:

1. Sushi Dai - Famous for its tuna, located in Tsukiji Outer Market
2. Sushi Saito - Three Michelin stars, exquisite omakase experience
3. Sukiyabashi Jiro - Legendary sushi restaurant in Ginza
```

### Interactive Map
- Markers appear for each mentioned place
- Click markers for details
- Get directions or open in Google Maps

### Settings Panel
- Switch between Ollama and Gemini
- Select from available models
- Configure API keys

---

## 🔐 Security Best Practices

| Practice | Implementation |
|----------|---------------|
| **API Key Protection** | All external API calls go through backend proxy routes |
| **Rate Limiting** | Configurable per-session request limits |
| **Input Sanitization** | User inputs validated and sanitized server-side |
| **CORS** | Proper CORS configuration for API routes |
| **Environment Variables** | Sensitive keys stored in `.env.local`, never committed |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database Setup (Neon)

1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy connection string to `DATABASE_URL`
4. Run `bun run db:push`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.com) - Local LLM inference
- [Google Gemini](https://ai.google.dev) - Cloud LLM API
- [Google Maps Platform](https://mapsplatform.google.com) - Maps & Places APIs
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

<p align="center">
  Made with ❤️ by <a href="mailto:abbasiagian@gmail.com">abbayosua</a>
</p>
