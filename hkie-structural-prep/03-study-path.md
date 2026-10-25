# 03 — 分階段溫書路線

> 總時數：約 330 小時（56 週 × 平均 6 小時）｜考試：2027 年 11 月（推算）
> 週次對應 `04-weekly-schedule.md`；code 版本見 `02-codes-and-references.md`

```
Phase 1 基礎（building 化）     W1–W16   2026-10-26 → 2027-02-14   ~90 h
Phase 2 Building design         W17–W38  2027-02-15 → 2027-07-18   ~132 h
Phase 3 考試技巧 / mock exam    W39–W56  2027-07-19 → 考試週       ~108 h
```

---

## Phase 1 — 基礎：將 footbridge 功力轉做 building element design（W1–W16）

### 目標
1. 確認報考資格同考試格式（W1）。
2. 熟 building 用嘅 loading（DIL 2011、Wind 2019）。
3. 用 HK code 快速設計 building elements：slab、beam、flat slab、column、wall、steel / composite beam、portal frame、connections、pile cap、raft。
4. 建立 **rules of thumb 筆記**（span/depth、sizing、常用 load），之後 Section A 用。

### 要讀嘅 code 部分
| Code | 部分（以目錄核對 clause 號） |
|---|---|
| DIL 2011 (2021 Ed.) | Dead loads、imposed loads by usage、partition loads、imposed load reduction |
| Wind 2019 | Design wind pressure / force、topography、static vs dynamic 判斷、pressure / force coefficients |
| Concrete 2013 (2020 Ed.) | Basis of design、materials、durability & fire、analysis、beams、slabs（包括 flat slab & punching）、columns、walls、serviceability（span/depth、crack）、detailing（包括 ductility requirements） |
| Steel 2011 (2023 Ed.) | Classification、beams & LTB、compression members、frame stability（notional horizontal forces、second-order）、connections、composite beams & slabs、vibration |
| Foundations 2017 (2024 Ed.) | Pile types & capacities、pile groups、negative skin friction、shallow / raft foundations、uplift |
| BO Cap 123 / B(C)R | 整體框架、AP / RSE / RGE / RC 角色 |

### 參考書
HA *Manual for Design and Detailing of RC (CoP 2013)*、HKIE-ST *Concrete Code Explanatory Handbook*、Cobb *Pocket Book*、Arya *Design of Structural Elements*、SCI *Steel Designers' Manual*、Tomlinson *Pile Design*。

### 練習
- 每個 element 做 **1 條完整 hand calc**（用 A4 calc sheet 格式，左邊 reference 欄寫 code clause）。
- 每週做 **15 分鐘「速算」**：俾自己一個 span + load，限時寫 member size（之後 Phase 3 用嚟做 Section A）。
- 讀 2 份 past paper 嘅 brief（唔做，只係睇題目類型同 client requirements 點寫）。
- 開始 shadow 公司 building 組（見 `04-weekly-schedule.md` 第 3 節）。

### 完成準則（W16 checkpoint）
- [ ] 已經收到 HKIE 對資格 / footbridge 經驗嘅答覆（或者已經記錄要點）
- [ ] 2 小時內完成：一塊 flat slab panel（含 punching）+ 一條 RC column + 一條 composite beam 嘅設計
- [ ] Rules of thumb 筆記 ≥ 2 頁，包括 RC / steel / PT / composite 嘅 span/depth
- [ ] Wind 2019：可以喺 45 分鐘內計到一座 30 層 building 嘅 along-wind 總 base shear 同 overturning moment
- [ ] 自我評估表（`01-gap-analysis.md`）Phase 1 範疇平均 ≥ 3 分
- 未達標 → 用 W17–W18 補，並考慮每週加 2 小時

---

## Phase 2 — Building design：補主要缺口（W17–W38）

### 目標
1. 掌握 **lateral stability**：系統選擇、hand analysis、drift、overturning、torsion。
2. 掌握 **transfer structure、core wall、basement / ELS、foundation scheme**。
3. 識講 **construction sequence、building services coordination、fire、robustness、precast / MiC**。
4. 完成一個**自擬完整 building scheme**（W34–W36）。
5. 第一次接觸 past paper Section A（W38）。

### 要讀嘅 code / 文件部分
| 主題 | Code / 文件 |
|---|---|
| Lateral stability、robustness | Concrete 2013：analysis、robustness / ties；Steel 2011：frame stability、robustness；IStructE *Stability of Buildings* |
| Tall building wind | Wind 2019：dynamic response、across-wind、torsion、acceleration limits；（Steel 2026 amendments 有 building acceleration limits，留意生效狀態） |
| Transfer structure | Concrete 2013：deep beams、punching、strut-and-tie 概念；**APP-5**；**ADV-33** checklist |
| Core / shear wall | Concrete 2013：walls、coupling beams、ductility detailing |
| Basement / ELS | Foundations 2017：basement、uplift、retaining；Geoguide 1；BD 相關 APP（W27 自己去 PNAP index 搵） |
| Fire | Fire Safety Code 2011 (2024 Ed.) — structural fire resistance 部分；Concrete code cover tables |
| Precast / MiC | Precast Code 2016 + amendments；ADV-36 |
| 規管 | B(C)R Parts 2–7；ADV-33 |

