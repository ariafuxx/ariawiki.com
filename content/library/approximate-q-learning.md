---
title: "Approximate Q-learning"
title_zh: "10分钟理解近似Q学习"
description: "Breaking down feature-based reinforcement learning with clear examples"
description_zh: "用清晰的例子拆解基于特征的强化学习"
collection: til
tags: [reinforcement learning, Q-learning, ML basics]
difficulty: beginner
status: completed
date: 2026-02-10
source: https://cs188.io
language: en
reading_time: 15
draft: false
related: []
---

## Core Insight

When the state space is too large for a Q-table, approximate Q-learning uses feature-based representations to generalize across similar states — essentially turning RL into a supervised learning problem over state-action features.

## My Analysis

This clicked for me when I realized the connection to linear regression:

- **Q(s,a) = w · f(s,a)** — the Q-value is just a weighted sum of features, exactly like linear regression
- **Weight update** — instead of updating a table entry, you update weights using the TD error
- **Feature design** — this is where the real art is. Good features capture the structure of the problem (e.g., "distance to nearest ghost" in Pac-Man)

The trade-off: you lose the ability to represent arbitrary Q-functions (since you're limited to a linear combination of features), but you gain massive generalization. A feature like "number of food pellets remaining" lets you generalize across millions of states you've never seen.

Key takeaway: the hardest part of approximate Q-learning isn't the algorithm — it's choosing the right features.
