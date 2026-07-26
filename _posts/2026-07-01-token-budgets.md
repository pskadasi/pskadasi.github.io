---
title: Thinking clearly about token budgets
description: Thinking clearly about token budgets — Pritam Kadasi
date: 2026-07-01
eyebrow: Technical note
read_time: 8 min read
abstract: A token budget is more than a training limit. It is a decision about which tasks and examples a model gets to see.
math: true
bibliography: /assets/references.bib
---
## Budget as a constraint

Suppose task $i$ contributes $n_i$ examples, each with average length $\ell_i$. A simple training-budget constraint is

<div class="equation">
\[
  B = \sum_{i=1}^{m} n_i \ell_i.
\]
</div>

Under a fixed $B$, adding examples from one task removes capacity from another. The allocation therefore becomes part of the learning problem, not merely a preprocessing choice.

## Why allocation matters

Attention-based models can learn from diverse sequences, but their training signal still depends on what enters the context and how often it appears <cite data-key="vaswani2017attention"></cite>. Scaling results also show that the balance between data and model size matters, rather than parameter count alone <cite data-key="hoffmann2022training"></cite>.

This is why the unit of comparison should be the actual number of training tokens after prompt formatting—not only the number of retained examples <cite data-key="hoffmann2022training"></cite>.

## Practical checklist

1. Count tokens after applying the actual prompt template.
2. Report both examples and tokens retained.
3. Compare learned allocation against simple static mixtures.
4. Evaluate out of distribution, not only on training tasks.
