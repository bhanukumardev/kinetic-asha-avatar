# 🧘 Asha - AI Companion for Senior Wellness

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=flat-square&logo=pwa)](https://en.wikipedia.org/wiki/Progressive_web_application)

**An AI-powered wellness companion designed specifically for senior citizens, featuring voice support, guided exercises, and personalized health tracking.**

[Live Demo](#) • [Documentation](#) • [Features](#-features) • [Getting Started](#-getting-started)

</div>

---

## 🎯 About Asha

**Asha** is a compassionate, AI-driven wellness platform designed to support the health, fitness, and emotional well-being of senior citizens. Named after the concept of "hope" in Hindi, Asha provides:

- 🎤 **Voice-Enabled Companion** - Interact with Asha using natural speech in multiple languages (English, Hindi, Hinglish)
- 💪 **Guided Fitness Exercises** - Age-appropriate, low-impact workouts with video demonstrations and real-time guidance
- 📊 **Health Check-ins** - Daily wellness tracking including mood, energy levels, and physical activity
- 📈 **Performance Reports** - Weekly/monthly reports with health insights and progress tracking
- 🛡️ **Safety & Privacy** - Enterprise-grade security with secure authentication and data encryption
- 📱 **PWA Support** - Works offline, installable on any device as a native-like app

---

## ✨ Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **AI Voice Companion** | Natural language conversations with intelligent voice responses |
| **Exercise Library** | 50+ guided exercises with video, duration, and difficulty levels |
| **Daily Check-in** | Track mood, energy, pain levels, and daily activities |
| **Report Generation** | Comprehensive wellness reports with health trends |
| **Multi-language Support** | English, Hindi, and Hinglish interface and voice |
| **Offline Mode** | Works seamlessly without internet connection |
| **Admin Dashboard** | Monitor users, manage exercises, and generate analytics |

### Technical Features

- ⚡ **Server-Side Rendering (SSR)** - Optimized performance with Next.js 15
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 💾 **Progressive Enhancement** - Graceful degradation for older browsers
- 🎨 **Responsive Design** - Fully responsive UI that works on all devices
- 🚀 **PWA Capabilities** - Install and use offline with service workers
- 🌍 **Internationalization** - Built-in i18n support for multiple languages

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- Modern web browser or mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bhanukumardev/kinetic-asha-avatar.git
   cd asha
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following:
   - `NEXT_PUBLIC_GROQ_API_KEY` - Groq API key for AI features
   - `NEXT_PUBLIC_WHATSAPP_API_URL` - WhatsApp integration endpoint (optional)

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

### Senior User Account
- **Email:** `user@example.com`
- **Password:** `User123@`
- **Role:** User

### Admin Account
- **Email:** `kumarbhanu818@gmail.com`
- **Password:** `Bhanu123@`
- **Role:** Admin
- **Access:** Full platform access + Admin Dashboard + User management

---

## 📁 Project Structure

```
asha/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── asha/                 # Asha-specific components
│   │   ├── asha-hero.tsx     # Welcome screen
│   │   ├── check-in.tsx      # Daily check-in
│   │   ├── exercise-player.tsx # Exercise interface
│   │   ├── report-card.tsx   # Health reports
│   │   ├── settings-dialog.tsx # User settings
│   │   ├── top-nav.tsx       # Navigation bar
│   │   └── safety-dialogs.tsx # Safety warnings
│   └── ui/                   # Reusable UI components
├── lib/                      # Utilities and logic
│   ├── asha-brain.ts         # AI/chatbot engine
│   ├── speech.ts             # Voice/audio handling
│   ├── store.tsx             # State management
│   ├── whatsapp.ts           # WhatsApp integration
│   └── i18n.ts               # Internationalization
├── public/                   # Static assets
└── styles/                   # Tailwind configuration
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript 5
- **UI Framework:** React 19
- **Styling:** Tailwind CSS 3
- **State Management:** React Context + Zustand
- **Components:** Shadcn/ui

### Backend
- **Runtime:** Node.js
- **API Routes:** Next.js API routes
- **Authentication:** JWT tokens stored in localStorage
- **Database:** Browser localStorage (can be upgraded to backend DB)

### AI & Voice
- **LLM:** Groq API (Llama models)
- **Voice Recognition:** Web Speech API
- **Text-to-Speech:** Web Audio API / Browser TTS

### Deployment
- **Hosting:** Vercel, Netlify, or any Node.js hosting
- **PWA:** Service Worker for offline support
- **Package Manager:** pnpm

---

## 🎓 Key Components

### AshaHero (`components/asha/asha-hero.tsx`)
The welcome screen that greets users by name and provides quick access to main features.

### CheckIn (`components/asha/check-in.tsx`)
Daily wellness tracking interface for mood, energy, and activity logging.

### ExercisePlayer (`components/asha/exercise-player.tsx`)
Interactive exercise guide with video, duration, difficulty, and voice guidance.

### ReportCard (`components/asha/report-card.tsx`)
Weekly/monthly wellness reports with visual charts and health insights.

### SettingsDialog (`components/asha/settings-dialog.tsx`)
User profile management, language preferences, and privacy settings.

---

## 🔐 Authentication & Security

- **Registration & Login:** Email-based authentication
- **Session Management:** JWT tokens in localStorage
- **Role-Based Access:** Admin and User roles with different permissions
- **Admin Dashboard:** Full platform access and user management
- **Data Privacy:** All sensitive data encrypted

---

## 🌐 Internationalization

Asha supports multiple languages:
- 🇬🇧 **English** - Full support
- 🇮🇳 **Hindi** - Full support
- 🇮🇳 **Hinglish** - Full support

Change language in Settings or use browser language detection.

---

## 📱 PWA Features

- **Installable:** Add to home screen on mobile devices
- **Offline Mode:** Works without internet connection
- **Fast Loading:** Optimized with caching strategies
- **Native Feel:** Fullscreen mode available

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)
```bash
pnpm build
vercel deploy
```

### Deploy to Netlify
```bash
pnpm build
netlify deploy --prod
```

### Deploy to Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **GitHub Issues:** [Report bugs](https://github.com/bhanukumardev/kinetic-asha-avatar/issues)
- **Developer:** Bhanu Kumar Dev
- **Email:** kumarbhanu818@gmail.com

---

## 🙏 Acknowledgments

- Built with ❤️ for senior wellness
- Inspired by the principles of accessible technology
- Powered by Groq's fast LLM inference
- UI components from Shadcn/ui

---

<div align="center">

**Made with ❤️ for a healthier, happier tomorrow**

⭐ If you found this project helpful, please consider giving it a star!

</div>