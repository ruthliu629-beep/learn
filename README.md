# LangLearn · 多语言学习平台

一个支持 **9 种语言**（含中文方言）的全栈语言学习网页应用：普通话、粤语、闽南语、英语、日语、韩语、法语、西班牙语、德语。

## ✨ 功能

- 📚 **词汇学习** — 分类浏览 + 搜索，支持导入开源词典（72 万+ 词条）
- 🎴 **闪卡** — SRS 间隔复习算法，翻转显示译义和例句
- 📝 **选择题测验** — 每轮 25 题，自动评分与进度保存
- 👂 **听说读写能力测试** — 四种模式检验听力、口语（Speech Recognition）、阅读、写作
- 🔊 **真人语音**
  - 普通话、英、日、韩、法、西、德：浏览器 TTS 或 Google 代理
  - **粤语**: [words.hk](https://words.hk) 社区真人录音，按 Jyutping 逐音节拼接
  - **闽南语**: 台湾教育部 [Sutian](https://sutian.moe.edu.tw) 官方真人音档
- 📖 **发音指南** — 每种语言的音系体系、口型、常见错误详解
- 💝 **恋爱词汇** — 9 种语言的地道告白、称呼、约会用语
- 🌏 **母语选择** — 首次访问选 中文 / English，全站翻译切换
- 👤 **用户系统** — JWT 认证，学习进度保存到服务器

## 🛠 技术栈

**后端**：Python 3.10+ · FastAPI · SQLAlchemy · SQLite · JWT
**前端**：原生 HTML / CSS / JavaScript（零构建，零框架）

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 初始化数据库（基础 586 条精品词）

```bash
python seed_data.py
python add_romance.py   # 加入恋爱版块
```

### 3. 启动服务器

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

打开 http://127.0.0.1:8000/ 即可使用。

### 4. （可选）导入开源词典扩充至 72 万+ 词条

参见 [DICT_IMPORT.md](DICT_IMPORT.md)。各语言均支持对应的开源词典：

| 语言 | 词典 | 规模 |
|---|---|---|
| 普通话 | CC-CEDICT | ~120K |
| 粤语 | CC-Canto | ~25K |
| 闽南语 | MOE 台湾教育部词典 | ~14K |
| 英语 | ECDICT (SQLite) | ~58K |
| 日语 | JMdict | ~80K |
| 韩语 | KENGDIC | ~118K |
| 法/西/德 | Wiktionary (kaikki.org) | 各 ~100K |

## 📁 项目结构

```
.
├── backend/
│   ├── main.py                  # FastAPI 入口
│   ├── models.py                # SQLAlchemy ORM
│   ├── schemas.py               # Pydantic 模型
│   ├── auth.py                  # JWT 工具
│   ├── database.py              # 数据库连接
│   ├── seed_data.py             # 初始化精品词汇
│   ├── add_romance.py           # 恋爱版块数据
│   ├── import_dict.py           # 开源词典导入器
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth_router.py       # 登录/注册
│   │   ├── languages.py
│   │   ├── vocabulary.py        # 分页 + 随机抽样
│   │   ├── quiz.py
│   │   ├── progress.py
│   │   ├── cultural.py
│   │   └── tts.py               # 真人音档代理 (MOE / words.hk / Google)
│   └── vocab_data/              # 每语言精品词汇
│       ├── zh_cmn.py  zh_yue.py  zh_nan.py
│       ├── en.py  ja.py  ko.py
│       └── fr.py  es.py  de.py
└── frontend/
    ├── index.html               # 登录页 + 母语选择
    ├── app.html                 # 学习主界面（标签页 SPA）
    ├── css/style.css
    └── js/
        ├── api.js               # API 客户端 + TTS 路由
        ├── auth.js
        ├── vocabulary.js
        ├── flashcard.js
        ├── quiz.js
        ├── skills.js            # 听说读写
        ├── pronunciation.js
        ├── cultural.js
        ├── progress.js
        └── app.js
```

## 🔐 用户数据

- 首次启动会自动创建 `backend/langlearn.db`（SQLite）
- 账号信息（bcrypt 哈希）、学习进度、测验记录全部本地存储
- 默认 JWT 密钥在 `auth.py` — **生产环境请改用环境变量**

## 📜 协议

本项目源码 MIT License。使用的开源词典各自遵守原协议：

- CC-CEDICT / CC-Canto: CC BY-SA 4.0
- JMdict: EDRDG
- ECDICT: MIT
- KENGDIC: CC BY-SA
- Wiktionary / kaikki.org: CC BY-SA
- MOE Sutian: 台湾教育部原创（非商业使用）
