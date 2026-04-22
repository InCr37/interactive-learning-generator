---
name: interactive-learning-generator
description: "Transform traditional learning materials (PDF/DOCX/PPTX/text/images) into interactive learning experiences using progressive disclosure, contextual narrative, and constructive failure feedback. Generates branching dialogues, multiple-choice questions, and interactive exercises with language-adaptive output (English/Chinese). Outputs structured JSON data for direct use in AI conversations, enabling lightweight deployment across different AI agent platforms."
description_zh: "将传统学习材料（PDF/DOCX/PPTX/文本/图片）转化为高度互动的学习体验，应用渐进式揭露、情境化叙事、建设性失败反馈等教学设计原则，生成分支对话、选择题和互动练习。支持语言自适应（中英文），自动检测输入语言并生成匹配语言的互动内容。输出结构化JSON数据，可直接在AI对话中使用，轻量化适配不同AI agent平台。"
description_en: "Transform traditional learning materials (PDF/DOCX/PPTX/text/images) into interactive learning experiences using progressive disclosure, contextual narrative, and constructive failure feedback. Generates branching dialogues, multiple-choice questions, and interactive exercises with language-adaptive output (English/Chinese). Outputs structured JSON data for direct use in AI conversations, enabling lightweight deployment across different AI agent platforms."
version: "1.3.0"
homepage: ""
allowed-tools: Read,Write,Bash,Edit,Execute
triggers:
  - 互动学习
  - 学习材料转化
  - 分支对话
  - 渐进式学习
  - 选择题生成
  - 互动练习
  - 教学设计
  - 教育技术
  - 学习体验设计
  - 游戏化教学
  - 情境化学习
  - 失败即学习
  - 渐进式揭露
  - 先讲后练
  - 渐进式代码建构
  - 理解确认
  - 小步快走
  - 视觉化代码注释
  - 实时困难检测
  - 自适应语言切换
  - interactive learning
  - learning material transformation
  - branching dialogue
  - progressive learning
  - multiple choice generation
  - interactive exercises
  - instructional design
  - educational technology
  - learning experience design
  - gamified teaching
  - contextual learning
  - failure as learning
  - progressive disclosure
  - proactive teaching
  - teach before quiz
  - progressive code building
  - understanding confirmation
  - chunked delivery
  - beginner-friendly
examples:
  - "将这份微积分讲义转化为互动学习体验"
  - "为这个电路原理章节创建分支对话练习"
  - "生成关于细胞分裂的渐进式选择题"
  - "把这份历史文档变成情境化学习模块"
  - "应用渐进式揭露原则设计编程概念学习路径"
  - "Transform this calculus handout into an interactive learning experience"
  - "Create branching dialogue exercises for this circuit theory chapter"
  - "Generate progressive multiple-choice questions about cell division"
  - "Turn this historical document into a contextual learning module"
  - "Design a learning path for programming concepts using progressive disclosure"
uses_skills:
  - pdf
  - docx
  - pptx
  # 可选：minimax-image-generator（用于生成教学插图）
uses_subagents:
  - code-explorer
---

# 渐进式互动学习生成器

## 概述

本技能基于现代教学设计原则，将传统学习材料（PDF、DOCX、PPTX、TXT、MD、图片）转化为高度互动的学习体验。通过应用**渐进式揭露**、**情境化叙事**、**建设性失败反馈**和**无缝教学流**等原则，生成包含分支对话、选择题、互动练习的多格式输出。**语言自适应**功能自动检测输入材料的主要语言（英语或中文），并全程使用匹配语言生成互动内容，确保学习体验的语言一致性。

**核心设计理念**：隐藏游戏化表层设计，专注于教学设计的内核，避免学习者"出戏"。所有互动设计服务于概念理解，而非游戏娱乐。

## 输入输出

### 支持的输入格式
- **文档**：PDF、DOCX、PPTX、TXT、MD
- **图片**：JPG、PNG、GIF（通过多模态内容提取）
- **直接文本**：用户粘贴或输入的学习材料

### 输出格式
1. **JSON结构化数据**：包含完整学习路径、对话树、题目和反馈数据的结构化JSON，可直接在AI对话中驱动互动学习体验

## 核心功能

### 1. 智能内容分析
- 自动识别学习材料中的关键概念、实体和关系
- 检测学习目标和预期掌握程度
- 评估概念复杂度和学习难点
- 构建学习路径和依赖关系图

