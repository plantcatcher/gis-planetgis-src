export interface BlogPost {
  title: string;
  cover: string;
  date: string;
  category: string;
  url: string;
}

/**
 * 精选博客文章（内置数据，从 D:\MyWebs\Blog\source\_posts 中挑选）
 * 涵盖商业地理、历史地理、海平面模拟、地铁交通、AI地理、地理科普等主题
 * 链接格式：https://blog.planetgis.cn/archives/{abbrlink}.html
 */
export const featuredBlogPosts: BlogPost[] = [
  {
    title: '一条长江，撑起中国经济的半壁江山',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-07-23-d84729eb3165255780708c76dbebd383-sz_3119763.gif',
    date: '2026-07-23',
    category: '商业地理',
    url: 'https://blog.planetgis.cn/archives/21e783f.html',
  },
  {
    title: '中国东部，曾有一块100万平方公里的平原，如今沉在海底',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-07-17-8f785978f8c2e44ebdf8ca49a3c31523-sz_1317727.png',
    date: '2026-07-17',
    category: '历史地理',
    url: 'https://blog.planetgis.cn/archives/42b44393.html',
  },
  {
    title: '贝加尔湖：地球的一道裂痕，中国史书里的一滴泪',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-07-17-afe754866057a43949a3c7c4e9d39855-sz_412365.jpeg',
    date: '2026-07-17',
    category: '历史地理',
    url: 'https://blog.planetgis.cn/archives/471ec79b.html',
  },
  {
    title: '假如英日互换国土，世界格局会彻底大乱吗？',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-05-12-f30c1601d8fd56dc0fab864345838f87-sz_3051233.png',
    date: '2026-05-12',
    category: '地理科普',
    url: 'https://blog.planetgis.cn/archives/b90caffe.html',
  },
  {
    title: '翻开东北城市地图，解码区域衰退底层逻辑',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-05-04-138644864918d44c3beca9322b3862b8-sz_130488.jpeg',
    date: '2026-05-04',
    category: '地理科普',
    url: 'https://blog.planetgis.cn/archives/d17c1136.html',
  },
  {
    title: '2025地铁里程：谁掉队？谁超车？',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-04-20-china-rail-transit-2025-full-ranking-list.webp',
    date: '2026-04-20',
    category: '地铁',
    url: 'https://blog.planetgis.cn/archives/d7f2def6.html',
  },
  {
    title: '【商业地理】星巴克中国版图全解析：一张地图看懂全国分布',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-03-20-53d80ea8d203c1c27c490123979c2646-sz_1006591.png',
    date: '2026-03-20',
    category: '商业地理',
    url: 'https://blog.planetgis.cn/archives/7dcdae5e.html',
  },
  {
    title: 'AI+GIS：地理行业的真正变革已到来',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-03-18-a881b78912f88d75202e3aa95ba23fc0-sz_5119824.png',
    date: '2026-03-18',
    category: 'AI地理',
    url: 'https://blog.planetgis.cn/archives/d0662a9f.html',
  },
  {
    title: '从亚洲之巅到四省相当：日本GDP三十年，一场冰与火的轮回',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-03-05-20260305171446251.png',
    date: '2026-03-05',
    category: '地理科普',
    url: 'https://blog.planetgis.cn/archives/2e206962.html',
  },
  {
    title: '模拟海平面上升70米，你的家乡，还在吗？',
    cover:
      'https://blogphoto.planetgis.cn/PicGo/2026-02-27-18be792625020c32a4b11bf5394ca2dd-sz_6478839-a4872d.png',
    date: '2026-02-23',
    category: '海平面模拟',
    url: 'https://blog.planetgis.cn/archives/84287a70.html',
  },
];
