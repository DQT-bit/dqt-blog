---
title: "你往 AI 里装的那些 skill，打开看过一眼吗？"
description: "如果你在 Claude、Codex 这些 agent 里安装第三方 skill，最好先用 NVIDIA SkillSpector 扫一遍。一次 HIGH 误报，也说明扫描结果需要结合上下文判断。"
pubDate: "Jul 04 2026"
heroImage: "/skillspector-cover.png"
tags: ["AI", "skill", "安全", "SkillSpector"]
---
写在前面：如果你也在往 Claude、Codex 这些 agent 里装第三方 skill，装之前最好扫一遍。工具是 NVIDIA 出的 SkillSpector，`pip` 一行装完，省心。

---

相信大部分人都从 GitHub 上一口气装过很多 skill——写前端的、跟 Codex 配合干活的、还有别人分享的小工具。装的时候在看什么？star 数，还有 README 里写的信息。就这两样。

至于其他内容写了什么，可能一个都没打开看过吧。

skill 这东西说白了就是一坨给 AI 看的指令加上几个能跑的脚本。你把它塞进 agent，等于是给了它一份"你该怎么干活"的说明书，外加执行权限。我从陌生人手里接过十几份这样的说明书，眼睛都没眨就让我的 AI 照着做了。

后来刷到 NVIDIA 前阵子开源了个叫 SkillSpector 的东西，专门扫 agent skill 有没有安全问题。我才后知后觉——哦，这些玩意儿是该扫一下的。

## 四分之一带病，二十分之一有毒

NVIDIA 做过一次调研，扫了四万多个公开 skill：**26.1% 存在漏洞，5.2% 疑似恶意**。

也就是说，每四个里有一个带病，每二十个里有一个可能就是故意带毒的。

它扫的东西也不是虚的。17 大类、68 种具体模式：prompt injection（在指令里藏话把你的 AI 带跑偏）、偷偷往外传数据、悄悄提权、供应链投毒、还有直接塞 `exec` `eval` `subprocess` 这种能在你机器上执行任意命令的危险代码。这些东西藏在一份两千字的 markdown 说明书里，你肉眼扫过去根本发现不了，但 AI 会老老实实照做。

装起来是真省事：

```bash
pip install "git+https://github.com/NVIDIA/skillspector.git"
```

扫一个 skill 目录：

```bash
skillspector scan <skill目录>
```

它有两种模式。默认带 LLM 分析，更准，前提是你配了个大模型的 key（随便哪家能用的都行）；加 `--no-llm` 就是纯静态扫描，不用 key，快。我图省事，用的后者，结果就撞上了下面这出。

## 它扫出来一条 HIGH，结果是乌龙

我把本机装的 skill 挨个过了一遍。大部分干干净净，轮到一个让 Claude 和 Codex 搭伙干活的 skill 时，亮了一条红的：**HIGH，工具参数滥用**。我翻到被标记的那一行，做好了删 skill 的准备，结果那行写的是这么个意思：

> 如果改动让仓库变差，用一个可以回退的 revert，**别用 `git reset --hard`**。

这是一句教别人别用危险命令的好建议。扫描器看见 `git reset --hard` 这几个字就报警，没读懂前面的"别用"其实是在否定它——静态扫描说到底是关键词匹配，分不清自然语言里的正话反话。它自己好像也不太确定，那条 HIGH 的置信度只标了 65%。

要是我看见红的直接把 skill 删了，就冤枉好人了。所以那个不用配 key 的 `--no-llm` 模式，能扫，但扫完你还得自己读一眼上下文再下结论。标签只是提醒你去看，不是结论。有条件还是配上 key 走默认模式，让 LLM 帮着理解语义，误报会少不少。

## 该信谁

装一份别人写的 skill，和从网上下载一个脚本、看都不看就直接运行，其实差不多——都是把执行权交出去，赌对方是好人。

SkillSpector 补上的是这条链子里缺的那一环：装之前，先有个东西替你把内容过一遍，把危险模式圈出来。它还支持 MCP 模式（`skillspector mcp`），能挂进任何支持 MCP 的 agent 里，理论上可以做到每次装新 skill 之前自动拦一道，而不是等你哪天想起来才手动扫。

不过比起"快去装这个工具"，那条乌龙 HIGH 给我的提醒可能更值钱：扫描能帮你缩小排查范围，但没法把风险降到零。机器把可疑的地方指出来，读懂它到底是不是问题，还得人来。

我这十几个 skill 全都扫完了，暂时没扫出问题。

下次再往 agent 里塞陌生人的东西之前，自动扫描这一步就会自动执行了。

---

最后把安装姿势放这儿，照抄就行。

仓库：github.com/NVIDIA/SkillSpector

当命令行工具用：

```bash
pip install "git+https://github.com/NVIDIA/skillspector.git"
skillspector scan <skill目录>          # 默认带 LLM 分析，要配 key
skillspector scan <skill目录> --no-llm # 纯静态，不用 key
```

想挂成 MCP 让 agent 自己调（以 Claude Code 为例，两行）：

```bash
pip install "skillspector[mcp] @ git+https://github.com/NVIDIA/skillspector.git"
claude mcp add skillspector --scope user -- skillspector mcp
```

配置完成后，重启 Claude Code 或 Codex，它就多了个 `scan_skill` 工具。之后你跟它说"扫一下 xx skill"，它自己就会去调，不用你再敲命令。就这样。