### 2. 教学设计原则应用
- **渐进式揭露**：将复杂概念分解为递进的学习单元
- **情境化叙事**：将学习点嵌入到真实世界场景中
- **建设性失败反馈**：错误选择触发详细认知建构，而非简单惩罚
- **无缝教学流**：所有理论点融入问题解决流程，无弹窗打断
- **高频提问**：每个关键概念至少对应一个问题，问题类型多样化（选择/简答/情境），提问时机分散在学习过程中
- **解题机会**：允许多次尝试（默认3次），提供渐进式提示（概念提示→步骤指导→完整解答），错误触发建设性反馈
- **难度分级**：三级难度体系（基础/应用/综合），对应不同的认知水平和成功阈值（70%/50%/30%正确率目标），确保问题在最近发展区
- **智能调整**：基于实时表现（正确率、尝试次数、答题时间、错误模式）动态调整题目难度、数量和反馈，实现个性化学习路径
- **先讲后练（Proactive Teaching）**：每个概念必须先充分讲解，再进行练习。禁止在未讲解概念前直接提问。确保学习者建立正确的心理模型后再检验理解。
- **渐进式代码建构（Progressive Code Building）**：代码示例必须分步展示，每次只引入一个新元素。先展示结构和骨架，再逐步填充细节。使用"先搭建框架，再逐步填充"的呈现方式。
- **理解确认（Understanding Confirmation）**：在进入下一主题前，必须确认学习者真正理解当前内容。使用"你能用自己的话解释吗？"等主动输出型检查，而非简单的是非题。
- **小步快走（Chunked Delivery）**：每次只教授一个核心概念，提供充足时间消化。避免信息过载（认知负荷理论）。单个教学单元控制在3-5分钟以内。
- **视觉化代码注释（Visual Code Highlighting）**：代码示例必须配合语法高亮和逐行解释。区分关键字、变量、运算符等不同元素。用颜色/标记让代码结构一目了然。
- **实时困难检测（Real-time Struggle Detection）**：自动识别学习者困惑信号（回答错误、请求帮助、长时间停顿）。当检测到困难时，自动提供额外解释或降级难度。
- **自适应语言切换（Adaptive Language）**：根据用户偏好和内容难度自动调整语言复杂度。检测到专业术语时自动提供通俗解释或双语对照。

### 3. 互动内容生成
- **分支对话树**：引导式问答对话，模拟学习助手指导
- **选择题与检查点**：情境化知识应用，即时反馈
- **互动练习**：实践操作场景，应用所学知识解决问题
- **可视化增强**：自动生成概念示意图、流程图等教学插图

### 4. 中性化界面设计
- 不使用游戏特定角色、场景、术语
- 专业教育视觉风格：清晰排版、教育蓝/绿色调
- 中性引导角色："学习助手"、"知识导师"、"系统引导"
- 聚焦学习内容，避免认知分散

### 5. 语言自适应
- **自动语言检测**：分析输入材料的主要语言（英语、中文等）
- **全流程语言匹配**：如果学习材料以英语为主，整个互动学习过程（叙述、对话、反馈、界面）均使用英语
- **双语支持**：可处理中英混合材料，根据内容比例自动调整输出语言
- **术语一致性**：保持专业术语的准确翻译和上下文一致性
- **文化适应性**：根据目标语言调整示例、场景和文化背景

## 使用场景

### 教育工作者
- 将传统讲义转化为互动学习模块
- 为学生创建个性化学习路径
- 生成形成性评估和练习题

### 自学者
- 将学习笔记转化为互动复习材料
- 创建自我测试和知识检查点
- 通过探索式学习理解复杂概念

### 培训开发者
- 将培训材料转化为沉浸式学习体验
- 设计情境化案例研究和决策练习
- 创建分支式培训模拟

## 工作流程

1. **输入处理**：根据文件类型调用相应技能提取结构化文本
2. **概念分析**：识别关键概念、学习目标、难点和依赖关系
3. **互动设计**：应用教学设计原则，生成分支叙事、选择题、练习
4. **内容生成**：（可选）调用图像生成技能创建教学插图
5. **JSON输出**：将互动内容转换为结构化JSON数据，供AI对话直接使用

## 技术实现

- **运行时环境**：Node.js 18+（与WorkBuddy技能框架兼容）
- **核心框架**：WorkBuddy Skill API
- **文本处理**：natural（NLP库）、franc（语言检测库）
- **JSON输出**：原生JavaScript对象序列化，无模板依赖
- **模块化架构**：处理器→分析器→生成器→JSON序列化管道
- **轻量化设计**：无HTML/Twine模板依赖，最小化外部技能依赖，专注于AI对话交互

## 示例

### 输入示例（微积分概念）
```
## 定积分的基本概念
定积分表示函数在某一区间上的面积累积。数学表达式为 ∫[a,b] f(x)dx。

关键思想：
1. 分割：将区间 [a,b] 分成 n 个子区间
2. 近似：在每个子区间上用矩形面积近似曲线下面积
3. 求和：将所有矩形面积相加
4. 取极限：让子区间宽度趋近于 0，得到精确面积
```

### 输出示例（JSON结构化数据）

