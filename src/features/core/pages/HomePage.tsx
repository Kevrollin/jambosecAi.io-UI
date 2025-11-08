import { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageToggle } from '../../../components/LanguageToggle';
import { useAuth } from '../../accounts/context/AuthContext';
import { paths } from '../../../routes/paths';

// Content object for EN/SW translations
const content = {
  en: {
    // Header
    navLogin: "Log In",
    navSignup: "Get Started Free",
    // Hero
    heroTitle: "Stay Safe Online, Your Way",
    heroSubtitle: "JamboSec is an English-Swahili AI cybersecurity awareness assistant built to empower ordinary Kenyans with the knowledge and tools to stay safe online.",
    heroDescription: "Get instant, accurate guidance on phishing messages, mobile money security, and personal data protection—all in your preferred language.",
    heroCTA: "Start Chatting Now",
    heroSecondaryCTA: "Learn More",
    // Features
    featuresTitle: "Your Complete Cybersecurity Companion",
    featuresSubtitle: "Everything you need to navigate the digital world safely",
    feat1Title: "Bilingual AI Assistant",
    feat1Desc: "Ask questions in English or Swahili and get instant, accurate responses tailored to Kenya's cybersecurity landscape.",
    feat2Title: "Interactive Chat Interface",
    feat2Desc: "Real-time conversations that simplify complex security concepts into clear, practical advice anyone can understand.",
    feat3Title: "Localized Guidance",
    feat3Desc: "Expert advice based on verified Kenyan cybersecurity policies and best practices, including M-Pesa security and SIM-swap protection.",
    feat4Title: "Suspicious Message Evaluation",
    feat4Desc: "Paste suspicious messages and get instant analysis to identify phishing attempts and scams before they harm you.",
    feat5Title: "Digital Hygiene Lessons",
    feat5Desc: "Learn bite-sized security tips and best practices to build your cybersecurity knowledge over time.",
    feat6Title: "Safe Reporting Guidance",
    feat6Desc: "Get step-by-step instructions on how to report scams and cyber threats safely and effectively.",
    // How It Works
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Getting started is simple and takes just a few minutes",
    step1Title: "Create Your Account",
    step1Desc: "Sign up for free—no credit card required. Your privacy is protected with secure authentication.",
    step2Title: "Ask Your Question",
    step2Desc: "Type your cybersecurity question in English or Swahili. Our AI understands context and local threats.",
    step3Title: "Get Instant Guidance",
    step3Desc: "Receive accurate, localized advice based on Kenyan cybersecurity policies and real-world best practices.",
    // Benefits
    benefitsTitle: "Why Choose JamboSec?",
    benefitsSubtitle: "Transform cybersecurity from a technical concept into an accessible life skill",
    benefit1Title: "Language Inclusivity",
    benefit1Desc: "Bridging the language gap with English-Swahili support ensures every Kenyan can access vital security knowledge.",
    benefit2Title: "Knowledge Empowerment",
    benefit2Desc: "We simplify complex cybersecurity concepts so you can understand and apply protection measures confidently.",
    benefit3Title: "Trust & Resilience",
    benefit3Desc: "Build public trust and strengthen resilience in Kenya's fast-growing digital ecosystem through education.",
    // CTA
    ctaTitle: "Ready to Transform Your Cybersecurity Knowledge?",
    ctaSubtitle: "Join thousands of Kenyans protecting themselves online with JamboSec's AI-powered guidance.",
    ctaButton: "Get Started Free",
    ctaSecondary: "See How It Works",
    // Footer
    footerRights: "All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerDescription: "Empowering Kenyans with accessible cybersecurity awareness.",
  },
  sw: {
    // Header
    navLogin: "Ingia",
    navSignup: "Anza Bila Malipo",
    // Hero
    heroTitle: "Jilinde Mtandaoni, Kwa Njia Yako",
    heroSubtitle: "JamboSec ni msaidizi wa AI wa usalama wa mtandao unaofanya kazi kwa Kiingereza na Kiswahili, ulijengwa ili kuwapa Wakenya wa kawaida maarifa na zana za kujilinda mtandaoni.",
    heroDescription: "Pata mwongozo wa haraka na sahihi kuhusu ujumbe wa ulaghai, usalama wa pesa za simu, na kulinda data ya kibinafsi—yote katika lugha unayopendelea.",
    heroCTA: "Anza Kuzungumza Sasa",
    heroSecondaryCTA: "Jifunze Zaidi",
    // Features
    featuresTitle: "Msaidizi Wako Kamili wa Usalama wa Mtandao",
    featuresSubtitle: "Kila kitu unachohitaji ili kusafiri katika ulimwengu wa kidijitali kwa usalama",
    feat1Title: "Msaidizi wa AI wa Lugha Mbili",
    feat1Desc: "Uliza maswali kwa Kiingereza au Kiswahili na upate majibu ya haraka na sahihi yanayokuzingatia hali ya usalama wa mtandao nchini Kenya.",
    feat2Title: "Kiolesura cha Mazungumzo",
    feat2Desc: "Mazungumzo ya haraka yanayorahisisha dhana ngumu za usalama kuwa mwongozo wazi na vitendo ambavyo mtu yeyote anaweza kuelewa.",
    feat3Title: "Mwongozo wa Kienyeji",
    feat3Desc: "Ushauri wa kitaalamu unaotegemea sera za usalama wa mtandao za Kenya zilizothibitishwa na mazoea bora, ikiwemo usalama wa M-Pesa na kulinda dhidi ya SIM-swap.",
    feat4Title: "Ukaguzi wa Ujumbe Suspect",
    feat4Desc: "Nakili ujumbe unaosuspicious na upate uchambuzi wa haraka ili kutambua majaribio ya ulaghai na udanganyifu kabla hayajaumiza.",
    feat5Title: "Masomo ya Usafi wa Kidijitali",
    feat5Desc: "Jifunze vidokezo vidogo vya usalama na mazoea bora ili kujenga maarifa yako ya usalama wa mtandao baada ya muda.",
    feat6Title: "Mwongozo wa Kuripoti Salama",
    feat6Desc: "Pata maelekezo hatua kwa hatua juu ya jinsi ya kuripoti udanganyifu na vitisho vya mtandao kwa usalama na kwa ufanisi.",
    // How It Works
    howItWorksTitle: "Inafanyaje Kazi",
    howItWorksSubtitle: "Kuanza ni rahisi na huchukua dakika chache tu",
    step1Title: "Fungua Akaunti Yako",
    step1Desc: "Jisajili bila malipo—hakuna kadi ya mkopo inayohitajika. Usiri wako unalindwa na uthibitishaji salama.",
    step2Title: "Uliza Swali Lako",
    step2Desc: "Chapa swali lako la usalama wa mtandao kwa Kiingereza au Kiswahili. AI yetu inaelewa muktadha na vitisho vya kienyeji.",
    step3Title: "Pata Mwongozo wa Haraka",
    step3Desc: "Pokea ushauri sahihi na wa kienyeji unaotegemea sera za usalama wa mtandao za Kenya na mazoea bora ya ulimwengu halisi.",
    // Benefits
    benefitsTitle: "Kwa Nini Uchague JamboSec?",
    benefitsSubtitle: "Badilisha usalama wa mtandao kutoka dhana ya kitaalamu kuwa ujuzi wa maisha unaoweza kufikiwa",
    benefit1Title: "Ujumuishaji wa Lugha",
    benefit1Desc: "Kuvunja pengo la lugha kwa msaada wa Kiingereza-Kiswahili kuhakikisha kila Mkenya anaweza kufikia maarifa muhimu ya usalama.",
    benefit2Title: "Uwezeshaji wa Maarifa",
    benefit2Desc: "Tunarahisisha dhana ngumu za usalama wa mtandao ili uweze kuelewa na kutumia hatua za kulinda kwa kujiamini.",
    benefit3Title: "Kuamini & Ustahimilivu",
    benefit3Desc: "Jenga imani ya umma na uimarishe ustahimilivu katika mfumo wa kidijitali unaokua haraka wa Kenya kupitia elimu.",
    // CTA
    ctaTitle: "Uko Tayari Kubadilisha Maarifa Yako ya Usalama wa Mtandao?",
    ctaSubtitle: "Jiunge na maelfu ya Wakenya wanaojilinda mtandaoni kwa mwongozo wa AI wa JamboSec.",
    ctaButton: "Anza Bila Malipo",
    ctaSecondary: "Ona Inafanyaje Kazi",
    // Footer
    footerRights: "Haki zote zimehifadhiwa.",
    footerPrivacy: "Sera ya Faragha",
    footerTerms: "Sheria na Masharti",
    footerDescription: "Kuwawezesha Wakenya kwa ufahamu wa usalama wa mtandao unaoweza kufikiwa.",
  }
};

