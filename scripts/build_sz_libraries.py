# -*- coding: utf-8 -*-
"""深圳公共图书馆总馆点位数据 + 天地图地理编码 -> GCJ-02。

数据来源（人工整理的公开资料）：
  - 各馆官网「概况 / 本馆简介」页（szlib.org.cn / nslib.cn / szlglib.com.cn /
    szgmlib.com.cn / szlhlib.org.cn / baoan.gov.cn 等）
  - 各区政府门户「文化设施」场馆介绍页（sz.gov.cn / szpsq.gov.cn / dpxq.gov.cn）
  - 深圳市政府英文门户「Libraries across Shenzhen」场馆名录
  - 百度百科 / 维基百科条目（用于交叉校验面积、藏书量、成立年份）

坐标链路：天地图地理编码 API（CGCS2000 ≈ WGS84）-> scripts/crs_tools.wgs84_to_gcj02，
          与高德瓦片底图（GCJ-02）对齐。原始 WGS84 坐标保留在 properties.wgs84 中。

用法：
  python scripts/build_sz_libraries.py            # 生成 data/libraries.json + data/districts.json
  python scripts/build_sz_libraries.py --dry      # 只打印编码结果，不写文件
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crs_tools import wgs84_to_gcj02  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'maps', 'sz-libraries', 'data')
CACHE_DIR = os.path.join(ROOT, '_lib_cache')
TDT_TK = os.environ.get('TIANDITU_TOKEN', '0ae993c79d0c23c5453d0f18441e724a')

# ─────────────────────────────────────────────────────────────
# 15 处市级 / 区级公共图书馆总馆馆舍
#   tier: city 市级 / district 区级
#   founded: 建馆或现馆舍开放年份
#   area: 建筑面积 m²（None = 官方未公开或口径不一）
#   collection: **纸质文献**万册（统一口径，只比纸质，电子文献另在 collNote 说明）
#   collNote: 该馆藏量数据的具体口径与年份
#   seats: 阅览座位
#   grade: 国家一级图书馆评定情况
# ─────────────────────────────────────────────────────────────
LIBRARIES = [
    {
        'id': 'szlib',
        'name': '深圳图书馆',
        'alias': '深圳图书馆中心馆',
        'district': '福田区',
        'tier': 'city',
        'address': '福田区福中一路2001号',
        'query': '深圳市福田区福中一路2001号',
        'founded': 1986,
        'area': 49589,
        'collection': 699.07,
        'collNote': '纸质文献 699.07 万册；馆藏累积文献总量 1548.41 万册件（2025 年底，含电子 849.34 万）',
        'seats': 2500,
        'grade': '国家一级图书馆（连续七届）',
        'tagline': '「图书馆之城」的龙头馆',
        'summary': (
            '深圳市文化广电旅游体育局直属公益一类事业单位，前身是宝安县图书馆。'
            '现存中心馆（福田）与北馆（龙华）两处馆舍，总建筑面积约 12.2 万平方米，'
            '是深圳「图书馆之城」的中心馆与龙头馆。'
        ),
        'highlights': [
            '1986 年红荔路老馆作为深圳「八大文化设施」之一建成开馆，见证深圳第一次公共文化建设高潮',
            '2006 年中心区新馆落成，位于行政文化中心区、莲花山南，藏书能力 400 万册、2500 个阅览座位',
            '2023 年底北馆作为深圳首批「新时代重大文化设施」建成开放，设计藏书量 800 万册',
            '全市设有 224 台自助图书馆、11 家分馆、18 家青少年阅读基地、31 个捐赠换书中心网点、50 个图书服务站',
        ],
        'honors': [
            '2024 年北馆入围 IFLA 2024 年度公共图书馆奖全球四强',
            '2026 年「书海探底」项目获 IFLA 国际营销奖第二名',
            '连续七届评为国家「一级图书馆」，获「全国文明单位」「全民阅读示范基地」等 400 余项荣誉',
        ],
        'visit': '周二至周日 9:00–21:00（逢双休日提前一小时入馆），周一内务整理不开放；免证进馆、一卡通行',
        'transit': '地铁 3/4 号线少年宫站 D 出口、4 号线市民中心站 C 出口、1 号线福田站 31 出口、2 号线莲花西站 B 出口',
    },
    {
        'id': 'szlib-north',
        'name': '深圳图书馆北馆',
        'alias': '深图北馆',
        'district': '龙华区',
        'tier': 'city',
        'address': '龙华区腾龙路与中梅路交叉口（红山地铁站旁）',
        'query': '深圳市龙华区腾龙路与中梅路交叉口',
        'founded': 2023,
        'area': 72000,
        'collection': None,
        'collNote': '2023 年 12 月开馆，官网未公布实际藏量；设计藏书量 800 万册（中心馆 + 北馆合计口径）',
        'seats': 2500,
        'grade': '国家一级图书馆（与中心馆一体评定）',
        'tagline': '全国最大的地下智能立体书库',
        'summary': (
            '深圳首批建设并完工的「新时代重大文化设施」，地上 6 层、地下 3 层，'
            '设计藏书量 800 万册。承担「一馆一库三中心」功能：既是城市公共图书馆与全市文献调剂书库，'
            '也是「图书馆之城」联合采编中心、网络数据中心和文献调配中心。'
        ),
        'highlights': [
            '入口 48 米高中庭以层层退台向上延展，环绕中庭搭配通高书墙，是深圳最具辨识度的公共文化建筑之一',
            '地下智能立体书库为目前全国最大的地下智能立体书库，也是首创埋藏在地下的超深立体书库',
            '配置大型快速分拣系统、垂直轨道调阅系统和电子播种墙系统',
            '一楼主厅书墙设「美好生活 / 文史瑰宝 / 诸子百家 / 思想伟力 / 复兴之路 / 湾区腾飞」六大主题',
            '每天开放大众服务区预约名额 6000 个、少儿区 2000 个',
        ],
        'honors': [
            '2023 年 12 月 28 日在试运行三个月后正式开馆，入围 IFLA 2024 年度公共图书馆奖全球四强',
        ],
        'visit': '需提前一天通过「深圳图书馆」微信公众号提交入馆预约，到馆出示预约凭证入场',
        'transit': '地铁 4 号线红山地铁站',
    },
    {
        'id': 'szuclib',
        'name': '深圳大学城图书馆',
        'alias': '深大城图书馆',
        'district': '南山区',
        'tier': 'city',
        'address': '南山区深大城片区平山村（西丽地铁站附近）',
        'query': '深圳市南山区深圳大学城平山村',
        'founded': 2015,
        'area': None,
        'collection': None,
        'collNote': '官网未公开独立藏量口径；2025 年两家市级馆实体文献合计 945.55 万册件',
        'seats': None,
        'grade': '已纳入「图书馆之城」统一服务',
        'tagline': '两馆之一，高校服务与公共服务的交界',
        'summary': (
            '深圳「图书馆之城」统一服务成员馆中的另一家市级馆，'
            '位于深圳大学城片区的平山村，与中山大学深圳校区、北京大学深圳研究生院等高校园区相邻，'
            '服务周边师生与产业人群。'
        ),
        'highlights': [
            '2013 年 12 月加入「图书馆之城」统一服务，是深圳统一服务体系统一扩容的早期节点之一',
            '2025 年深圳图书馆、深圳大学城图书馆两家市级馆实体文献藏量 945.55 万册件，占全市实体文献总量的 32.69%',
        ],
        'honors': [],
        'visit': '详见「深圳图书馆之城」统一平台各馆公告',
        'transit': '地铁 7 号线西丽站 / 5 号线留仙洞站一带',
    },
    {
        'id': 'szchildren',
        'name': '深圳少年儿童图书馆',
        'alias': '深圳少儿图书馆',
        'district': '福田区',
        'tier': 'city',
        'address': '福田区红荔路1011号',
        'query': '深圳市福田区红荔路1011号',
        'founded': 1997,
        'area': None,
        'collection': 20.0,
        'collNote': '图书 20 余万册、期刊 1000 余种、数字文件近 1 万件（建馆初期口径）',
        'seats': None,
        'grade': '少儿服务专馆',
        'tagline': '面向 0–18 岁的独立少儿公共馆',
        'summary': (
            '1997 年 11 月 5 日建成开放，是深圳唯一独立建制的少年儿童公共图书馆，'
            '为儿童、教育工作者与家长提供信息与阅读服务。'
        ),
        'highlights': [
            '馆藏图书 20 余万册、期刊 1000 余种、数字文件近 1 万件',
            '常态化举办面向儿童、家长与教育者的文化活动',
        ],
        'honors': [],
        'visit': '周二至周日 9:00–21:00，周一闭馆',
        'transit': '地铁 3 号线通新岭站 C 出口；3/9 号线红岭站 B 出口',
    },
    {
        'id': 'futian',
        'name': '福田区图书馆',
        'alias': '福图',
        'district': '福田区',
        'tier': 'district',
        'address': '福田区景田路70号',
        'query': '深圳市福田区景田路70号',
        'founded': 1999,
        'area': 10260,
        'collection': 42.0,
        'collNote': '本馆纸质文献 42 万余册；全区分馆体系纸质总藏量约 250 万册',
        'seats': 1200,
        'grade': '国家一级图书馆（2023）',
        'tagline': '全国首批「AI 图书馆助手」落户的区级馆',
        'summary': (
            '成立于 1999 年 7 月，原址在福田区委大院，2008 年迁入莲花山公园西侧的景田路图书馆大厦。'
            '通过「总分馆制」建成覆盖全区的公共图书馆网络，是深圳中心城区密度最高的阅读网络之一。'
        ),
        'highlights': [
            '体系包括 1 个区级馆、10 个街道分馆、85 个社区分馆、3 个直属主题馆及 9 个合作共建馆，纸质文献总藏量约 250 万册',
            '馆藏纸质文献 42 万余册、音像 8 万余件，电子图书 170 万种、电子期刊近 44 万册，拥有 Springer、Nature、读秀等 16 种数据库',
            '馆内设 24 小时自助图书馆区，华强北设有影像主题馆',
            '2023 年以来推进「伏羲智图」总分馆管理体系，上线 AI 图书馆助手「福鹭鹭」',
            '2013 年推出「励读计划」实现身份证免押金借阅',
        ],
        'honors': [
            '2023 年获评国家一级图书馆',
            '2024 年设立「深圳书房」特色馆，集中展示深圳作家及本土题材作品',
        ],
        'visit': '周三至周一 9:00–21:00，周二闭馆（24 小时自助区不受影响）',
        'transit': '地铁 2/9 号线景田站 C 出口',
    },
    {
        'id': 'luohu',
        'name': '罗湖区图书馆',
        'alias': '罗图',
        'district': '罗湖区',
        'tier': 'district',
        'address': '罗湖区怡景路1016号（「一馆一中心」）',
        'query': '深圳市罗湖区怡景路1016号',
        'founded': 1985,
        'area': 38000,
        'collection': None,
        'collNote': '新馆 2026 年 6 月开馆，官网未公布独立藏量；旧馆 2021 年电子文献 149.03 万册件',
        'seats': None,
        'grade': '国家地（市）级一级图书馆',
        'tagline': '全国首个鸿蒙生态图书馆',
        'summary': (
            '成立于 1985 年。2020 年原址拆除重建为罗湖文化综合体「一馆一中心」，'
            '总建筑面积约 7.7 万平方米（图书馆单体约 3.8 万平方米、地上 21 层），'
            '2025 年底建成、2026 年 1 月 1 日启动试运营，2026 年 6 月新馆正式开馆。'
        ),
        'highlights': [
            '设计以「书山堆叠」为理念，呼应罗湖「一半山水一半城」的独特气质',
            '打造全国首个鸿蒙生态图书馆，AI 技术贯穿「入馆-典藏-流转-服务」全流程',
            '引入智慧立体书库、图书全自动智能分拣、视觉盘点、智慧采编、无感借阅、图书消毒等系统',
            '设有深港文化融合图书馆、健康生活图书馆、设计&艺术图书馆等主题馆，以及千手涂涂绘本馆、盲文阅览区、长者阅览区',
            '全区服务网络：区级馆 1 个 + 直属街道馆与「悠·图书馆」25 个 + 社区图书馆 75 个 + 馆外流动服务站 37 个 + 24 小时自助馆 27 个',
        ],
        'honors': [
            '2021 年以「悠·图书馆为特色的总分馆体系」获深圳市市长质量奖（文化类银奖）',
            '2018 年罗湖区获中国图书馆学会「书香城市（区县级）」称号',
        ],
        'visit': '试运营期开放 1–3 层、24 小时自助图书馆与智慧图书分拣区，周二至周日 10:00–17:00（试运营期间需预约）',
        'transit': '地铁 5 号线（环中线）怡景站 C 出口；公交怡景地铁站①/②、荷花市场',
    },
    {
        'id': 'nanshan',
        'name': '南山图书馆',
        'alias': '南图',
        'district': '南山区',
        'tier': 'district',
        'address': '南山区南山大道2076号',
        'query': '深圳市南山区南山大道2076号',
        'founded': 1997,
        'area': 18700,
        'collection': 189.07,
        'collNote': '纸质文献 189.07 万册（含期刊、盲文图书 556 册）；馆藏文献总量 341.38 万册件（2025，含电子图书 91.07 万 + 电子期刊 60.31 万）',
        'seats': 1741,
        'grade': '国家一级图书馆（连续六届）',
        'tagline': '「一街道一图书馆」的实践者',
        'summary': (
            '1994 年由南山区政府投资兴建，1997 年 3 月 28 日正式开门迎客。'
            '占地 13700 平方米、设计藏书 60 万册，2011 年加层改造后建筑面积扩展至 18700 平方米，'
            '是南山区标志性的文化建筑之一。'
        ),
        'highlights': [
            '截至 2025 年馆藏文献资源总量 341.38 万册件，其中纸质文献（含期刊）189.07 万册、电子图书 91.07 万册、电子期刊 60.31 万册',
            '总分馆体系：1 家区级总馆 + 8 家街道级分馆 + 1 家学校分馆 + 4 家南山书房 + 97 家通借通还社区图书馆 + 52 个集体借阅服务点',
            '街道分馆通借通还覆盖率 100%，社区图书馆通借通还覆盖率 94%',
            '「南山文化讲坛」「跟名师读名著」形成层级递进的阅读推广体系；常设公益法律与心理专题咨询室',
            '自建《南山人文多媒体数据库》《深圳新旧照片图库》',
        ],
        'honors': [
            '2023 年第七次全国县级以上公共图书馆评估定级中连续第六次荣获国家「一级图书馆」',
            '2020 年获深圳市「儿童友好图书馆」称号；2023 年获广东省「家庭亲子阅读体验基地」',
            '2019 年获国家机关事务管理局「节约型公共机构示范单位」',
        ],
        'visit': '成人阅览室周二至周日 9:00–21:00（周一闭馆）；亲子/少儿阅览室工作日 15:30–21:00、周末 9:00–21:00；自习室全年 365 天开放',
        'transit': '地铁 1 号线桃园站 / 高新园站一带',
    },
    {
        'id': 'yantian',
        'name': '盐田区图书馆',
        'alias': '盐图',
        'district': '盐田区',
        'tier': 'district',
        'address': '盐田区深盐路（盐田文体中心）',
        'query': '深圳市盐田区深盐路盐田文体中心',
        'founded': 2003,
        'area': 14854,
        'collection': 62.08,
        'collNote': '馆藏文献 79.05 万册件中的纸质部分约 62.08 万册（电子资源 16.97 万）',
        'seats': 1731,
        'grade': '国家地（市）级一级图书馆',
        'tagline': '全国首个海洋专题类资源联合目录库',
        'summary': (
            '成立于 2003 年 8 月 12 日，是国家地市级一级公共图书馆，总建筑面积 14854 平方米，'
            '设有总馆及沙头角分馆，阅览座位 1731 个，馆藏文献 79.05 万册件（含电子资源 16.97 万册件）。'
        ),
        'highlights': [
            '构建「总馆-分馆-社区服务点」三级服务网络，覆盖 5 家街道级分馆、10 家智慧书房及 52 个流动站',
            '设少儿借阅区、智慧书房、4D 影院等 22 个功能区，每周开放 72 小时，年接待读者超 30 万人次',
            '2016 年新馆启用后确立「智慧型海洋文献特色」定位，收藏海洋文献 1.6 万册',
            '建成全国首个海洋专题类资源联合目录库，配套海洋文化园与数字化服务系统',
        ],
        'honors': [],
        'visit': '每周开放 72 小时（具体时段见馆内公告）',
        'transit': '地铁 8 号线盐田路站一带',
    },
    {
        'id': 'baoan',
        'name': '宝安区图书馆',
        'alias': '宝图',
        'district': '宝安区',
        'tier': 'district',
        'address': '宝安区宝兴路1号',
        'query': '深圳市宝安区宝兴路1号',
        'founded': 1983,
        'area': 48000,
        'collection': 298.0,
        'collNote': '馆内藏书 298 万册（2026 年官网口径，未区分纸质与电子）',
        'seats': 2600,
        'grade': '国家一级图书馆（2023）',
        'tagline': '「图书馆 + 城市规划展览馆」两馆合一',
        'summary': (
            '前身为 1983 年始建的宝安县图书馆，1993 年正式更名。'
            '现馆位于宝安中心区中央绿轴上，2013 年底建成开放，总建筑面积 48000 平方米，'
            '是宝安区公共图书馆服务体系的总馆，也是全区成员馆最多的区级馆之一。'
        ),
        'highlights': [
            '采用「图书馆 + 城市规划展览馆」两馆合一设计',
            '馆内藏书 298 万册、阅览座位 2600 个，设婴幼儿图书馆、少儿图书馆、青少年阅览室、盲文阅览室、工业技术图书阅览区、姓氏家谱阅览室等',
            '一、二、三楼共设近 20 台 24 小时自助借还书机；三楼近 2000 平方米电子阅览室与视听室，装备近 200 台计算机',
            '2019 年起对西乡、福永、松岗、石岩、福海、燕罗、沙井、新安、航城等街道图书馆实施垂直管理，各馆每周开放延长至 72 小时',
            '截至 2023 年 7 月拥有 130 家总分馆成员馆，遍布各街道及社区、公园、工业区',
        ],
        'honors': [
            '2023 年 12 月被评定为国家一级图书馆',
            '2017 年度中国图书馆学会「全民阅读先进单位」（2018 年 12 月公布）',
        ],
        'visit': '见馆内公告',
        'transit': '地铁 1/5/9 号线宝安中心站一带',
    },
    {
        'id': 'longgang',
        'name': '龙岗区图书馆',
        'alias': '龙图',
        'district': '龙岗区',
        'tier': 'district',
        'address': '龙岗区中心城龙翔大道文化中心D座',
        'query': '深圳市龙岗区龙翔大道文化中心',
        'founded': 1986,
        'area': 30300,
        'collection': 287.46,
        'collNote': '全馆藏书 476.92 万册件中的纸质部分约 287.46 万册（电子图书 189.46 万）',
        'seats': 1752,
        'grade': '国家地（市）级一级图书馆（连续四次）',
        'tagline': '「龙图书院」与客家文献收藏中心',
        'summary': (
            '龙岗区文化广电旅游体育局直属全额拨款公益性事业单位，国家一级图书馆。'
            '馆舍建筑面积 3.03 万平方米（总馆 2.38 万 + 少儿馆 0.65 万），'
            '藏书 476.92 万册件（含电子图书 189.46 万册），阅览座位 1752 个。'
        ),
        'highlights': [
            '从当年仅对机关工作人员开放的小阅览室发展为百万市民与劳务工的精神家园，年接待读者约 300 万人次、年外借约 250 万册次',
            '四大读者服务区：数字体验区、新书推荐区、党史党建区、24 小时自助图书馆区，含客家文献收藏中心',
            '百龙墨宝收藏室收藏全国百名书法家「龙」字书法真迹',
            '2005 年起坚持「龙岗大讲堂」公益讲座，2020 年举办约 1400 场，成为龙岗一张文化名片',
            '2008 年采用 RFID 电子标签技术实现全馆自助借还，并在全国较早建成全天候无人值守 24 小时自助图书馆',
            '2010 年与深圳图书馆合并馆藏与读者数据库，在全市率先实施统一服务；全区已建成 38 个分馆',
        ],
        'honors': ['2009 年以来连续四次被文化部评为国家地市级一级图书馆'],
        'visit': '周一至周日 9:00–21:00，法定节假日 9:00–18:00',
        'transit': '地铁 3 号线龙城广场站；公交龙岗文化中心 / 龙城广场站',
    },
    {
        'id': 'longhua',
        'name': '龙华图书馆',
        'alias': '龙华图',
        'district': '龙华区',
        'tier': 'district',
        'address': '龙华区福城街道观澜大道137号',
        'query': '深圳市龙华区观澜大道137号',
        'founded': 2021,
        'area': 10000,
        'collection': 47.0,
        'collNote': '馆藏文献 47 万余册件（过渡馆口径）',
        'seats': 1000,
        'grade': '国家一级图书馆（2023，首次参评即获评）',
        'tagline': 'AGV 分拣 + VR 阅读舱的「数字龙华」样板',
        'summary': (
            '由龙华区人民政府投资兴建的区级公共图书馆，位于福城街道观澜大道 137 号、'
            '地铁 4 号线茜坑站旁。2021 年 12 月 11 日建成开放，作为区图书馆过渡馆，共 9 层。'
        ),
        'highlights': [
            '馆藏文献 47 万余册件，阅览座位 1000 个，面积 10000 平方米',
            '上线 AGV 图书自动分拣系统、大数据智慧墙、电子瀑布流、智慧书架等数字化设备',
            '八楼数字互动体验区配备 VR 阅读体验舱、听书森林、朗读亭、听立方等设备',
            '七楼设地方文献阅览区（收集镇街志、家族谱等）与深圳捐赠换书中心龙华分中心',
            '龙华区实行「1 个区图书馆 + 6 个街道分馆 + N 个社区服务点」的总分馆制',
        ],
        'honors': [
            '2023 年 12 月首次参评即获文化和旅游部「国家一级图书馆」',
            '2023 年获「深圳市儿童友好图书馆」；2022 年获「广东省社会科学普及示范基地」',
        ],
        'visit': '主馆周二至周日 9:00–21:00（周一闭馆）；24 小时自助图书馆 0:00–24:00；免证进馆、无需预约',
        'transit': '地铁 4 号线茜坑站 C 出口；公交茜坑地铁站 / 龙光玖誉府公交首末站',
    },
    {
        'id': 'pingshan',
        'name': '坪山图书馆',
        'alias': '坪图',
        'district': '坪山区',
        'tier': 'district',
        'address': '坪山区坪山街道汇德路8号（坪山文化聚落）',
        'query': '深圳市坪山区汇德路8号',
        'founded': 2019,
        'area': 13200,
        'collection': 106.15,
        'collNote': '馆藏总量 106.15 万册；设计藏书量不少于 120 万册',
        'seats': 800,
        'grade': '国家一级图书馆（2023 首次参评）',
        'tagline': 'IFLA 2021「绿色图书馆奖」亚军',
        'summary': (
            '位于坪山文化聚落，紧邻坪山中心公园，2019 年 3 月 23 日正式开馆，'
            '聘请周国平先生为首任馆长。建筑面积 13200 平方米、共 10 层，'
            '设计总藏书量不少于 120 万册，阅览座位 800 余个。'
        ),
        'highlights': [
            '坪山文化聚落首个对外开放的板块，聚落由图书馆、美术馆、大剧院、展览馆等组成，占地约 7.4 万平方米',
            '融入绿色社区概念，衔接 2.4 万平方米中心公园，采用植物幕墙、竹林休息区与自然通风技术',
            '设有星光书屋、儿童绘本馆、音乐图书馆、汉声文化馆、大家书房等特色功能区',
            '客家特藏馆藏客家文献 3200 余册，含总族谱、史志、客籍名人文集等（暂不支持外借）',
            '总分馆体系现设区级总馆 1 家、分馆 14 家，街道级覆盖率 100%，覆盖全区 70.83% 社区',
            '建成全市最大社区图书馆——汤坑社区分馆',
        ],
        'honors': [
            '荣获国际图书馆协会联合会 2021 年「绿色图书馆奖」亚军，为该届我国唯一获奖单位',
            '2023 年 12 月 18 日被文化和旅游部评定为国家一级图书馆',
        ],
        'visit': '周二至周日 9:00–21:00（每周开放不少于 72 小时），免证入馆、开架借阅',
        'transit': '地铁 14 号线坪山站一带；公交坪山文化聚落站',
    },
    {
        'id': 'guangming',
        'name': '光明区图书馆',
        'alias': '光明图',
        'district': '光明区',
        'tier': 'district',
        'address': '光明区光明街道观光路3488号（光明文化艺术中心）',
        'query': '深圳市光明区观光路3488号',
        'founded': 2012,
        'area': 35497,
        'collection': 100.0,
        'collNote': '馆藏纸质文献 100 余万册，另订阅报刊 1300 余种',
        'seats': 1791,
        'grade': '国家一级图书馆（连续两度获评）',
        'tagline': '71 台 24 小时「书香亭」织就 15 分钟阅读圈',
        'summary': (
            '成立于 2012 年 8 月 15 日，原馆址位于公明街道振明路。'
            '2020 年 9 月总馆新馆落成，2021 年 2 月 5 日正式迁入光明文化艺术中心对外开放，'
            '建筑面积 35496.8 平方米，是光明区图书馆总分馆体系的总馆与运营管理中心。'
        ),
        'highlights': [
            '馆藏纸质文献 100 余万册，订阅报刊 1300 余种，阅览座席 1791 个、服务电脑 167 台',
            '「1 个总馆 + 1 个少儿馆 + 6 个街道图书馆 + 33 个社区服务点 + 13 个社会合作馆 + 71 台 24 小时书香亭」四级联动服务网络',
            '71 台 24 小时书香亭提供自助办证、借还书、预借取书，形成 15 分钟阅读圈',
            '2025 年 8 月上线「玻尔科学导航」AI 科研助手，为首家上线该平台的公共图书馆',
            '「光明大讲坛」「寻找光明记忆」「星阅光明科学季」等品牌活动',
            '下设光明区书香传播志愿队，注册志愿者超 7000 名',
        ],
        'honors': [
            '2023 年 11 月第七次全国县级以上公共图书馆评估定级中第二次获评国家一级图书馆',
            '「书香乐韵 志愿同行」获评 2025 年度深圳市文化志愿服务示范项目',
        ],
        'visit': '周二至周日 9:00–21:00（周一闭馆）；普通读者证可借 20 册、借期 31 天、可续借一次',
        'transit': '地铁 6 号线凤凰城站；公交光明艺术中心站',
    },
    {
        'id': 'dapeng',
        'name': '大鹏新区图书馆',
        'alias': '大鹏图',
        'district': '大鹏新区',
        'tier': 'district',
        'address': '大鹏新区大鹏街道迎宾路（大鹏文体中心四楼）',
        'query': '深圳市大鹏新区大鹏街道迎宾路',
        'founded': 2007,
        'area': 1000,
        'collection': 5.0,
        'collNote': '馆藏书籍近 5 万册、报刊杂志 150 余种',
        'seats': 144,
        'grade': '国家市一级图书馆',
        'tagline': '全市馆舍规模最小的区级馆',
        'summary': (
            '始建于 2007 年，原址位于大鹏办事处迎宾路。'
            '2017 年 12 月 26 日新馆在大鹏文体中心四楼开馆，建筑面积 1000 平方米、藏书近 5 万册、报刊杂志 150 余种，'
            '设成人阅览席位 96 个、少儿 24 个、电子阅览 24 个。'
        ),
        'highlights': [
            '大鹏新区唯一的市一级图书馆，属深圳「图书馆之城」建设组成部分，可实现全市通借通还与自助馆「一证通」',
            '同区域另有南澳图书馆，位于三南文体中心二层，建筑面积 950 平方米、藏书 6.2 万册、阅览座位约 150 个',
            '新区按「地广人稀」特点发展新型公共文化空间：已引进书店 4 家、书吧（书房）5 家，打造书香民宿 10 家',
            '坝光文化中心在建，其中区级图书馆建筑面积 4507 平方米',
        ],
        'honors': [],
        'visit': '周二至周日 9:00–12:00（周一闭馆，详见馆内公告）',
        'transit': '公交大鹏文体中心站；地铁 3 号线双龙站转接',
    },
    {
        'id': 'longgang-children',
        'name': '龙岗区少年儿童图书馆',
        'alias': '龙岗少儿馆',
        'district': '龙岗区',
        'tier': 'district',
        'address': '龙岗区龙城广场龙岗文化中心C区',
        'query': '深圳市龙岗区龙岗文化中心C区',
        'founded': None,
        'area': 6500,
        'collection': None,
        'collNote': '官网未单独公布少儿馆藏量，随总馆 476.92 万册件口径内统计',
        'seats': None,
        'grade': '独立建制少儿馆',
        'tagline': '与总馆同址分区的少儿阅读专区',
        'summary': (
            '位于龙岗文化中心 C 区，建筑面积约 6500 平方米，与龙岗区图书馆总馆（D 区）'
            '形成「总馆 + 少儿馆」双馆结构，是深圳中心城区之外规模领先的独立少儿阅读空间。'
        ),
        'highlights': [
            '一楼：咨询服务区、低幼服务区、少儿服务区、少儿报刊区、少儿多媒体服务区',
            '二楼：青少年服务区、经典阅读区、读者议事讨论区、少儿活动区、科创体验区、文创体验区',
        ],
        'honors': [],
        'visit': '随总馆时间：周一至周日 9:00–21:00（少儿区域时段可能单独安排）',
        'transit': '地铁 3 号线龙城广场站',
    },
]


def td_geocode(query, level=18):
    ds = {'keyWord': query, 'level': level, 'needPre': '1'}
    url = 'https://api.tianditu.gov.cn/geocoding?' + urllib.parse.urlencode(
        {'ds': json.dumps(ds, ensure_ascii=False), 'tk': TDT_TK})
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for _ in range(3):
        try:
            d = json.loads(urllib.request.urlopen(req, timeout=25).read())
            loc = d.get('location')
            if loc:
                return float(loc['lon']), float(loc['lat']), int(loc.get('score', 0)), loc.get('level', '')
            return None
        except Exception:
            time.sleep(1.5)
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_path = os.path.join(CACHE_DIR, 'geocode_sz_libraries.json')
    cache = {}
    if os.path.exists(cache_path):
        cache = json.load(open(cache_path, encoding='utf-8'))
    dry = '--dry' in sys.argv

    feats = []
    for lib in LIBRARIES:
        q = lib['query']
        if q not in cache:
            r = td_geocode(q)
            cache[q] = list(r) if r else None
            json.dump(cache, open(cache_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            time.sleep(0.8)
        c = cache[q]
        if not c:
            print('GEOCODE FAIL:', lib['name'], q)
            continue
        wlon, wlat, score, lvl = c
        glon, glat = wgs84_to_gcj02(wlon, wlat)
        props = {
            'id': lib['id'], 'name': lib['name'], 'alias': lib['alias'],
            'district': lib['district'], 'tier': lib['tier'],
            'address': lib['address'], 'founded': lib['founded'],
            'area': lib['area'], 'collection': lib['collection'],
            'collNote': lib.get('collNote', ''), 'seats': lib['seats'],
            'grade': lib['grade'], 'tagline': lib['tagline'], 'summary': lib['summary'],
            'highlights': lib['highlights'], 'honors': lib['honors'],
            'visit': lib['visit'], 'transit': lib['transit'],
            'wgs84': [round(wlon, 6), round(wlat, 6)],
            'score': score,
            'page': '/maps/sz-libraries/libraries/%s.html' % lib['id'],
        }
        feats.append({
            'type': 'Feature',
            'properties': props,
            'geometry': {'type': 'Point', 'coordinates': [round(glon, 6), round(glat, 6)]},
        })
        print('%-22s %-4s score=%-4s %-10s WGS84(%.5f,%.5f) -> GCJ02(%.5f,%.5f)' % (
            lib['name'], lib['district'], score, lvl, wlon, wlat, glon, glat))

    fc = {'type': 'FeatureCollection', 'features': feats}
    if dry:
        print(json.dumps(fc, ensure_ascii=False)[:400])
        return

    with open(os.path.join(OUT, 'libraries.json'), 'w', encoding='utf-8') as f:
        json.dump(fc, f, ensure_ascii=False, separators=(',', ':'))

    src = os.path.join(CACHE_DIR, '440300_full.json')

    # ── 辖区边界 ────────────────────────────────────────────
    # DataV.GeoAtlas 的 440300_full 只有 9 个行政区（罗湖/福田/南山/宝安/龙岗/
    # 盐田/龙华/坪山/光明）。大鹏新区是「功能区」而非行政区，其范围在 DataV 里
    # 并入龙岗区，因此**无法也不应**从行政区划数据里差集出一个大鹏面——
    # 那样造出来的是一条不存在的行政边界。本图的处理：大鹏新区只做「功能区注记」
    # （虚线圈 + 标签），辖区色块仍按 9 个行政区着色。
    src = os.path.join(CACHE_DIR, '440300_full.json')
    g = json.load(open(src, encoding='utf-8'))
    SIMP = 0.0015

    def simp_ring(ring):
        out = [ring[0]]
        for p in ring[1:]:
            if abs(p[0] - out[-1][0]) >= SIMP or abs(p[1] - out[-1][1]) >= SIMP:
                out.append(p)
        if len(out) < 4:
            out = ring[:4]
        if out[0] != out[-1]:
            out.append(out[0])
        return out

    def simp_geom(gm):
        t = gm['type']
        if t == 'Polygon':
            return {'type': t, 'coordinates': [simp_ring(r) for r in gm['coordinates']]}
        if t == 'MultiPolygon':
            return {'type': t, 'coordinates': [[simp_ring(r) for r in poly] for poly in gm['coordinates']]}
        return gm

    feats2 = []
    for f in g['features']:
        p = f['properties']
        feats2.append({
            'type': 'Feature',
            'properties': {'name': p['name'], 'adcode': p['adcode'], 'center': p.get('center'),
                           'kind': 'admin'},
            'geometry': simp_geom(f['geometry']),
        })

    with open(os.path.join(OUT, 'districts.json'), 'w', encoding='utf-8') as f:
        json.dump({'type': 'FeatureCollection', 'features': feats2}, f, ensure_ascii=False,
                  separators=(',', ':'))

    sizes = {fn: os.path.getsize(os.path.join(OUT, fn)) for fn in os.listdir(OUT)}
    print('\nlibraries: %d  districts: %d  bytes: %s' % (
        len(feats), len(feats2), json.dumps(sizes, ensure_ascii=False)))


if __name__ == '__main__':
    main()