```json
{
  "version": "1.2.0",
  "language": "zh-CN",
  "title": "定积分概念：土地测量员场景",
  "description": "通过土地测量员角色扮演渐进式学习定积分概念",
  "scenario": "你是一名土地测量员，需要测量不规则形状土地的面积",
  "learningObjectives": [
    "理解定积分作为面积累积的几何意义",
    "掌握矩形近似法的基本步骤",
    "认识分割数增加对近似精度的影响"
  ],
  "interactiveModules": [
    {
      "id": "dialogue_1",
      "type": "branching_dialogue",
      "role": "learning_assistant",
      "content": "你正在分析一块不规则形状的土地，其边界由函数 y = x² 描述。作为测量工程师，你需要计算 x=0 到 x=2 之间的面积。",
      "choices": [
        {
          "id": "choice_a",
          "text": "尝试直接使用长方形公式",
          "feedback": "长方形公式适用于规则矩形区域，但这里边界是曲线，需要更精细的方法。",
          "next": "dialogue_2_a"
        },
        {
          "id": "choice_b",
          "text": "将区域分割为多个小矩形进行估算",
          "feedback": "正确！这是工程中常用的近似方法，通过分割和求和来估算不规则面积。",
          "next": "dialogue_2_b"
        },
        {
          "id": "choice_c",
          "text": "请求查看函数图像和测量工具",
          "feedback": "好的，这是函数 y=x² 的图像，以及测量工具面板。",
          "next": "dialogue_2_c"
        }
      ]
    },
    {
      "id": "quiz_1",
      "type": "multiple_choice",
      "question": "当前近似值（左端点法）为 1.75。如果分割数增加到 8，近似值会：",
      "options": [
        { "id": "opt1", "text": "更接近真实面积", "correct": true },
        { "id": "opt2", "text": "更远离真实面积", "correct": false },
        { "id": "opt3", "text": "保持不变", "correct": false },
        { "id": "opt4", "text": "无法确定", "correct": false }
      ],
      "feedback": {
        "correct": "正确！分割数增加意味着矩形宽度减小，近似值会更接近真实曲线下面积。",
        "incorrect": "分割数增加会提高近似精度，因为每个矩形更贴合曲线。"
      }
    }
  ],
  "progressiveDisclosure": {
    "unlockSequence": ["dialogue_1", "quiz_1"],
    "prerequisites": {},
    "estimatedTime": 15
  },
  "metadata": {
    "sourceMaterial": "微积分讲义",
    "generatedAt": "2026-04-18T13:36:00Z",
    "aiConversationReady": true
  }
}
```

## 注意事项

- **内容准确性**：生成内容基于输入材料，建议人工审核关键概念
- **技术依赖**：需要安装相应技能（pdf、docx、pptx等）以处理不同格式
- **性能考量**：大型文档或复杂概念可能需要较长的处理时间
- **隐私保护**：所有处理在本地进行，不发送数据到外部服务器（除非使用图像生成）

## AI Conversation Integration

### Design Principles for AI Platforms

Generated JSON modules are designed for AI conversation use. Key principles:

1. **No CLI-style prompts**: Content should NOT contain phrases like "Press Enter to continue" or "Press any key to proceed". These are awkward in conversational AI interfaces.

2. **Natural transitions**: Use the `transitionHint` field (when present) to guide the AI on how to prompt the user, but prefer natural conversational prompts like "Ready to continue?" or "Would you like to practice what you learned?"

3. **Content purity**: The `content` field of modules contains only educational content. Transition guidance belongs in `transitionHint`, not embedded in content.

4. **Flag: `noCliPrompts`**: When `true`, indicates the module was designed without CLI-style prompts and is ready for conversational AI use.

### Module Structure for AI Use

Each module may include these AI-friendly fields:

```json
{
  "id": "teaching_1",
  "type": "teaching",
  "content": "Educational content only - no CLI prompts",
  "transitionHint": "Ready for a practice problem?",
  "noCliPrompts": true
}
```

### Recommended AI Conversation Flow

1. **Present content** naturally as part of the conversation
2. **Reference `transitionHint`** if present, in a conversational way
3. **Wait for user input** - user can respond, ask questions, or say "continue"
4. **Present choices** with IDs that user can type naturally
5. **Process response** and show feedback
6. **Repeat** until module complete

## 更新日志

- **v1.0**：初始版本，支持基础文档处理和互动内容生成
- **v1.1**：添加语言自适应功能（自动检测输入语言，英语材料全流程英语互动）和英语触发词
- **v1.2**：轻量化重构，专注AI对话互动，移除HTML/Twine输出，保留JSON结构化数据，简化依赖；**新增四个教学设计原则**：高频提问、解题机会、难度分级、智能调整，实现更个性化、互动性更强的学习体验
- **v1.3**：添加 `noCliPrompts` 标志和 `transitionHint` 字段，移除CLI风格提示，支持AI对话集成

---

*本技能遵循WorkBuddy技能开发规范，使用MIT许可证开源。*