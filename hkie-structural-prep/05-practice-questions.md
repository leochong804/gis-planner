# 05 — 練習題方向（按 topic 分類，全部自擬）

> 呢份**唔係 past paper 原文**，係按考試格式（MCQ + Section A schemes + Section B calcs / drawings）同 gap analysis 自擬嘅練習方向。
> Past papers 請直接喺 HKIE / HKIE Structural Division 網站下載（見 README sources）。
> 每題標示：**[A]** = Section A scheme 類｜**[B]** = Section B calc / drawing 類｜**[M]** = MCQ / code lookup 類｜**[I]** = interview 討論類
> **Code lookup 題**刻意唔俾答案：自己喺 code 搵出條文並喺題目旁邊寫低 clause 號，呢個過程本身就係 MCQ 訓練。

---

## T1 Loading（DIL 2011、Wind 2019）

1. **[M]** 喺 DIL Code 搵出：office、carpark（私家車）、plant room、roof（有 / 冇 access）嘅 imposed load；記低 clause / table 號。
2. **[M]** 一座 25 層 office，imposed load reduction 點樣計？邊類 load 唔可以 reduce？
3. **[B]** 一座 120 m 高、平面 30 m × 40 m 嘅 building，市區平地：按 Wind 2019 判斷係咪需要考慮 dynamic effects，計兩個方向嘅 base shear 同 overturning moment。
4. **[M]** Wind 2019 入面，幾時要計 across-wind 同 torsional loads？搵出判斷條件。
5. **[I]** 解釋 Wind 2019 比 2004 版主要改咗乜，對 tall building design 有乜影響。

## T2 RC elements（Concrete 2013）

6. **[B]** 8 m × 8 m grid flat slab，office loading：定 slab 厚度（span/depth）、計 internal column 嘅 punching shear，如果唔夠，比較 drop panel、column head、shear reinforcement 三個方案。
7. **[B]** 一支 podium column（unbraced、clear height 6 m），計 slenderness 同 additional moment。
8. **[M]** 搵出 beam 同 column 嘅 ductility detailing 要求（例如 confinement、lap 位置限制），記低 clause。
9. **[M]** 不同 exposure condition 同 FRR 下嘅 nominal cover 喺邊個 table？
10. **[B]** 一條 2 m 深、6 m 跨嘅 deep beam：用 code 方法 / strut-and-tie 概念設計主筋。

## T3 Steel & composite（Steel 2011）

11. **[B]** 12 m 跨 composite secondary beam（metal deck + 130 mm slab），計 construction stage 同 composite stage，包括 shear connectors 同 deflection。
12. **[B]** 30 m 跨 single-bay portal frame workshop（有 10 t overhead crane）：初步 sizing rafter / column、haunch、bracing 系統。
13. **[M]** 搵出 notional horizontal force 嘅要求同 sway-sensitive 判斷方法。
14. **[B]** 對比 footbridge：一塊 12 m × 9 m steel composite floor 嘅 vibration check — 你會用乜 criteria？同 footbridge 有乜分別？
15. **[M]** Steel code 2026 amendments 加咗 building acceleration limits — 去 BD 網站確認有冇生效，同 Wind 2019 嘅 acceleration 要求點樣配合。

## T4 Foundation（Foundations 2017）

16. **[B]** Core wall 底：wind overturning moment + gravity，設計 large-diameter bored pile group（包括 tension pile check）。
17. **[B]** 2 層 basement 喺高水位地盤：check uplift，比較加重 raft、tension pile、rock anchor 三個方案。
18. **[M]** Negative skin friction 幾時要考慮？喺 code 搵出條文。
19. **[A]** 地盤上層係 15 m 填土 + marine deposit，下面 completely decomposed granite，rock head 約 40 m：為一座 30 層住宅建議兩個 foundation 方案並比較。

## T5 Lateral stability（G2）

20. **[B]** 平面 36 m × 24 m，中間一個 12 m × 8 m core + 兩邊各一片 6 m wall：計 centre of rigidity、wind 下各 element 分配到嘅 shear（包括 torsion）。
21. **[A]** 同一座 40 層 office，sketch 三個 lateral system：(a) central core only、(b) core + perimeter frame、(c) core + outrigger；比較 drift、floor plan 靈活性、施工。
22. **[B]** 用 cantilever 方法估計 core 嘅 top drift，check 是否符合 H/500（或者你喺 code 搵到嘅適用 limit）。
23. **[I]** 點解香港住宅多用 shear wall 系統，office 多用 core + frame？

## T6 Transfer structures（G3）

