# AlgoMind - AI-Powered Algorithm Learning Platform

AlgoMind is an intelligent learning platform that helps developers master algorithmic problem-solving through AI-powered coaching, voice reasoning analysis, and personalized feedback.

## 🚀 Features

### 🎤 Voice Reasoning Mode
- **Think-aloud sessions** with real-time speech recognition
- **AI-powered analysis** of reasoning patterns using Gemini AI
- **Personalized feedback** with ElevenLabs voice synthesis
- **Pattern recognition** and metacognitive insights

### 🧠 SSA (Socratic Solve Assistant) Coaching
- **Guided problem-solving** through 5 structured stages
- **Socratic questioning** to develop critical thinking
- **Real-time validation** of reasoning steps
- **Seamless integration** with voice reasoning insights

### 📊 Intelligent Analytics
- **Performance tracking** across multiple dimensions
- **Weakness identification** and targeted recommendations
- **Progress visualization** with interactive charts
- **Spaced repetition** suggestions for optimal learning

### 🔄 Smart Revision System
- **AI-driven problem selection** based on performance data
- **Personalized learning paths** with priority scoring
- **Comprehensive analytics** for improvement tracking
- **Evidence-based recommendations** for study optimization

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Services**: 
  - Gemini AI for reasoning analysis and coaching
  - ElevenLabs for voice synthesis
- **Speech Recognition**: Web Speech API
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Gemini AI API key
- ElevenLabs API key (for voice features)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd algomind
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### 3. Database Setup
Run the Supabase migrations to set up the database schema:
```bash
# The migrations are located in supabase/migrations/
# Apply them through your Supabase dashboard or CLI
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Card, etc.)
│   ├── dashboard/       # Dashboard-specific components
│   ├── voice-reasoning/ # Voice reasoning session components
│   ├── ssa-coaching/    # SSA coaching interface components
│   └── layout/          # Layout components (Navbar, Sidebar)
├── pages/               # Main application pages
├── services/            # External API integrations
│   ├── gemini.ts        # Gemini AI integration
│   ├── elevenlabs.ts    # ElevenLabs voice synthesis
│   ├── speechRecognition.ts # Speech recognition utilities
│   └── supabase.ts      # Supabase database operations
├── features/            # Redux slices and state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and configurations
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the provided migrations to set up the database schema
3. Configure Row Level Security (RLS) policies
4. Add your Supabase URL and anon key to the environment variables

### AI Services Setup
1. **Gemini AI**: Get an API key from Google AI Studio
2. **ElevenLabs**: Sign up and get an API key for voice synthesis
3. Add both keys to your environment variables

### Speech Recognition
The application uses the Web Speech API, which works best in Chrome and Edge browsers. Ensure microphone permissions are granted for voice reasoning features.

## 🎯 Key Features Explained

### Voice Reasoning Sessions
Users can think aloud while solving problems. The system:
- Captures speech in real-time
- Analyzes reasoning patterns with Gemini AI
- Provides detailed feedback on thinking processes
- Identifies strengths and areas for improvement

### SSA Coaching
A Socratic questioning system that guides users through:
1. **Understanding**: Breaking down the problem
2. **Simulation**: Walking through examples
3. **Pattern Recognition**: Identifying algorithmic approaches
4. **Validation**: Checking correctness and complexity
5. **Solution**: Implementation planning

### Intelligent Analytics
Comprehensive tracking of:
- Problem-solving performance
- Pattern mastery across different algorithm types
- Time and attempt statistics
- Personalized improvement recommendations

## 🔒 Security

- Environment variables for all API keys
- Supabase Row Level Security (RLS) for data protection
- User authentication and authorization
- Secure API integrations with proper error handling

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify (Recommended)
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with automatic builds on push

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_ELEVENLABS_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `/docs` folder
- Open an issue on GitHub
- Review the troubleshooting guide

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI coaching models
- [ ] Collaborative problem-solving features
- [ ] Integration with coding platforms
- [ ] Advanced analytics and insights
- [ ] Gamification elements

---

Built with ❤️ for developers who want to master algorithmic thinking through AI-powered learning.