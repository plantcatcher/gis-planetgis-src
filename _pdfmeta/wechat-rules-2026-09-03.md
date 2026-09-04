# 公众号自动回复规则 + R2 上传（2026-09-03 新增 5 本教材）

> 本批新增 5 个 gated 资料详情页，需：① 上传 PDF 到 R2；② 在公众号后台建自动回复规则。

## 一、公众号后台自动回复规则（半匹配，任一关键词命中即回）

回复格式统一为：
`你的下载验证码是：<code>\n资料详情页：https://planetgis.cn/downloads/<slug>`
（**不要给裸 PDF 直链**）

| 序号 | 命中关键词（半匹配，逗号分隔） | 回复 code | 资料页链接 |
|---|---|---|---|
| 1 | `wenhua-dili-xue` / `文化地理学` / `周尚意文化地理学` | NSH-RW-002 | https://planetgis.cn/downloads/wenhua-dili-xue |
| 2 | `zhiwu-dili-xue` / `植物地理学第4版` / `植物地理学` | NSH-ZR-002 | https://planetgis.cn/downloads/zhiwu-dili-xue |
| 3 | `dimao-xue-yuanli` / `地貌学原理` / `杨景春地貌学` | NSH-ZR-003 | https://planetgis.cn/downloads/dimao-xue-yuanli |
| 4 | `gaodeng-diqiu-huaxue` / `高等地球化学` / `地球化学` | NSH-DQHX-001 | https://planetgis.cn/downloads/gaodeng-diqiu-huaxue |
| 5 | `zhongguo-lishi-rendili` / `中国历史人文地理` / `邹逸麟历史人文地理` | NSH-RW-003 | https://planetgis.cn/downloads/zhongguo-lishi-rendili |

> 注：关键词 `地球化学` 同时会命中本书；若日后新增《地球化学》（陈骏等），需改别名避免冲突。

### 每本回复正文（直接复制进后台，已带书名与验证码）

**1. 文化地理学**
> 关键词（半匹配，任一命中即回）：`wenhua-dili-xue` / `文化地理学` / `周尚意文化地理学`
```
你好，你要的《文化地理学》（周尚意等编著）已经整理好了。
下载验证码：NSH-RW-002
凭码在详情页下载：https://planetgis.cn/downloads/wenhua-dili-xue
```

**2. 植物地理学（第四版）**
> 关键词（半匹配，任一命中即回）：`zhiwu-dili-xue` / `植物地理学第4版` / `植物地理学`
```
你好，你要的《植物地理学（第四版）》（武吉华等编著）已经整理好了。
下载验证码：NSH-ZR-002
凭码在详情页下载：https://planetgis.cn/downloads/zhiwu-dili-xue
```

**3. 地貌学原理（第四版）**
> 关键词（半匹配，任一命中即回）：`dimao-xue-yuanli` / `地貌学原理` / `杨景春地貌学`
```
你好，你要的《地貌学原理（第四版）》（杨景春、李有利编著）已经整理好了。
下载验证码：NSH-ZR-003
凭码在详情页下载：https://planetgis.cn/downloads/dimao-xue-yuanli
```

**4. 高等地球化学**
> 关键词（半匹配，任一命中即回）：`gaodeng-diqiu-huaxue` / `高等地球化学` / `地球化学`
```
你好，你要的《高等地球化学》（中科院地球化学研究所编）已经整理好了。
下载验证码：NSH-DQHX-001
凭码在详情页下载：https://planetgis.cn/downloads/gaodeng-diqiu-huaxue
```

**5. 中国历史人文地理**
> 关键词（半匹配，任一命中即回）：`zhongguo-lishi-rendili` / `中国历史人文地理` / `邹逸麟历史人文地理`
```
你好，你要的《中国历史人文地理》（邹逸麟主编）已经整理好了。
下载验证码：NSH-RW-003
凭码在详情页下载：https://planetgis.cn/downloads/zhongguo-lishi-rendili
```

## 二、R2 上传（替换各 md 的 download 占位链接）

PDF 源文件已重命名为 slug（`C:/Users/ZhuanZ/Downloads/<slug>.pdf`），目标对象名 = `book/<slug>.pdf`，桶 = `downloads.planetgis.cn`。因源文件名已是 slug，直接 copy 即可，无需 `--dest-name`。

