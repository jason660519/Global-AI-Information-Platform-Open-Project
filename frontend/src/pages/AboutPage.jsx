import React from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  StarIcon,
  EnvelopeIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  const features = [
    {
      icon: CodeBracketIcon,
      title: '開源優先',
      description: '我們致力於推廣開源文化，讓每個人都能參與到開源項目中來，共同創造更美好的技術世界。',
      color: 'blue'
    },
    {
      icon: GlobeAltIcon,
      title: '全球視野',
      description: '匯聚來自世界各地的優秀開發者和項目，打破地域限制，促進全球技術交流與合作。',
      color: 'green'
    },
    {
      icon: UserGroupIcon,
      title: '社群驅動',
      description: '以社群為核心，鼓勵開發者之間的互動交流，分享經驗，共同成長。',
      color: 'purple'
    },
    {
      icon: LightBulbIcon,
      title: '創新引領',
      description: '持續探索新技術，推動創新發展，為開發者提供最前沿的技術資源和工具。',
      color: 'yellow'
    },
    {
      icon: ShieldCheckIcon,
      title: '安全可靠',
      description: '採用業界最佳安全實踐，保護用戶數據安全，提供穩定可靠的服務。',
      color: 'red'
    },
    {
      icon: RocketLaunchIcon,
      title: '高效便捷',
      description: '優化用戶體驗，提供快速、直觀的操作界面，讓開發者能夠高效地找到所需資源。',
      color: 'indigo'
    }
  ];

  const team = [
    {
      name: '張小明',
      role: '創始人 & CEO',
      bio: '資深軟體工程師，擁有15年開發經驗，熱愛開源技術，致力於推動開源生態發展。',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      social: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: '李小華',
      role: '技術總監',
      bio: '全端開發專家，專精於現代Web技術棧，擁有豐富的大型項目架構設計經驗。',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      social: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: '王小強',
      role: '產品經理',
      bio: '產品設計專家，專注於用戶體驗設計，致力於打造直觀易用的產品界面。',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      social: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: '陳小美',
      role: 'UI/UX 設計師',
      bio: '視覺設計專家，擅長創造美觀且功能性強的用戶界面，提升用戶體驗。',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      social: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    }
  ];

  const stats = [
    { label: '服務用戶', value: '50,000+', icon: UserGroupIcon },
    { label: '收錄倉庫', value: '125,000+', icon: CodeBracketIcon },
    { label: '累計星數', value: '2.8M+', icon: StarIcon },
    { label: '支持語言', value: '50+', icon: GlobeAltIcon }
  ];

  const timeline = [
    {
      year: '2023年1月',
      title: '項目啟動',
      description: '開始構思和設計全球AI信息平台，組建核心團隊。'
    },
    {
      year: '2023年6月',
      title: '平台上線',
      description: '正式發布第一版平台，開始收錄GitHub開源項目數據。'
    },
    {
      year: '2023年9月',
      title: '功能擴展',
      description: '新增開發者檔案、項目統計分析等功能，用戶體驗大幅提升。'
    },
    {
      year: '2023年12月',
      title: '社群建設',
      description: '建立開發者社群，推出項目推薦和技術分享功能。'
    },
    {
      year: '2024年1月',
      title: '持續優化',
      description: '基於用戶反饋持續優化平台功能，提升數據準確性和搜索體驗。'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container-custom py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">
              關於我們
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              我們致力於打造全球最優秀的開源項目信息平台，
              連接開發者與優質項目，推動開源生態繁榮發展。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">我們的使命</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            通過技術創新和數據洞察，為全球開發者提供最全面、最準確的開源項目信息，
            促進技術交流與合作，推動開源文化的傳播與發展。
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">我們的特色</h2>
            <p className="text-lg text-gray-600">
              以下是我們平台的核心特色和價值主張
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-8 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${feature.color}-100 rounded-full mb-6`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">發展歷程</h2>
          <p className="text-lg text-gray-600">
            回顧我們的成長足跡，展望未來發展方向
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="card p-6">
                    <div className="text-blue-600 font-semibold mb-2">{item.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="relative z-10 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心團隊</h2>
            <p className="text-lg text-gray-600">
              認識我們充滿熱情的團隊成員
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                
                <div className="flex justify-center space-x-3">
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <CodeBracketIcon className="h-5 w-5" />
                  </a>
                  <a
                    href={member.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </a>
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-700 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">聯繫我們</h2>
            <p className="text-xl text-gray-300 mb-8">
              有任何問題或建議？我們很樂意聽到您的聲音
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <a
                href="mailto:contact@example.com"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <EnvelopeIcon className="h-6 w-6" />
                <span>contact@example.com</span>
              </a>
              
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <CodeBracketIcon className="h-6 w-6" />
                <span>GitHub</span>
              </a>
            </div>
            
            <div className="mt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center space-x-2 text-red-400"
              >
                <HeartIcon className="h-6 w-6" />
                <span>用 ❤️ 打造，為開源社群服務</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;