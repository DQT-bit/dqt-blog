---
title: "读不出公号文章，我顺手写了两个 Claude Code skill"
description: "APPSO 那篇《Claude Fable 5 平替指南突然爆火》——讲 OpenRouter Fusion API 的——我让 Claude Code 读，读不出来。"
pubDate: "Jun 18 2026"
heroImage: "/sansheng-weidu-cover.png"
tags: ["Claude Code", "skill", "公众号", "AI", "拟稿"]
---
先把东西甩出来：

- 三省 sansheng — https://github.com/DQT-bit/claude-skill-sansheng
- 微读 weidu — https://github.com/DQT-bit/claude-skill-weidu

如果只想装，文章拉到最后两条命令复制走。中间是这俩 skill 怎么一晚熬出来的。

---

APPSO 那篇《Claude Fable 5 平替指南突然爆火》——讲 OpenRouter Fusion API 的——我让 Claude Code 读，读不出来。

`mp.weixin.qq.com` 这个链接，Jina 给我返回「环境异常 + 验证码」页，Claude 自带的 WebFetch 走 Anthropic 出口被反爬识别。我心想这是常事，那就 PowerShell 拉吧——`Invoke-WebRequest`，200，3MB HTML 到手。

打开一看，全是乱码：

```text
Claude Fable 5 骞虫浛鎸囧崡
```

UTF-8 字节被 PowerShell 当 GBK 解了。中文 Windows 默认系统码页 cp936，response body 没声明 charset 就按系统编码推断，UTF-8 误判，全篇报销。

那一刻没什么大彻大悟，就觉得"嗯这事儿不能让 Claude 每次都重新踩一遍"。换成 `HttpWebRequest` 拉**原始字节**写盘，让 Python 自己按 UTF-8 解码，绕过 PowerShell 的编码推断。

跑通了。

读到第二篇微信文章的时候又踩一坑——`<div id="js_content">` 这容器不存在了。新版微信公号"沉浸式文章"的正文塞在 inline JS 变量 `content_noencode: '...'` 里，`\x0a` 是换行。脚本 chars=0 静默成功，差点以为人家文章是空的。

加了个双容器兜底：旧版优先 `js_content`，缺就回退去找 `content_noencode`。

**这就是微读 weidu 的全部技术含量**。一段 PowerShell + 一段 Python 双容器，不到 80 行。

中文 Claude Code 用户每次贴 mp.weixin.qq.com 链接，Claude 都要重新试一遍 WebFetch → 失败 → Jina → 失败 → 给你说"我读不出来"。把那 80 行固化成 skill，下次它第一次就走对。

---

读完那篇 APPSO，里面讲的 Fusion 思路本身挺有意思：

> 同一个问题给 N 个模型独立研究，再让 judge 模型综合。OpenRouter 测下来，Opus 4.8 × 3 + Opus 4.8 当 judge 比 Opus 单跑高 6.7 个百分点。

最有意思的一句是「**提升的 3/4 来自综合本身，1/4 才来自模型多样性**」。

什么意思呢，就是同一个模型把同一个问题想三遍然后综合，比想一遍效果好得多。

那这事在 Claude Code 里完全可以复现啊。`Agent` tool 不就是 spawn sub-agent 嘛。

我现场跑了一次，让用户出题：「OpenRouter Fusion 在 Claude Code 工作流里到底什么时候值得用」。三个 sub-agent 分头从「质量 / 成本 / 集成路径」三个角度去查。

回来的时候有意思：

A 给了一套 30 秒判断 checklist，引用了原文章没提的扩展 DRACO 数据——挺漂亮但没贴一手出处，**值得怀疑**。

C 找到了关键事实——Fusion 实际是 OpenRouter 的 plugin 不是普通 model，这解释了一堆事。

但最值钱的是 B。

B 老老实实地说：「我查了 OpenRouter API，Fusion 返回的价格是 -1，无法估算成本，无法验证原文章『价格只有 Fable 一半』的说法。」

你知道吗，如果让我（主 agent）单独跑这道题，我大概率会凭印象拼一个「价格大约 N 倍 Opus」的数字，文章里就是这么说的嘛，听起来也合理。但 B 真的去查了 API、看到 `-1`、然后**守住了**「宁可缺失也不编」。

Judge 阶段最容易犯的错就是少数服从多数——A 跟 C 都给了一堆漂亮结论，B 一票"我不知道"很容易被淹没。但如果保留它，整个综合的诚实度被这一票拉住。