### 方式 A：rclone（若已配置 `r2` remote）
```powershell
# 在 Downloads 目录下执行，文件名即 slug，自动落到 book/<slug>.pdf
cd C:/Users/ZhuanZ/Downloads
rclone copy wenhua-dili-xue.pdf       r2:downloads.planetgis.cn/book/
rclone copy zhiwu-dili-xue.pdf        r2:downloads.planetgis.cn/book/
rclone copy dimao-xue-yuanli.pdf      r2:downloads.planetgis.cn/book/
rclone copy gaodeng-diqiu-huaxue.pdf  r2:downloads.planetgis.cn/book/
rclone copy zhongguo-lishi-rendili.pdf r2:downloads.planetgis.cn/book/
```

### 方式 B：AWS CLI（Cloudflare R2）
```powershell
cd C:/Users/ZhuanZ/Downloads
aws s3 cp wenhua-dili-xue.pdf       s3://downloads.planetgis.cn/book/ --endpoint-url https://<accountid>.r2.cloudflarestorage.com
aws s3 cp zhiwu-dili-xue.pdf        s3://downloads.planetgis.cn/book/ --endpoint-url https://<accountid>.r2.cloudflarestorage.com
aws s3 cp dimao-xue-yuanli.pdf      s3://downloads.planetgis.cn/book/ --endpoint-url https://<accountid>.r2.cloudflarestorage.com
aws s3 cp gaodeng-diqiu-huaxue.pdf  s3://downloads.planetgis.cn/book/ --endpoint-url https://<accountid>.r2.cloudflarestorage.com
aws s3 cp zhongguo-lishi-rendili.pdf s3://downloads.planetgis.cn/book/ --endpoint-url https://<accountid>.r2.cloudflarestorage.com
```

### 上传后
逐本把 `content/downloads/<slug>.md` 的 `download:` 从
`https://downloads.planetgis.cn/book/<slug>.pdf`（已是真实路径，无需改）
确认即可——占位链接与 R2 对象名一致，上传后自动生效。

## 三、各本 download 字段现状（已与 R2 对象名对齐，上传即生效）
- wenhua-dili-xue → https://downloads.planetgis.cn/book/wenhua-dili-xue.pdf
- zhiwu-dili-xue → https://downloads.planetgis.cn/book/zhiwu-dili-xue.pdf
- dimao-xue-yuanli → https://downloads.planetgis.cn/book/dimao-xue-yuanli.pdf
- gaodeng-diqiu-huaxue → https://downloads.planetgis.cn/book/gaodeng-diqiu-huaxue.pdf
- zhongguo-lishi-rendili → https://downloads.planetgis.cn/book/zhongguo-lishi-rendili.pdf

---

## 四、2026-09-03 第二批新增 7 本（大学教材 / 专著）

> 本批 7 个 gated 资料详情页，需：① 上传 PDF 到 R2；② 在公众号后台建自动回复规则。

### 4.1 公众号后台自动回复规则（半匹配，任一关键词命中即回）

回复格式统一：`你的下载验证码是：<code>\n资料详情页：https://planetgis.cn/downloads/<slug>`（**不要给裸 PDF 直链**）

| 序号 | 命中关键词（半匹配，逗号分隔） | 回复 code | 资料页链接 |
|---|---|---|---|
| 6 | `dili-xinxitong-kongjian` / `地理信息系统空间分析原理` / `GIS空间分析原理` | NSH-GIS-009 | https://planetgis.cn/downloads/dili-xinxitong-kongjian |
| 7 | `haiyang-ziyuan-gailun` / `海洋资源概论` / `朱晓东海洋资源` | NSH-HY-001 | https://planetgis.cn/downloads/haiyang-ziyuan-gailun |
| 8 | `haiyang-kexue-daolun` / `海洋科学导论` / `冯士筰海洋科学` | NSH-HY-002 | https://planetgis.cn/downloads/haiyang-kexue-daolun |
| 9 | `shijie-dili` / `世界地理` / `杨青山世界地理` | NSH-RW-004 | https://planetgis.cn/downloads/shijie-dili |
| 10 | `tianye-kaogu-huitu` / `田野考古绘图` / `马鸿藻考古绘图` | NSH-KG-001 | https://planetgis.cn/downloads/tianye-kaogu-huitu |
| 11 | `shijie-chengshi-baohu` / `世界伟大城市的保护` / `城市保护安东尼滕` | NSH-CS-010 | https://planetgis.cn/downloads/shijie-chengshi-baohu |
| 12 | `chengshi-fazhanshi` / `城市发展史` / `芒福德城市发展史` | NSH-CS-011 | https://planetgis.cn/downloads/chengshi-fazhanshi |

