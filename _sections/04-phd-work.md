---
section_id: phd-work
order: 4
---
# Doctoral Research

My doctoral research at **IIT Gandhinagar** studied budget-aware decision making for NLP: how to use limited annotation effort, training tokens, and examples more effectively. The broader motivation is that better performance does not always come from simply collecting more data or training for longer; it also depends on deciding **where the available resources should be spent**.

[Read the doctoral thesis](https://drive.google.com/file/d/1SCxQTkXFlT_Cz6eqcd_HAHof0AGWNihF/view?usp=sharing).

1. **Annotation:** I studied the trade-off between collecting more labels for the same example and labeling a larger number of examples. Using a controlled multi-annotator simulation framework, I examined how annotation depth, disagreement, and instance difficulty affect model performance under a fixed annotation budget. The results show that collecting multiple labels is not always beneficial; its value depends on which examples receive additional annotations and how difficult or ambiguous those examples are. This work appeared in [EMNLP 2023](https://aclanthology.org/2023.findings-emnlp.96/).

2. **Training:** I studied how a fixed token budget should be distributed across different task types during instruction tuning. Instead of relying on uniform or dataset-size-based sampling, I developed [ADAPT](https://arxiv.org/abs/2512.04555), a validation-driven method that learns task proportions during training. ADAPT treats task allocation as a dynamic decision: it uses validation feedback to shift more of the available training budget toward tasks that are useful for downstream generalization.

3. **Selection:** I studied how to identify instruction-tuning examples that provide a meaningful instruction-following signal before fine-tuning. I developed [Task-Specificity Score (TSS)](https://arxiv.org/abs/2602.03103), which measures how strongly an output depends on the given instruction, conditioned on the input. Its extension, TSS++, combines instruction specificity with harder counterfactual instructions and data-quality signals. This allows models to train on smaller but more useful subsets of instruction data.

Together, these projects show that annotation, training, and data selection should be treated as allocation problems rather than simple scaling problems. My thesis develops methods for making these decisions more systematically under realistic resource constraints.

## Honorable Mention: Understanding the Model-Hub Ecosystem

Alongside my thesis, I also worked on understanding how machine-learning models are shared, documented, and adopted in public model repositories. In [Model Hubs and Beyond](https://ojs.aaai.org/index.php/ICWSM/article/view/35855), we studied model popularity, performance, and documentation practices on Hugging Face. The work examined around **500 sentiment-analysis models** and more than **80,000 human annotations**, showing that model popularity is not determined by performance alone and that documentation quality, visibility, and platform-level factors shape which models receive attention and reuse. This project broadened my research from efficient model training to the wider infrastructure and social processes through which models are communicated and adopted.
