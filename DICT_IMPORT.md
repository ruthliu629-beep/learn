# Dictionary Import Guide

扩充词汇量到 3000+（实际可达 10 万+）的方式。所有词典均为开源免费，你下载后用 `import_dict.py` 一键导入。

## 已支持

| 语言 | 词典 | 体量 | 下载 | 协议 |
|---|---|---|---|---|
| 普通话 | CC-CEDICT | ~120,000 | https://www.mdbg.net/chinese/dictionary?page=cc-cedict | CC BY-SA |
| 粤语 | CC-Canto | ~25,000 | https://cantonese.org/download.html | CC BY-SA |
| 日语 | JMdict | ~200,000 | http://www.edrdg.org/jmdict/edict_doc.html | EDRDG |

## 使用方法

### 1. CC-CEDICT（普通话，推荐先用这个）

1. 打开 https://www.mdbg.net/chinese/dictionary?page=cc-cedict
2. 下载 "CC-CEDICT in U8 format"（zip 包，约 4MB）
3. 解压得到 `cedict_ts.u8` 文件（UTF-8 文本）
4. 运行导入：
   ```powershell
   cd "E:\Claude space\learn chinese\backend"
   python import_dict.py cedict path\to\cedict_ts.u8
   ```
5. 数据库里会多出约 12 万条 Mandarin 条目，自动带拼音

### 2. CC-Canto（粤语）

1. 打开 https://cantonese.org/download.html
2. 下载 `cccanto-webdist.tar.gz`（约 2MB）
3. 解压得到 `cccanto-webdist.txt`
4. 运行：
   ```powershell
   python import_dict.py ccanto path\to\cccanto-webdist.txt
   ```

### 3. JMdict（日语）

1. 打开 http://www.edrdg.org/jmdict/edict_doc.html
2. 下载 `JMdict_e.gz`（英文词典子集，约 30MB 解压后）
3. 解压得到 `JMdict_e`（XML）
4. 运行（建议先限制数量避免一次加载过多）：
   ```powershell
   python import_dict.py jmdict path\to\JMdict_e --limit 30000
   ```

## 去重与替换

导入脚本会先删除同一词典来源的旧条目再重导，所以**反复运行安全**，不会产生重复。

自己手工整理的精品词条（`source="curated"`）不会受影响。

## 对其他语言的扩充方式

### 韩语、法语、西语、德语、英语

目前没有自带导入器，但可以用以下开源数据：

- **Wiktionary 数据集**: https://kaikki.org/dictionary/ — 提供所有语言的 JSONL 抽取
- **Tatoeba 例句集**: https://tatoeba.org/downloads — 超过 800 万双语例句，按 ISO 639-3 筛选语言
- **Anki 共享牌组**: https://ankiweb.net/shared/decks — 很多社区制作的高频词表

要导入这些，可以参考 `import_dict.py` 写类似的解析器——每个函数只需：
1. 读入词典文件
2. yield 出 `{"word", "romanization", "meaning_zh", "meaning_en", "category"}` 的字典
3. 调用 `insert_records(lang_code, iterator, source_name)`

## 查询效果

导入后，应用的所有功能（词汇列表、搜索、测验、闪卡、发音、听说读写测试）都会自动包含新词条。测试题目和闪卡会从全部词汇池中随机抽取。

## 版权

导入的外部词典受各自协议约束（CC BY-SA 或 EDRDG）。如果你公开部署这个应用：
- CC-CEDICT / CC-Canto：需在应用中标注来源
- JMdict：需遵守 EDRDG 许可条款，详见 http://www.edrdg.org/edrdg/licence.html
