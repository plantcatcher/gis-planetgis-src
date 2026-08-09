import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Compass, Box, ArrowRight, MessageCircle, Share2, Youtube, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';

const About = () => {
  const socialLinks = [
    { platform: '微信公众号', handle: '星球小捕手', desc: '搜索关注，获取最新地理科普推送', icon: MessageCircle, url: '#' },
    { platform: '微博', handle: '@星球小捕手', desc: '关注我们，参与地理话题讨论', icon: Share2, url: 'https://weibo.com/u/5860040514' },
    { platform: 'B站', handle: '星球小捕手', desc: '观看地理科普视频和可视化作品', icon: Youtube, url: 'https://space.bilibili.com/31959835' },
    { platform: '小红书', handle: '星球小捕手', desc: '查看地理知识卡片和图文内容', icon: Instagram, url: 'https://www.xiaohongshu.com/user/profile/5f91772d00000000010077da' },
    { platform: 'YouTube', handle: '@ZaynHuang', desc: 'Subscribe for geography content in English', icon: Youtube, url: 'https://www.youtube.com/@ZaynHuang' },
    { platform: '博客', handle: 'blog.planetgis.cn', desc: '阅读深度地理科普文章', icon: Globe, url: 'https://blog.planetgis.cn' },
  ];

  return (
    <>
      <PageMeta
        title="关于我们 - 星球小捕手 | PlanetGIS"
        description="星球小捕手是一个专注于地球科学的独立创作者品牌，用数据讲述地球变化，用地图发现世界的温度。近200篇原创文章、6款在线工具、3个可视化作品，覆盖B站、YouTube、小红书等多平台。"
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">关于星球小捕手</h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            一个专注于地球科学的独立创作者品牌。我们用数据讲述地球变化，用地图发现世界的温度——从南极冰盖消融到城市交通脉络，从古代文明的水利智慧到未来海平面的模拟预测，致力于让专业的地理知识变得直观、有趣、触手可及。
          </p>

          {/* Three content pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Globe,
                title: '深度科普',
                desc: '博客累计发表近 200 篇原创文章，涵盖自然地理、气候环境、人文地理、GIS 技术等方向，用通俗的语言解读专业的地理现象。',
              },
              {
                icon: Compass,
                title: '交互工具',
                desc: '自研多款在线地理小工具——经纬度查询、地形分析、GeoJSON 格式转换等，让地理数据处理不再是专业人士的专利。',
              },
              {
                icon: Box,
                title: '可视化作品',
                desc: '打造海平面模拟实验室、3D 数据大屏、城市路网绘制等交互可视化项目，将复杂的地理数据转化为可感知、可交互的视觉体验。',
              }
            ].map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-muted/50 border border-border/50"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <pillar.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 p-8 md:p-10 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '200+', label: '科普文章' },
                { value: '6+', label: '在线工具' },
                { value: '4', label: '可视化作品' },
                { value: '6+', label: '内容平台' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-6 text-sm">
              内容同步至 B 站、YouTube、小红书、微博、微信公众号（星球小捕手）等平台
            </p>
          </div>

          {/* Our Mission */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">我们的使命</h2>
            <p className="text-muted-foreground leading-relaxed">
              地球科学不应该只存在于论文和实验室中。我们相信，每一个对世界充满好奇心的人，都有权利以直观、有趣的方式了解我们所居住的星球。无论是理解海平面上升对沿海城市的影响，还是探索城市道路网背后的规划逻辑，我们都致力于用技术让地理科学走出论文，走进每个人的日常。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              我们的团队虽然只有一个人加一群 AI Agent（我们称之为 OPC —— One Person Company），但我们用技术杠杆和创意热情，持续产出高质量的地理科普内容和交互工具。
            </p>
          </div>

          {/* Contact (merged with 关于我们 in top nav) */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold">联系我们</h2>
            <p className="text-muted-foreground leading-relaxed">
              有地理科普合作、内容建议或技术咨询需求？欢迎通过以下渠道与我们取得联系。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target={link.url !== '#' ? '_blank' : undefined}
                    rel="noreferrer"
                    className="group flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{link.platform}</h3>
                      <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </div>
                    {link.url !== '#' && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                    )}
                  </a>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              对于商业合作，请在社交媒体上私信并注明"商业合作"，我们会尽快回复。
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            {/* 用真实 <a> 承载导航，而非 window.location 跳转：
                既保证无 JS 环境下可点击，也避免搜索引擎把页面里的
                location 赋值代码识别成「客户端跳转」。 */}
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/">
                返回首页 <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default About;
