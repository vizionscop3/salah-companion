# **Salah Companion**

> *Transforming Salah from ritual recitation into meaningful spiritual conversation*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-61DAFB.svg)](https://reactnative.dev/)

## 🌟 Overview

Salah Companion is a comprehensive mobile application designed to bridge the gap between ritual recitation and spiritual connection for Muslims learning to pray. Unlike existing prayer apps that treat Salah as a checklist, this application addresses the core struggles faced by new Muslims and those seeking deeper practice: understanding Arabic pronunciation, comprehending the meaning of what they recite, and building genuine connection with Allah through informed worship.

## ✨ Key Features

### 🕌 Core Prayer Features
- **Guided Salah Mode**: Real-time, hands-free guidance through each prayer
- **Arabic Pronunciation Academy**: Structured curriculum teaching Arabic phonetics from the ground up
- **Surah & Dhikr Library**: Comprehensive collection with educational depth

### 📢 Azan System
- Beautiful Azan playback with multiple voice options (Makkah, Madinah, Al-Qatami, Alafasy)
- Complete education on Azan meaning and proper response
- Smart scheduling with Do Not Disturb override
- Iqamah support

### 🎤 Recitation Practice & Correction
- AI-powered recitation feedback with real-time pronunciation correction
- Word-by-word, Ayah, and Full Surah practice modes
- Tajweed analysis and visual/audio feedback
- Progress tracking and improvement metrics

### ⏰ Prayer Time System
- Automatic location detection with multiple calculation methods
- Visual timeline view with countdown timers
- Qibla compass with AR mode
- Complete prayer time education

### 📅 Islamic Calendar & Holidays
- Full Hijri calendar integration
- Comprehensive holiday education (Ramadan, Eid, Ashura, etc.)
- Conduct guidelines for each occasion
- Moon phase indicators

### 🎮 Gamification & Accessibility
- Achievement system celebrating consistency and learning
- Designed specifically for users with ADHD, dyslexia, and learning differences
- Multiple pathways to success
- Level progression system

## 🏗️ Architecture

Built with **S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T.** principles:
- **Security**: OWASP Top 10 defenses, encryption at rest/transit
- **Automated**: TDD, CI/CD pipelines, automated security scans
- **Fortified**: CIS benchmarks, secure defaults
- **Evolving**: Continuous improvement through log.md documentation

## 🎨 Design System

Revolutionary **Material Neubrutomorphism** design system:
- Material UI's professional polish
- Neubrutomorphism's bold authenticity
- Neumorphic depth and tactile feedback
- WCAG 2.1 AA compliant accessibility

## 🛠️ Technology Stack

### Frontend
- **React Native** with TypeScript
- **Material-UI** with custom Neubrutomorphism theme
- **Framer Motion** for animations
- **React Navigation** for routing

### Backend & Services
- **Node.js/Express** with TypeScript
- **Prisma ORM** for database management
- **PostgreSQL** primary database
- **Redis** for caching

### AI & Audio
- **Tarteel.ai API** for recitation analysis (MVP)
- Custom tajweed rule engine
- High-quality Azan audio recordings

### DevOps
- **GitHub Actions** for CI/CD
- **Docker** for containerization
- **Sentry** for error tracking
- **DataDog** for monitoring

## 📋 Project Status

**Current Phase**: Phase 1 - Foundation (Weeks 1-8)

See [project-roadmap.md](docs/project-roadmap.md) for detailed development phases.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/salah-companion.git
cd salah-companion

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 📚 Documentation

- [Product Requirements Document](salah-companion-prd-v2.1.docx.md)
- [Strategic Plan](docs/plan.md)
- [Development Roadmap](docs/project-roadmap.md)
- [Database Schema](docs/database-schema.md)
- [Design System](docs/design-system.md)
- [API Documentation](docs/api.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🔒 Security

Security is paramount. Please review [SECURITY.md](SECURITY.md) for our security policies and vulnerability reporting procedures.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with deep respect for Islamic tradition and the needs of the Muslim community. All content is grounded in Quran and verified hadiths.

---

**حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ**

*Maintain with care the prayers and the middle prayer, and stand before Allah devoutly obedient*

— Surah Al-Baqarah 2:238

