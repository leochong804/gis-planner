# 01 — Gap Analysis：Footbridge Design → Building Structural

> 目的：搵出邊啲嘢可以直接用、邊啲要由零開始，將有限嘅 330 小時集中喺缺口。
> 評分：🟢 已掌握（只需轉 building context）｜🟡 部分掌握（要補 code 條文 / 應用）｜🔴 主要缺口（要系統學習 + 練習）

---

## 1. 可轉移嘅技能

| 範疇 | Footbridge 經驗 | 轉去 building 要調整乜 | 評分 |
|---|---|---|---|
| **RC design 基本功** | Pier、pile cap、abutment、deck 嘅 ULS/SLS design、crack control | Building element 數量多、重複性高 → 要識用 rules of thumb 快速 sizing；要熟 CoP SUC 2013 嘅 slab / flat slab / wall 條文（bridge 多數用 Structures Design Manual for Highways and Railways 同 BS/EN 系） | 🟡 |
| **Steel design** | Steel box / truss deck、connections、fatigue | Building 用 CoP Steel 2011（唔係 bridge code）；重點轉去 composite floor、portal frame、bracing、simple vs moment connections、notional horizontal forces | 🟡 |
| **Loading** | Highway / pedestrian live load、wind on bridge、temperature、load combination | 要學 **CoP Dead & Imposed Loads 2011**（usage category、partition load、imposed load reduction）同 **Wind Code 2019 嘅 building 部分**（tall building dynamic、acceleration） | 🟡 |
| **Dynamic / vibration** | Footbridge pedestrian-induced vibration、natural frequency check | 可以直接轉去 **floor vibration**（steel / long-span floor）同 **tall building wind acceleration / occupant comfort** — 呢個係你嘅優勢 | 🟢 |
| **Foundation** | Bored pile、socketed H-pile、pile cap、ground investigation 解讀 | Building 要處理 **大量 column load 嘅 pile layout**、core 下嘅 pile group、raft、uplift / buoyancy、basement；要熟 CoP Foundations 2017 (2024 Ed.) | 🟡 |
| **Analysis** | Frame / grillage / FE model | Building 考試**唔可以靠電腦 model**，要識 hand method：lateral load 分配、cantilever core、portal method、approximate frame analysis | 🟡 |
| **Temporary works / staging** | Bridge erection、traffic diversion、possession 下施工 | 概念可轉移，但 building 有自己一套：formwork cycle、jump form、propping、top-down basement | 🟡 |
| **Design report / client communication** | HyD submission、design memorandum | 直接幫到 Section A 嘅 scheme comparison 同 recommendation 寫法 | 🟢 |
| **Professional / interview 能力** | 已過 ICE CPR，申請 MHKIE (Civil) 中 | Interview 四個 pillars 嘅答法同 ICE / HKIE Civil 類似，但 examples 要有 **structural（最好 building）** 內容 | 🟢 |

---

## 2. 主要缺口

| # | 缺口 | 點解重要（考試角度） | 評分 | 處理 Phase |
|---|---|---|---|---|
| G1 | **Structural scheme 構思（Section A 技能）** | Section A 要兩個 *distinct and viable* 嘅 scheme；footbridge 嘅 form 選擇少，building 嘅 option 多好多（RC / steel / composite / PT / precast） | 🔴 | 2、3 |
| G2 | **Lateral stability system** | Moment frame、shear wall、core、braced frame、frame-wall interaction、outrigger；lateral load 點分配（centre of rigidity、torsion）；drift / overturning | 🔴 | 2 |
| G3 | **Transfer structure** | 香港 podium + tower 必有 transfer plate / girder；APP-5 有尺寸限制；construction stage loading | 🔴 | 2 |
| G4 | **Core wall / shear wall design** | Wall design、coupling beam、openings、lift / staircase core 佈置 | 🔴 | 2 |
| G5 | **Floor systems 比較** | RC beam-slab、flat slab、PT、composite steel；span/depth、services zone、storey height budget | 🟡 | 1、2 |
| G6 | **Basement & ELS** | Basement retaining wall、water pressure、uplift / tension pile、diaphragm wall、top-down vs bottom-up | 🔴 | 2 |
| G7 | **Tall building wind** | Wind Code 2019：across-wind、torsion、acceleration limits、幾時要 wind tunnel test | 🟡（有 bridge wind 基礎） | 2 |
| G8 | **Seismic** | 香港暫時**冇** in-force 嘅 seismic code（見 02 文件），考試重點應該唔喺度；但要識講概念（ductility detailing、regularity） | 🟡 | 2（低比重） |
| G9 | **Robustness / disproportionate collapse** | Concrete & steel code 嘅 tie 要求、key element；transfer member 屬於 "failure would induce cumulative instability"（ADV-33 checklist） | 🟡 | 2 |
| G10 | **Fire resistance** | FRR、concrete cover、steel fire protection（Fire Safety Code 2011 (2024 Ed.)） | 🟡 | 2 |
| G11 | **Building services coordination** | Beam / slab openings、plant room loads、ceiling void、transfer plate 入面嘅 BS zone（APP-5）| 🔴 | 2 |
| G12 | **Construction sequence（building）** | Section A 通常要講 construction method / sequence；column shortening、propping、tower crane tie-in | 🔴 | 2 |
| G13 | **Building 規管流程** | BO Cap 123、Building (Construction) Regulation、AP / RSE / RGE / RC 角色、BD submission、ADV-33 checklist | 🟡 | 1、2 |
| G14 | **Precast / MiC / DfMA** | 近年政策重點；Precast Code 2016 + amendments、ADV-36 MiC stability | 🟡 | 2 |
| G15 | **Framing plan 繪圖速度** | Section B 冇 properly dimensioned framing plans 會 FAIL；bridge 工程師少畫 building framing plan | 🔴 | 3 |
| G16 | **Hand calc 速度 + approximate sizing** | 6.5 小時入面要做兩個 scheme + 一個 scheme 嘅 calcs + drawings → 要有 rules of thumb 記喺腦 | 🔴 | 1、3 |

---

## 3. 自我評估表（W1 填、W16 / W38 再填）

用 1–5 分（1 = 完全唔識，5 = 可以喺考試限時內做到）。

| 範疇 | W1 | W16 | W38 | W52 |
|---|---|---|---|---|
| Loading（DIL + Wind 2019 building） | | | | |
| RC slab / beam / flat slab | | | | |
| RC column / wall / core | | | | |
| Steel building（composite、frame、connection） | | | | |
| Foundation（pile、raft、basement） | | | | |
| Lateral stability 分析（hand method） | | | | |
| Transfer structure | | | | |
| Scheme 構思（Section A） | | | | |
| Framing plans + details（Section B） | | | | |
| Construction sequence / method statement | | | | |
| Code lookup 速度（MCQ） | | | | |

---

## 4. 結論：時間點分配

大約 **60% 時間放喺 🔴 缺口**（G1–G4、G6、G11、G12、G15、G16），30% 補 🟡 code 應用，10% 留俾考試技巧同複習。你嘅 footbridge 背景令 element design 唔使由零開始，所以 Phase 1 可以壓縮到 16 週，騰出時間做 building scheme 練習。
