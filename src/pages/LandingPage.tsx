import React, { useState } from 'react';
import { 
  Brain, 
  Mic, 
  MessageCircle, 
  BookOpen, 
  BarChart3, 
  Zap, 
  Target, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Globe, 
  Code, 
  Lightbulb,
  TrendingUp,
  Shield,
  Clock,
  Award,
  Play,
  ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice Reasoning Mode",
      description: "Think out loud while solving problems. Our AI analyzes your reasoning patterns and provides personalized insights.",
      benefits: ["Real-time speech analysis", "Pattern recognition", "Metacognitive insights"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "SSA Coaching",
      description: "Socratic Solve Assistant guides you through structured problem-solving with intelligent questioning.",
      benefits: ["5-stage methodology", "Adaptive guidance", "Critical thinking development"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Real-world Applications",
      description: "Connect algorithmic concepts to practical software engineering challenges and industry scenarios.",
      benefits: ["Industry relevance", "Practical context", "Career preparation"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Intelligent Analytics",
      description: "Comprehensive performance tracking with AI-powered insights and personalized learning paths.",
      benefits: ["Performance tracking", "Weakness identification", "Spaced repetition"],
      color: "from-orange-500 to-orange-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "AlgoMind's voice reasoning feature helped me understand my thought process better. I improved my problem-solving approach significantly.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150"
    },
    {
      name: "Marcus Rodriguez",
      role: "CS Student at MIT",
      content: "The SSA coaching is like having a personal tutor. It asks the right questions to guide me without giving away the solution.",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150"
    },
    {
      name: "Emily Watson",
      role: "Tech Lead at Microsoft",
      content: "The real-world applications feature bridges the gap between competitive programming and actual software development.",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=150"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Problems Solved", icon: <Target className="h-6 w-6" /> },
    { number: "95%", label: "Improvement Rate", icon: <TrendingUp className="h-6 w-6" /> },
    { number: "500+", label: "Active Learners", icon: <Users className="h-6 w-6" /> },
    { number: "4.9/5", label: "User Rating", icon: <Star className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-lg">
              <Brain className="h-10 w-10 text-white" />
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Master Algorithms with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text block">
                AI-Powered Learning
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your problem-solving approach with voice reasoning analysis, Socratic coaching, 
              and intelligent insights that adapt to your learning style.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Start Learning Free
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-8 py-4 text-lg font-semibold"
                leftIcon={<Play className="h-5 w-5" />}
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Free to start
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-500 mr-2" />
                Privacy focused
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                AI-powered
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Philosophy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe that true algorithmic mastery comes from understanding your own thinking process, 
              not just memorizing solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Think, Don't Memorize</h3>
              <p className="text-gray-700">
                Develop deep understanding through guided reasoning rather than pattern memorization. 
                Our AI helps you build intuition for problem-solving.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Learning</h3>
              <p className="text-gray-700">
                Every learner is unique. Our AI adapts to your thinking patterns, identifies your weaknesses, 
                and creates a personalized learning path.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-world Relevance</h3>
              <p className="text-gray-700">
                Connect algorithmic concepts to practical applications. Understand how competitive programming 
                skills translate to software engineering success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Revolutionary Learning Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of algorithmic learning with AI-powered tools designed to accelerate your growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white shadow-lg border-2 border-blue-200'
                      : 'bg-white/50 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-3">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${activeFeature === index ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Feature Showcase */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center text-white mb-6`}>
                  {features[activeFeature].icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {features[activeFeature].title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {features[activeFeature].description}
                </p>
                <div className="space-y-3">
                  {features[activeFeature].benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Proven Results
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of learners who have transformed their algorithmic thinking with AlgoMind.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Learners Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from developers and students who have accelerated their learning with AlgoMind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How AlgoMind Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered learning system adapts to your unique thinking patterns and guides you to mastery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Think Aloud",
                description: "Solve problems while speaking your thoughts. Our AI captures your reasoning patterns.",
                icon: <Mic className="h-8 w-8" />,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Advanced algorithms analyze your approach, identifying strengths and improvement areas.",
                icon: <Brain className="h-8 w-8" />,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "3",
                title: "Guided Coaching",
                description: "Receive personalized guidance through our Socratic questioning system.",
                icon: <MessageCircle className="h-8 w-8" />,
                color: "from-green-500 to-green-600"
              },
              {
                step: "4",
                title: "Track Progress",
                description: "Monitor your improvement with detailed analytics and personalized insights.",
                icon: <BarChart3 className="h-8 w-8" />,
                color: "from-orange-500 to-orange-600"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-gray-500 mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of algorithmic education. Start your journey with AI-powered learning today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Learning Free
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
            >
              Schedule Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Setup in 2 minutes
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              30-day money back guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AlgoMind</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transforming algorithmic learning through AI-powered insights, voice reasoning analysis, 
                and personalized coaching for the next generation of developers.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">𝕏</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">gh</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AlgoMind. All rights reserved. Built with ❤️ for developers who want to master algorithmic thinking.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;