### 參考書
IStructE *Stability of Buildings*、Smith & Coull *Tall Building Structures*、Taranath *Tall Buildings*、SCI *Steel Designers' Manual*（portal / long span）、Tomlinson（pile groups）。

### 練習
- 每個主題做 **1 條 hand calc + 1 張 sketch**（plan / section）。
- **Lateral load 分配練習**：一個 core + 4 片 wall 嘅 plan，用 hand method 計各 wall 分到幾多 load（包括 torsion）。
- **Transfer girder**：設計一條承托 2 支 tower column 嘅 transfer girder（deep beam），包括 construction stage。
- **自擬 scheme 項目（W34–W36）**：自寫一份 brief（例：25 層 office + 3 層 podium + 2 層 basement、斜坡地盤），做齊 2 個 scheme → 揀一個 → calcs → framing plans → method statement，**搵 building 組同事 review**。
- 每月最少一次 **building site visit**（見 04 文件第 3 節）。

### 完成準則（W38 checkpoint）
- [ ] 可以用 10 分鐘 sketch 出 3 種唔同 lateral stability system 嘅 plan，並講出優缺點
- [ ] 完成 transfer girder、core wall、basement wall、pile cap 各 1 條 calc
- [ ] 自擬 scheme 項目完成，並收到至少一位 building 組同事嘅 comments
- [ ] Past paper Section A（3 小時、untimed 可以）：兩個 scheme 可以俾同事 / mentor 判斷係 "distinct and viable"
- [ ] 自我評估表 Phase 2 範疇平均 ≥ 3 分
- 未達標 → 將 W39–W41 改做補底，mock 數目由 4 個減至 3 個

---

## Phase 3 — 考試技巧及 mock exam（W39–W56）

### 目標
1. 建立 6.5 小時 design paper 嘅**時間分配**同答題模板。
2. 完成 **4 份 full mock（7.5 小時，限時）** + 多份 Section A / B 分開練。
3. MCQ（1 小時）：建立 code index，提升查 code 速度。
4. **約 2027 年 8 月尾前交報名表**（以 HKIE 公告為準）。
5. 考試前準備齊 open-book 資料（tabbed codes、formula sheet、rules of thumb）。

### 建議時間分配（6.5 小時 design paper，自己 mock 時再調）
| 時段 | 工作 |
|---|---|
| 0:00–0:30 | 讀 brief、列 client requirements / constraints / loading、揀題 |
| 0:30–2:30 | **Section A**：兩個 distinct scheme（sketch plan + section、lateral system、foundation、load path、簡單 sizing）、比較、建議 |
| 2:30–5:45 | **Section B**：所選 scheme 嘅 critical element calcs（transfer、core、long span、foundation） |
| 5:45–6:30 | **Dimensioned framing plans**、key details、method statement / construction sequence |
> 注意：examiner 明言冇 dimensioned framing plans 會 FAIL — 寧願 calc 少一條，都要留時間畫 plan。

### 要讀嘅 code 部分
全部 Phase 1–2 code；重點係**查找速度**：自製 index（每本 code 一頁：常用表 / 公式喺邊頁）。

### 參考書
HKIE past papers（2009–2024）、HKIE examiner reports（2020–21、2022–23、2023–24）、IStructE CM exam guidance（參考答題結構）。

### 練習
| 類型 | 數量 |
|---|---|
| Full mock（1h MCQ + 6.5h design，限時） | 4 份（W42、W46、W49、W52） |
| Section A 單獨（2–3 小時） | 4–5 份 |
| Section B framing plans 速度練習 | 2–3 次 |
| MCQ 自擬題 / code lookup drill | 每週 15–30 分鐘 |
| Mock 批改 | 每份 mock 都搵 HKIE Structural member（公司 building 組）睇，或者用 examiner report 嘅 FAIL 準則自己批 |

### 完成準則（考試前）
- [ ] 4 份 full mock 全部喺時限內交到齊 Section A + B（包括 dimensioned framing plans）
- [ ] 最後 2 份 mock，自評 / mentor 評 Section A 同 B 都 ≥ 50%（留 10% buffer 喺 40% 門檻以上）
- [ ] MCQ drill 喺 1 小時內完成而且準確率 ≥ 70%（自擬題）
- [ ] 報名已交，收到 candidature 通知
- [ ] Open-book 資料包齊備

---

## Phase 4（考試後）— Interview 準備（2027-12 → 2028 Q1/Q2）

- 按 competence-based 四個 pillars 整理 examples：最好有 **至少 1–2 個 building 例子**（W17 起嘅 shadow 工作就係為咗呢樣）。
- 按 HKIE 指示交 assessment documentation（舊屆限期係 3 月 31 日，以當屆為準）。
- 做 2 次 mock interview（公司 HKIE Structural member 做 interviewer）。
