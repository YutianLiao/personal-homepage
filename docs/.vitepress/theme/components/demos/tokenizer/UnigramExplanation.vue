<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      Unigram LM 将分词建模为概率最大化问题：假设文本由子词序列 x = (x₁, …, xₖ) 独立生成，每个子词 xᵢ 拥有全局概率 p(xᵢ)，且 ∑<sub>x∈V</sub> p(x) = 1。句子 X 被切分为某序列的概率为 P(X) = ∏ p(xᵢ)。训练目标是在词表规模约束下，最大化语料对数似然 ∑ log P(sentence)。T5、XLNet、LLaMA 等通过 SentencePiece 采用这一框架。
    </p>
    <p>
      与 BPE 的自下而上合并不同，Unigram 走自上而下剪枝：先从语料提取大规模种子词表（长度受限的字符 n-gram 等），用 EM 迭代估计各子词概率；再计算删除每个子词造成的似然损失 loss(x) ≈ c(x) · [log p(x) − log p(segment(x))]，批量剪掉损失最小的一批（SentencePiece 默认每次 20%），循环「EM → 损失评估 → 剪枝」直至词表降至目标值（如 32K）。
    </p>

    <h4>训练流程</h4>
    <ol class="tokenizer-explanation__steps">
      <li>初始化种子词表：收集高频子串并保留基础字符，保证任意文本可还原。</li>
      <li>E 步：按当前概率 p 统计各子词在语料中的期望出现次数（常用 Viterbi 近似取最优切分）。</li>
      <li>M 步：用期望频次重估 p(w) = c(w) / ∑ c(w′)，迭代至收敛。</li>
      <li>按删除损失排序批量剪枝，回到 EM，直至词表达标。</li>
    </ol>

    <h4>推理阶段</h4>
    <ol class="tokenizer-explanation__steps">
      <li>给定词表 V 与概率 p，设 dp[i] 为覆盖前 i 个字符的最大对数概率。</li>
      <li>枚举所有匹配子词 w（text[i:j] = w），更新 dp[j] = max(dp[j], dp[i] + log p(w))。</li>
      <li>回溯 dp 表得到概率最大的切分序列。</li>
    </ol>

    <h4>复杂度</h4>
    <p class="tokenizer-explanation__complexity">
      Viterbi 解码为 O(n · L<sub>max</sub>)，<em>n</em> 为字符数，L<sub>max</sub> 为最长子词长度；训练需多轮 EM 与剪枝，初始词表较大时内存开销显著。
    </p>

    <div class="tokenizer-explanation__pros-cons">
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>优点</h4>
        <p>
          概率框架统一训练与推理，词表质量可用损失值量化；天然支持多候选切分与子词正则化（按 P(segment|sentence) 动态抽样），对多语言与形态丰富语言覆盖稳健。
        </p>
      </div>
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>缺点</h4>
        <p>
          训练需多轮 EM 与语料扫描，成本高于 BPE；推理需动态规划且依赖完整概率表；词表质量高度依赖训练语料的代表性与规模。
        </p>
      </div>
    </div>

    <h4>参考</h4>
    <ul class="tokenizer-explanation__refs">
      <li>
        <a href="https://arxiv.org/abs/1808.06226" target="_blank" rel="noopener noreferrer">
          Kudo 2018 — Subword Regularization (Unigram LM)
        </a>
      </li>
      <li>
        <a href="https://github.com/google/sentencepiece" target="_blank" rel="noopener noreferrer">
          Google SentencePiece
        </a>
      </li>
    </ul>
  </div>
</template>
