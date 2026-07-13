---
title: "这个 16.7 万 Star 的开发 Skill，值得挑着装"
description: "mattpocock/skills 把需求澄清、测试、排错、代码审查和任务交接拆成轻量 Skill，可以按项目需要自由组合。"
pubDate: "Jul 13 2026"
heroImage: "/mattpocock-skills-cover.png"
tags: ["AI", "Agent Skills", "Codex", "Claude Code"]
---

今天刷到雪踏乌云推荐了一套开发 Skill，仓库叫 `mattpocock/skills`。

我点进去看了一圈，目前已经有 16.7 万 Star、1.44 万 Fork。这个数字确实夸张，它能火起来也有实用层面的原因。

这套 Skill 的作者是 Matt Pocock。他把自己日常开发中使用的 Agent 工作流整理了出来，支持 Claude Code、Codex 和其他能够加载 Skill 的编程 Agent。

项目地址：<https://github.com/mattpocock/skills>

很多开发工作流装上以后，会顺手接管需求、规划、任务拆分、编码和验收。流程看着完整，实际用起来有点重。项目稍微偏离预设路线，想改一处都得先弄明白它那套规则。

`mattpocock/skills` 的思路轻很多。每个 Skill 只处理一个具体环节，可以单独使用，也可以自由组合。今天需要梳理需求就装需求相关的，明天要查 Bug 再调用诊断流程，不用为了一个功能把整套开发系统搬进项目。

仓库里目前有二十多个 Skill，我觉得下面几个比较值得先看。

`grill-me` 会围绕你的想法连续追问，把含糊的需求问清楚。很多时候 Agent 做偏了，是因为开工前双方理解的就不是同一件事，和代码能力关系不大。

`grill-with-docs` 在追问之外，还会整理项目术语、上下文和 ADR。项目里的缩写、业务名词和历史决定有了固定记录，Agent 后面写代码时就不必反复猜。

`tdd` 提供红灯、绿灯、重构的测试循环。它要求 Agent 先写一个会失败的测试，再补实现，最后整理代码。这个流程不花哨，但能让 Agent 每走一步都拿到反馈。

`diagnosing-bugs` 用来查复杂 Bug。它会按复现、缩小范围、提出假设、加日志、修复和回归测试的顺序推进，能减少 Agent 看见报错后直接乱改代码的情况。

`code-review` 会分别检查代码规范和需求完成度。代码能跑，不代表需求做对了；需求对上了，也不代表代码以后好维护。把两项分开检查，结果会清楚很多。

还有一个 `handoff`，特别适合长任务。当前会话快到上限时，它会把进度、决定和剩余工作整理成一份交接文档，让下一个 Agent 接着干。

安装也很简单：

```bash
npx skills@latest add mattpocock/skills
```

安装时可以自己选择需要的 Skill，以及要装给哪个编程 Agent。仓库建议同时选择 `setup-matt-pocock-skills`，第一次运行时会询问任务管理方式、标签和文档保存位置。

我建议先装两三个最常用的。需求容易跑偏，就从 `grill-with-docs` 开始；代码经常修了又坏，可以搭配 `tdd` 和 `diagnosing-bugs`；经常跨会话开发，再补一个 `handoff`。

Skill 装得多，不会自动让 Agent 更会写代码。能解决你反复遇到的问题，又不会把开发流程弄得更复杂，这样的组合才值得留下。
