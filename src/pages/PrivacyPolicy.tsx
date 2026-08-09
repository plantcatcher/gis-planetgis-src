import React from 'react';
import { motion } from 'framer-motion';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';

const PrivacyPolicy = () => {
  return (
    <>
      <PageMeta
        title="隐私政策 - 星球小捕手 | PlanetGIS"
        description="星球小捕手隐私政策——了解我们如何收集、使用和保护您的个人信息，包括Cookie使用、第三方服务（Google Analytics、AdSense）的数据处理方式。"
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold mb-2">隐私政策</h1>
          <p className="text-sm text-muted-foreground mb-12">最后更新日期：2026年7月7日</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. 引言</h2>
              <p className="text-muted-foreground leading-relaxed">
                星球小捕手（planetgis.cn）尊重并保护所有访问用户的个人隐私权。本隐私政策说明了我们在您访问本网站时收集、使用和保护个人信息的方式。请花时间仔细阅读本政策，以了解我们如何处理您的个人信息。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. 信息收集</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                本网站可能收集以下类型的信息：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>自动收集的信息：</strong>当您访问本网站时，我们可能通过 Google Analytics 等分析工具自动收集您的 IP 地址、浏览器类型、操作系统、访问时间、访问页面等非个人身份信息。</li>
                <li><strong>广告相关数据：</strong>本网站使用 Google AdSense 展示广告。Google 可能使用 Cookie 来根据您过往的访问记录提供相关广告。您可以通过访问 <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google 广告设置</a> 来管理广告偏好。</li>
                <li><strong>您主动提供的信息：</strong>当您通过社交媒体链接或联系方式与我们互动时，您可能主动提供个人信息。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. 信息使用</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                我们收集的信息可能用于以下目的：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>分析和理解网站的使用情况，以改进网站内容和用户体验</li>
                <li>展示与您兴趣更相关的广告内容</li>
                <li>防止欺诈和滥用行为</li>
                <li>回复您的咨询和反馈</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Cookie 使用</h2>
              <p className="text-muted-foreground leading-relaxed">
                本网站使用 Cookie 来改善用户体验和分析网站流量。Cookie 是存储在您浏览器中的小型文本文件。您可以通过浏览器设置禁用 Cookie，但这可能影响网站的某些功能。Google AdSense 使用的 Cookie 包括但不限于：__gads、__gpi 等。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. 第三方服务</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                本网站使用以下第三方服务，这些服务可能收集您的信息：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Google Analytics：</strong>用于分析网站流量和用户行为</li>
                <li><strong>Google AdSense：</strong>用于展示广告</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                这些第三方服务有其各自的隐私政策，我们建议您阅读它们以了解其数据处理方式。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. 儿童隐私</h2>
              <p className="text-muted-foreground leading-relaxed">
                本网站不针对 13 岁以下的儿童，也不会有意收集儿童的个人信息。如果您是儿童的监护人，发现您的孩子向我们提供了个人信息，请与我们联系，我们将及时删除相关数据。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. 数据安全</h2>
              <p className="text-muted-foreground leading-relaxed">
                我们采取合理的技术和管理措施来保护您的个人信息不被未经授权的访问、使用或泄露。然而请注意，互联网上没有绝对安全的数据传输方式，我们不能保证 100% 的安全性。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. 您的权利</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                您拥有以下权利：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>访问权：您有权了解我们收集了您的哪些个人信息</li>
                <li>更正权：您有权要求更正不准确的个人信息</li>
                <li>删除权：您有权要求删除您的个人信息</li>
                <li>退订权：您可以随时通过浏览器设置禁用 Cookie 或退订广告个性化</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. 政策更新</h2>
              <p className="text-muted-foreground leading-relaxed">
                我们可能不时更新本隐私政策。更新后的政策将在本页面发布，并更新"最后更新日期"。建议您定期查阅本页面以了解任何变更。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. 联系我们</h2>
              <p className="text-muted-foreground leading-relaxed">
                如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>微信公众号：星球小捕手</li>
                <li>微博：<a href="https://weibo.com/u/5860040514" target="_blank" rel="noreferrer" className="text-primary hover:underline">@星球小捕手</a></li>
                <li>B站：<a href="https://space.bilibili.com/31959835" target="_blank" rel="noreferrer" className="text-primary hover:underline">星球小捕手</a></li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