### 4.2 每本回复正文（直接复制进后台，已带书名与验证码）

**6. 地理信息系统空间分析原理**
> 关键词（半匹配）：`dili-xinxitong-kongjian` / `地理信息系统空间分析原理` / `GIS空间分析原理`
```
你好，你要的《地理信息系统空间分析原理》（周成虎、裴韬等编著）已经整理好了。
下载验证码：NSH-GIS-009
凭码在详情页下载：https://planetgis.cn/downloads/dili-xinxitong-kongjian
```

**7. 海洋资源概论**
> 关键词（半匹配）：`haiyang-ziyuan-gailun` / `海洋资源概论` / `朱晓东海洋资源`
```
你好，你要的《海洋资源概论》（朱晓东等编著）已经整理好了。
下载验证码：NSH-HY-001
凭码在详情页下载：https://planetgis.cn/downloads/haiyang-ziyuan-gailun
```

**8. 海洋科学导论**
> 关键词（半匹配）：`haiyang-kexue-daolun` / `海洋科学导论` / `冯士筰海洋科学`
```
你好，你要的《海洋科学导论》（冯士筰、李凤岐、李少菁主编）已经整理好了。
下载验证码：NSH-HY-002
凭码在详情页下载：https://planetgis.cn/downloads/haiyang-kexue-daolun
```

**9. 世界地理**
> 关键词（半匹配）：`shijie-dili` / `世界地理` / `杨青山世界地理`
```
你好，你要的《世界地理》（杨青山、韩杰、丁四保主编）已经整理好了。
下载验证码：NSH-RW-004
凭码在详情页下载：https://planetgis.cn/downloads/shijie-dili
```

**10. 田野考古绘图**
> 关键词（半匹配）：`tianye-kaogu-huitu` / `田野考古绘图` / `马鸿藻考古绘图`
```
你好，你要的《田野考古绘图》（马鸿藻著）已经整理好了。
下载验证码：NSH-KG-001
凭码在详情页下载：https://planetgis.cn/downloads/tianye-kaogu-huitu
```

**11. 世界伟大城市的保护**
> 关键词（半匹配）：`shijie-chengshi-baohu` / `世界伟大城市的保护` / `城市保护安东尼滕`
```
你好，你要的《世界伟大城市的保护：历史大都会的毁灭与重建》（[美]安东尼·滕著，郝笑丛译）已经整理好了。
下载验证码：NSH-CS-010
凭码在详情页下载：https://planetgis.cn/downloads/shijie-chengshi-baohu
```

**12. 城市发展史**
> 关键词（半匹配）：`chengshi-fazhanshi` / `城市发展史` / `芒福德城市发展史`
```
你好，你要的《城市发展史：起源、演变和前景》（[美]刘易斯·芒福德著，宋俊岭、倪文彦译）已经整理好了。
下载验证码：NSH-CS-011
凭码在详情页下载：https://planetgis.cn/downloads/chengshi-fazhanshi
```

### 4.3 R2 上传（替换各 md 的 download 占位链接）

PDF 源文件已重命名为 slug（`C:/Users/ZhuanZ/Downloads/<slug>.pdf`），目标对象名 = `book/<slug>.pdf`，桶 = `downloads.planetgis.cn`。因源文件名已是 slug，直接 copy 即可。

**方式 A：rclone**
```powershell
cd C:/Users/ZhuanZ/Downloads
rclone copy dili-xinxitong-kongjian.pdf  r2:downloads.planetgis.cn/book/
rclone copy haiyang-ziyuan-gailun.pdf    r2:downloads.planetgis.cn/book/
rclone copy haiyang-kexue-daolun.pdf     r2:downloads.planetgis.cn/book/
rclone copy shijie-dili.pdf              r2:downloads.planetgis.cn/book/
rclone copy tianye-kaogu-huitu.pdf       r2:downloads.planetgis.cn/book/
rclone copy shijie-chengshi-baohu.pdf    r2:downloads.planetgis.cn/book/
rclone copy chengshi-fazhanshi.pdf       r2:downloads.planetgis.cn/book/
```

**方式 B：AWS CLI（Cloudflare R2）**
```powershell
cd C:/Users/ZhuanZ/Downloads
$ep = "https://<accountid>.r2.cloudflarestorage.com"
aws s3 cp dili-xinxitong-kongjian.pdf r2:downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp haiyang-ziyuan-gailun.pdf   r2:downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp haiyang-kexue-daolun.pdf    r2:downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp shijie-dili.pdf             r2:downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp tianye-kaogu-huitu.pdf      r2:downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp shijie-chengshi-baohu.pdf   r2:downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp chengshi-fazhanshi.pdf      r2:downloads.planetgis.cn/book/ --endpoint-url $ep
```