24. **[A]** 30 層住宅 tower（wall 系統）坐喺 4 層商場 podium 上（podium 要 16 m × 16 m column grid）：建議 transfer plate 同 transfer girder 兩個 scheme，講 APP-5 厚度限制點樣影響方案。
25. **[B]** 設計一條 transfer girder 承托 2 支 tower column（每支 15,000 kN），包括 construction stage（分兩層澆注、下面幾層 propping 分擔）。
26. **[M]** 喺 ADV-33 checklist 搵出對 transfer members 同 lateral deflection 嘅要求。
27. **[I]** Transfer plate 澆注時有乜 risk？點樣 control thermal cracking？

## T7 Core wall / shear wall（G4）

28. **[B]** 設計一條 coupling beam（span 1.5 m、深 800 mm）承受 wind shear，比較 conventional 同 diagonal reinforcement。
29. **[A]** 一個 lift core 要容納 6 部 lift + 2 條 staircase：sketch core 佈置同 openings，講對 core stiffness 嘅影響。

## T8 Basement / ELS（G6）

30. **[A]** 市區地盤，三邊有舊樓、一邊近 MTR：為 3 層 basement 建議 top-down 同 bottom-up 兩個方案，講 ELS 系統同 monitoring。
31. **[B]** Basement retaining wall（propped by floors）：計 earth + water pressure，設計 wall 主筋。
32. **[I]** 點樣處理 basement 嘅 waterproofing 同 groundwater drawdown 對鄰近建築物嘅影響？

## T9 Floor systems / long span（G5）

33. **[A]** 一層 18 m 跨 column-free 嘅 office floor：比較 PT band beam、steel composite beam、cellular beam，考慮 services integration 同 storey height。
34. **[B]** 一個 40 m 跨 roof（展覽廳）：初步設計 steel truss，check deflection 同 lateral restraint。

## T10 Fire / robustness / precast / MiC（G9、G10、G14）

35. **[M]** 搵出 Fire Safety Code 對唔同 usage 嘅 FRR 要求喺邊度。
36. **[B]** 一座 10 層 steel building：check 移除一支 ground floor column 之後嘅 alternative load path / ties。
37. **[A]** 一座 15 層 hostel：比較 MiC 同 conventional RC 兩個方案，包括 stability（ADV-36）、connections、施工。

## T11 Construction & services（G11、G12）

38. **[A]** 寫一份 1 頁 method statement：30 層 core-led construction（jump form core + 後跟 floor slab）。
39. **[B]** 一條 primary beam 需要開 600 mm × 400 mm services opening：check 位置同補強。
40. **[I]** 一座 50 層 building 嘅 column 同 core 之間有 differential shortening，你點處理？

## T12 綜合 Section A 練習 brief（自擬，每份 2.5 小時）

| # | Brief 摘要 | 主要考點 |
|---|---|---|
| A1 | 28 層住宅 + 3 層 podium（商場 + carpark）+ 1 層 basement，斜坡地盤 | Transfer、slope、foundation |
| A2 | 8 層 data centre，heavy plant load（15 kPa），要求日後可以加 2 層 | Heavy loading、floor system、future provision |
| A3 | 5 層 school（有 24 m 跨 hall 喺頂層）| Long span、vibration、wind on roof |
| A4 | 20 層 hotel，地面要 column-free lobby 18 m × 24 m | Transfer、lateral system |
| A5 | 3 層 bus depot + 上面 12 層 office | Heavy vehicle load、transfer、fire |
| A6 | 改建：舊 10 層 RC 工廈加建 4 層 steel 樓層 | Existing structure assessment、foundation capacity |

**每份都要交**：client requirements list → 2 個 distinct schemes（plan + section sketch、lateral system、foundation、主要 sizing）→ 比較表 → 建議 → construction sequence 要點。

**自我批改準則**（參考 examiner 講法）：
- [ ] 兩個 scheme 真係 distinct（唔係淨係換 member size）
- [ ] 兩個都 viable（load path 完整、lateral stability 清楚）
- [ ] 符合所有 client requirements
- [ ] 有 lateral stability 同 foundation 嘅說明
- [ ] Section B：有 **properly dimensioned framing plans**

## T13 Interview 準備題（Phase 4）

41. **[I]** 用你一個 footbridge 項目做例子，講你點樣 "applying engineering knowledge"，再講如果同類問題喺 building 會點處理。
42. **[I]** 講一個你負責嘅 design 有 risk / 錯誤嘅情況，你點樣管理（managing engineering works）。
43. **[I]** 你點樣保持 professional acumen？（CPD、code 更新、學 building 嘅過程 — W34–W36 自擬項目都可以講）
44. **[I]** 作為 RSE（將來），你對 BD submission 同 site supervision 有乜責任？