const HomePageContent = () => {
  const [lang, setLang] = useState<'en' | 'sw'>('en');
  const navigate = useNavigate();
  const { status, isAuthenticated } = useAuth();

  // Redirect authenticated users to chat page
  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated) {
      navigate(paths.chat.root, { replace: true });
    }
  }, [status, isAuthenticated, navigate]);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'sw' : 'en');
  };

  const currentContent = content[lang];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <nav className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-7 xl:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-18">
            <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
              </div>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                JamboSec
              </span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-4 lg:space-x-6">
              <LanguageToggle 
                currentLang={lang} 
                onToggle={toggleLanguage}
              />
              <Link
                to="/login"
                className="text-xs sm:text-sm md:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap hidden sm:block"
              >
                {currentContent.navLogin}
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 text-xs sm:text-sm md:text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[80px] sm:min-w-0"
              >
                <span className="hidden sm:inline">{currentContent.navSignup}</span>
                <span className="sm:hidden">Get Started</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-4 lg:pt-8 xl:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12 xl:pb-19">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-62 sm:h-64 md:w-78 md:h-80 lg:w-94 lg:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium mb-6 sm:mb-8 md:mb-10">
                <span className="whitespace-nowrap">{lang === 'en' ? 'AI-Powered Cybersecurity Assistant' : 'Msaidizi wa Usalama wa Mtandao wa AI'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold text-gray-900 mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
              {currentContent.heroTitle}
            </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 mb-3 sm:mb-4 md:mb-5 max-w-3xl mx-auto font-medium px-2 sm:px-4">
              {currentContent.heroSubtitle}
            </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-2 sm:px-4">
                {currentContent.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center items-center px-4 sm:px-6">
                <Link
                  to="/signup"
                  className="group w-full sm:w-auto min-w-[200px] sm:min-w-0 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <span>{currentContent.heroCTA}</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto min-w-[200px] sm:min-w-0 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 text-center touch-manipulation"
                >
                  {currentContent.heroSecondaryCTA}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 px-2">
              {currentContent.featuresTitle}
            </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
                {currentContent.featuresSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="group bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.feat1Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.feat1Desc}</p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.feat2Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.feat2Desc}</p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.feat3Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.feat3Desc}</p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.feat4Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.feat4Desc}</p>
              </div>

              {/* Feature 5 */}
              <div className="group bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.feat5Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.feat5Desc}</p>
              </div>

              {/* Feature 6 */}
              <div className="group bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.feat6Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.feat6Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 px-2">
                {currentContent.howItWorksTitle}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
                {currentContent.howItWorksSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-14 max-w-5xl mx-auto">
              <div className="text-center px-2 sm:px-4">
                <div className="bg-blue-600 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">1</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.step1Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2 sm:px-4">{currentContent.step1Desc}</p>
              </div>
              <div className="text-center px-2 sm:px-4">
                <div className="bg-blue-600 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">2</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.step2Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2 sm:px-4">{currentContent.step2Desc}</p>
              </div>
              <div className="text-center px-2 sm:px-4">
                <div className="bg-blue-600 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">3</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{currentContent.step3Title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2 sm:px-4">{currentContent.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 px-2">
                {currentContent.benefitsTitle}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
                {currentContent.benefitsSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-4">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0 mt-1 sm:mt-0" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{currentContent.benefit1Title}</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.benefit1Desc}</p>
              </div>
              <div className="bg-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0 mt-1 sm:mt-0" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{currentContent.benefit2Title}</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.benefit2Desc}</p>
              </div>
              <div className="bg-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0 mt-1 sm:mt-0" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{currentContent.benefit3Title}</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{currentContent.benefit3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-blue-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-5 md:mb-6 px-2">
              {currentContent.ctaTitle}
            </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4">
              {currentContent.ctaSubtitle}
            </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center px-4 sm:px-6">
            <Link
              to="/signup"
                  className="group w-full sm:w-auto min-w-[200px] sm:min-w-0 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 touch-manipulation"
            >
                  <span>{currentContent.ctaButton}</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto min-w-[200px] sm:min-w-0 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 border-2 border-white/30 transition-all duration-300 text-center touch-manipulation"
                >
                  {currentContent.ctaSecondary}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-10 md:py-12 lg:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-6 sm:mb-8 md:mb-10">
            <div className="px-2 sm:px-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-base sm:text-lg md:text-xl font-bold text-white">JamboSec</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {currentContent.footerDescription}
              </p>
            </div>
            <div className="px-2 sm:px-0">
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">Quick Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors inline-block">
                    {currentContent.navLogin}
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white transition-colors inline-block">
                    {currentContent.navSignup}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="px-2 sm:px-0">
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/policy/privacy" className="hover:text-white transition-colors inline-block">
                    {currentContent.footerPrivacy}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors inline-block">
                    {currentContent.footerTerms}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 md:pt-10 text-center text-xs sm:text-sm px-2">
          <p>&copy; {new Date().getFullYear()} JamboSec. {currentContent.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function HomePage() {
  const { status } = useAuth();
  
  // Show loading while checking auth status
  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <HomePageContent />;
}