> 占位链接 `https://downloads.planetgis.cn/book/<slug>.pdf` 与 R2 对象名一致，上传后即生效，无需改 md。

### 4.4 各本 download 字段现状
- dili-xinxitong-kongjian → https://downloads.planetgis.cn/book/dili-xinxitong-kongjian.pdf
- haiyang-ziyuan-gailun → https://downloads.planetgis.cn/book/haiyang-ziyuan-gailun.pdf
- haiyang-kexue-daolun → https://downloads.planetgis.cn/book/haiyang-kexue-daolun.pdf
- shijie-dili → https://downloads.planetgis.cn/book/shijie-dili.pdf
- tianye-kaogu-huitu → https://downloads.planetgis.cn/book/tianye-kaogu-huitu.pdf
- shijie-chengshi-baohu → https://downloads.planetgis.cn/book/shijie-chengshi-baohu.pdf
- chengshi-fazhanshi → https://downloads.planetgis.cn/book/chengshi-fazhanshi.pdf

---

## 五、2026-09-05 第三批新增 6 本（历史地图 / 综合图册 / 地质学）

> 本批 6 个 gated 资料详情页，需：① 上传 PDF 到 R2（源文件名非 slug，需重命名）；② 在公众号后台建自动回复规则。
> 注：三本历史地图集（俄国/美国/世界）的别名均含「历史地图」，若用户只发「历史地图」会同时命中多本，建议引导用户发 slug 或带国别/书名的关键词。

### 5.1 公众号后台自动回复规则（半匹配，任一关键词命中即回）

回复格式统一为：
`你的下载验证码是：<code>\n资料详情页：https://planetgis.cn/downloads/<slug>`
（**不要给裸 PDF 直链**）

| 序号 | 命中关键词（半匹配，逗号分隔） | 回复 code | 资料页链接 |
|---|---|---|---|
| 13 | `dizhi-xue-jichu` / `地质学基础` / `宋春青地质学基础` / `地质学基础第四版` | NSH-ZR-005 | https://planetgis.cn/downloads/dizhi-xue-jichu |
| 14 | `shuijingzhu-shuixi-tuji` / `水经注水系图集` / `水经注地图集上册` / `张步天水经注` | NSH-RW-007 | https://planetgis.cn/downloads/shuijingzhu-shuixi-tuji |
| 15 | `shuijingzhu-zonghe-tuce` / `水经注综合图册` / `水经注地图集下册` / `张步天水经注地图集` | NSH-RW-008 | https://planetgis.cn/downloads/shuijingzhu-zonghe-tuce |
| 16 | `eguo-lishi-ditu` / `俄国历史地图` / `俄罗斯历史地图` / `吉尔伯特俄国历史地图` | NSH-RW-009 | https://planetgis.cn/downloads/eguo-lishi-ditu |
| 17 | `meiguo-lishi-ditu` / `美国历史地图` / `美国历史地图集` / `吉尔伯特美国历史` | NSH-RW-010 | https://planetgis.cn/downloads/meiguo-lishi-ditu |
| 18 | `shijie-lishi-ditu-ji` / `世界历史地图集` / `张芝联世界历史地图` / `世界历史地图` | NSH-RW-011 | https://planetgis.cn/downloads/shijie-lishi-ditu-ji |

### 5.2 每本回复正文（直接复制进后台，已带书名与验证码）

**13. 地质学基础（第四版）**
> 关键词（半匹配）：`dizhi-xue-jichu` / `地质学基础` / `宋春青地质学基础` / `地质学基础第四版`
```
你好，你要的《地质学基础（第四版）》（宋春青、邱维理、张振春编著）已经整理好了。
下载验证码：NSH-ZR-005
凭码在详情页下载：https://planetgis.cn/downloads/dizhi-xue-jichu
```

**14. 水经注地图集（上）：水系图集**
> 关键词（半匹配）：`shuijingzhu-shuixi-tuji` / `水经注水系图集` / `水经注地图集上册` / `张步天水经注`
```
你好，你要的《水经注地图集（上）：水系图集》（张步天编绘）已经整理好了。
下载验证码：NSH-RW-007
凭码在详情页下载：https://planetgis.cn/downloads/shuijingzhu-shuixi-tuji
```

