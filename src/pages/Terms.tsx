import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';

const Terms = () => {
  return (
    <>
      <PageMeta
        title="服务条款 - 星球小捕手 | PlanetGIS"
        description="星球小捕手服务条款——了解使用本网站的权利与义务，包括内容使用规范、免责声明、广告声明和知识产权说明。"
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold mb-2">服务条款</h1>
          <p className="text-sm text-muted-foreground mb-12">最后更新日期：2026年7月7日</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. 服务说明</h2>
              <p className="text-muted-foreground leading-relaxed">
                星球小捕手（planetgis.cn）是一个地理科普与可视化平台，提供地理知识科普、在线地理工具、交互式可视化作品等内容。使用本网站即表示您同意本服务条款。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. 内容使用</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                本网站上的所有内容，包括但不限于文章、图片、可视化作品、工具等，均受版权法保护。
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>您可以为个人学习目的浏览和使用本网站内容</li>
                <li>未经书面许可，不得将本网站内容用于商业用途</li>
                <li>转载或引用本网站内容时，请注明出处并附上原文链接</li>
                <li>本网站提供的在线工具仅供个人使用，不得用于批量数据爬取或自动化调用</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. 免责声明</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                本网站提供的内容仅供参考和教育目的：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>海平面模拟等可视化工具的数据仅为模拟演示，不代表精确的科学研究结果</li>
                <li>地理工具（如经纬度查询、地形分析）的结果仅供参考，不应用于导航、工程或其他需要精确数据的场景</li>
                <li>科普文章中的观点和数据基于公开资料，我们不保证其绝对准确性</li>
                <li>对于因使用本网站内容而产生的任何直接或间接损失，我们不承担责任</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. 广告声明</h2>
              <p className="text-muted-foreground leading-relaxed">
                本网站使用 Google AdSense 展示广告。Google 可能根据您的兴趣投放广告。第三方广告商可能使用 Cookie 来跟踪您的访问记录。您可以通过 Google 广告设置管理个性化广告偏好。广告内容不代表本网站的立场或推荐。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. 禁止行为</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                使用本网站时，您不得：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>未经授权修改、复制或传播本网站内容</li>
                <li>对本网站进行恶意攻击、爬虫抓取或其他可能影响网站正常运行的行为</li>
                <li>使用本网站从事任何违法活动</li>
                <li>冒用本网站名义发布信息</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. 知识产权</h2>
              <p className="text-muted-foreground leading-relaxed">
                本网站的所有内容，包括文字、图片、代码、设计、logo 等，版权归星球小捕手所有。本网站使用的第三方素材（如地图数据）归 respective 所有者所有。未经授权，任何人不得复制、修改或传播这些内容。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. 条款修改</h2>
              <p className="text-muted-foreground leading-relaxed">
                我们保留随时修改本服务条款的权利。修改后的条款将在本页面发布，并更新"最后更新日期"。继续使用本网站即表示您接受修改后的条款。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. 联系方式</h2>
              <p className="text-muted-foreground leading-relaxed">
                如对本服务条款有任何疑问，请通过微信公众号"星球小捕手"或微博与我们联系。
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Terms;