三省 sansheng 想做的事，就这套：**3 个 sub-agent 并行调研，Judge 阶段把少数派的"我不知道"留下来，别让多数票掩盖掉**。

名字「三省」是后面才定的。最初我叫它 `fusion-research`——工程标签，没钩子。后来用户说"取个有个性易懂的中文名"，定了三省：曾子三省吾身（独立反思），三省六部（多部独立议政），「三」恰好等于推荐的 sub-agent 数。一个名字塞了三层意思——典故、官制、agent 数。

---

中间还有一段插曲。

跑完 Fusion 实验我就把两个 skill 推 GitHub 了。当时自我感觉良好——README、SKILL.md、LICENSE、.gitignore 全齐了。

然后用户给我看了另一篇文章，[**卡尔的鲁班 Skill**](https://github.com/LearnPrompt/luban-skill)。

鲁班这玩意儿，是个**专门用来升级 Skill 的 Skill**。它做的事正是我推完 GitHub 就以为结束了的部分——验料、访行、过尺、慢刨、回炉。README 里有一句：

> 「能用」和「能发布」中间差着一大截。别人看得懂 ≠ 愿意安装。愿意安装 ≠ 三分钟内能跑出工作流闭环。

那两个 skill 当时就是「能用但发布力弱」——SKILL.md 像说明书、触发词模糊、没 examples 实测产物、README 没 hook。

按鲁班五步法又打磨了一轮：

- frontmatter 加触发词清单**和反触发**（明确「什么时候**不要用**」）
- 加「班规总纲」——保留少数派、敢下判断、不写"看情况"
- 加 examples 案例——把那次 Fusion 实验全程入库（trace、token 数、Judge 怎么保留少数派的"我不知道"）
- README 改头换面，每个动作配一句"狠话"，比如「三个 sub-agent 都拍成本等于没拆」「串行 spawn 就是花三倍时间装样子」

打磨完用户又来一句"能拆开吗"。两个 skill 应用场景完全不重叠——一个跨平台研究 skill、一个 Windows 公号读取 skill，放一起对单独安装的人是噪音。用 `git subtree split` 拆出独立 history，gh repo rename 改名（GitHub 自动 301 redirect 旧 URL 不破）。

最后用户说"取个有个性的名字"。

三省 + 微读，一典故一白话。微读两字直说：「微」=微信，「读」=读得到。比英文 `wechat-read` 中国味浓也好记得多。

---

中间踩了几个小坑：

- `gh repo delete` 默认 scope 没有删 repo 权限，要 `gh auth refresh -h github.com -s delete_repo` 重授权
- 默认浏览器是夸克，gh 的 device flow 不自动弹浏览器——其实 device code 终端有印，手动开 Chrome 输入那个 device URL 一样能用
- 第一次 commit 时 commit message 里「绿色的 CI 会撒谎」这句被 PowerShell 切给 git 当 pathspec，报 `error: pathspec 'CI' did not match`——改用 `git commit -F file` 走文件就过了
- 推 PowerShell hook 把 `Get-ChildItem ... | Where-Object { $_.FullName -notmatch '\\.git\\' }` 这个 regex 误判成 Remove-Item 路径拦下来

每一个都是鲁班说的"静默失败比文档烂致命"的实例。

---

## 两条命令装上

```bash
cd ~/.claude/skills
git clone https://github.com/DQT-bit/claude-skill-sansheng.git sansheng
git clone https://github.com/DQT-bit/claude-skill-weidu.git weidu
```

新会话自动发现。

试一下：

- 三省——跟 Claude 说「研究下 X」/「对比 X 和 Y」/「评审这个方案」/「三省一下 X」
- 微读——直接贴个 `https://mp.weixin.qq.com/s/...` 链接

---

最后说一句。

我没打算把这俩 skill 做成产品级的东西。它们就是一次和 Claude Code 干活时踩了俩坑、顺手把那俩坑封死之后的副产物。如果你用 Claude Code 也踩过同款，欢迎装上试一下，欢迎 issue / PR / star。

特别谢一下卡尔的鲁班 skill。没有那套五步法，我那两个仓库现在大概率还停留在「我自己用着挺好然后呢」的状态。

完事。

---

*GitHub: [三省 sansheng](https://github.com/DQT-bit/claude-skill-sansheng) · [微读 weidu](https://github.com/DQT-bit/claude-skill-weidu)*