**15. 水经注地图集（下）：综合图册**
> 关键词（半匹配）：`shuijingzhu-zonghe-tuce` / `水经注综合图册` / `水经注地图集下册` / `张步天水经注地图集`
```
你好，你要的《水经注地图集（下）：综合图册》（张步天编绘）已经整理好了。
下载验证码：NSH-RW-008
凭码在详情页下载：https://planetgis.cn/downloads/shuijingzhu-zonghe-tuce
```

**16. 俄国历史地图（第三版）**
> 关键词（半匹配）：`eguo-lishi-ditu` / `俄国历史地图` / `俄罗斯历史地图` / `吉尔伯特俄国历史地图`
```
你好，你要的《俄国历史地图（第三版）》（[英]马丁·吉尔伯特著，王玉菡译）已经整理好了。
下载验证码：NSH-RW-009
凭码在详情页下载：https://planetgis.cn/downloads/eguo-lishi-ditu
```

**17. 美国历史地图（第四版）**
> 关键词（半匹配）：`meiguo-lishi-ditu` / `美国历史地图` / `美国历史地图集` / `吉尔伯特美国历史`
```
你好，你要的《美国历史地图（第四版）》（[英]马丁·吉尔伯特著，王玉菡译）已经整理好了。
下载验证码：NSH-RW-010
凭码在详情页下载：https://planetgis.cn/downloads/meiguo-lishi-ditu
```

**18. 世界历史地图集**
> 关键词（半匹配）：`shijie-lishi-ditu-ji` / `世界历史地图集` / `张芝联世界历史地图` / `世界历史地图`
```
你好，你要的《世界历史地图集》（张芝联、刘学荣主编）已经整理好了。
下载验证码：NSH-RW-011
凭码在详情页下载：https://planetgis.cn/downloads/shijie-lishi-ditu-ji
```

### 5.3 R2 上传（源文件已重命名为 slug，直接 copy 即落到 book/<slug>.pdf）

目标桶 = `downloads.planetgis.cn`，对象名固定 = `book/<slug>.pdf`（与 md 的 `download` 字段一致，上传即生效，无需改 md）。

**方式 A：rclone**
```powershell
cd C:/Users/ZhuanZ/Downloads
rclone copy dizhi-xue-jichu.pdf         r2:downloads.planetgis.cn/book/
rclone copy shuijingzhu-shuixi-tuji.pdf r2:downloads.planetgis.cn/book/
rclone copy shuijingzhu-zonghe-tuce.pdf r2:downloads.planetgis.cn/book/
rclone copy eguo-lishi-ditu.pdf         r2:downloads.planetgis.cn/book/
rclone copy meiguo-lishi-ditu.pdf       r2:downloads.planetgis.cn/book/
rclone copy shijie-lishi-ditu-ji.pdf    r2:downloads.planetgis.cn/book/
```

**方式 B：AWS CLI（Cloudflare R2）**
```powershell
cd C:/Users/ZhuanZ/Downloads
$ep = "https://<accountid>.r2.cloudflarestorage.com"
aws s3 cp dizhi-xue-jichu.pdf         s3://downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp shuijingzhu-shuixi-tuji.pdf s3://downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp shuijingzhu-zonghe-tuce.pdf s3://downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp eguo-lishi-ditu.pdf         s3://downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp meiguo-lishi-ditu.pdf       s3://downloads.planetgis.cn/book/ --endpoint-url $ep
aws s3 cp shijie-lishi-ditu-ji.pdf    s3://downloads.planetgis.cn/book/ --endpoint-url $ep
```

### 5.4 各本 download 字段现状（占位链接已与 R2 对象名对齐，上传即生效）
- dizhi-xue-jichu → https://downloads.planetgis.cn/book/dizhi-xue-jichu.pdf
- shuijingzhu-shuixi-tuji → https://downloads.planetgis.cn/book/shuijingzhu-shuixi-tuji.pdf
- shuijingzhu-zonghe-tuce → https://downloads.planetgis.cn/book/shuijingzhu-zonghe-tuce.pdf
- eguo-lishi-ditu → https://downloads.planetgis.cn/book/eguo-lishi-ditu.pdf
- meiguo-lishi-ditu → https://downloads.planetgis.cn/book/meiguo-lishi-ditu.pdf
- shijie-lishi-ditu-ji → https://downloads.planetgis.cn/book/shijie-lishi-ditu-ji.pdf
