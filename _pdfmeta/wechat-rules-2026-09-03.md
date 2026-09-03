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
