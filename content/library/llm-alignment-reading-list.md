---
title: "10 papers for LLM alignment"
title_zh: "理解 LLM 对齐的 10 篇论文"
description: "A curated reading path from RLHF basics to constitutional AI"
description_zh: "从 RLHF 基础到 Constitutional AI 的精选阅读路径"
collection: curated-lists
tags: [alignment, RLHF, reading list]
difficulty: intermediate
status: revisit
date: 2026-01-20
source: https://arxiv.org
language: en
reading_time: 10
draft: false
related: [constitutional-ai]
---

## Core Insight

Understanding LLM alignment requires reading papers in the right order — from the foundational RLHF work to modern techniques like Constitutional AI and DPO. This list provides a structured reading path.

## My Analysis

The reading order that worked for me:

1. **InstructGPT** (Ouyang et al., 2022) — The paper that started it all. RLHF applied to GPT-3.
2. **RLHF original** (Christiano et al., 2017) — The theoretical foundation for learning from human preferences.
3. **Constitutional AI** (Bai et al., 2022) — Anthropic's approach to scaling alignment without scaling human labeling.
4. **DPO** (Rafailov et al., 2023) — Direct Preference Optimization eliminates the reward model entirely.
5. **RLAIF** (Lee et al., 2023) — Using AI feedback instead of human feedback.

The remaining 5 papers are more specialized and can be read in any order based on interest.

Key observation: the field is moving toward reducing human involvement in the alignment loop. From RLHF (humans rank outputs) → CAI (AI critiques using principles) → DPO (direct optimization from preferences) → RLAIF (AI generates the preferences).
