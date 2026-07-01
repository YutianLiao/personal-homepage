<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      Unigram LM 与 BPE 的自下而上合并相反，采用自上而下剪枝：从海量候选子词出发，为每个符号估计出现概率，迭代删除对似然损失贡献最小的条目，直到词表达到目标大小。T5、LLaMA 等通过 SentencePiece 采用此路线。
    </p>

    <h4>步骤</h4>
    <ol class="tokenizer-explanation__steps">
      <li>训练阶段用 EM 迭代估计子词概率，并剪枝收缩词表。</li>
      <li>编码时在位置 <em>i</em> 枚举词表中匹配的子串 <code>text[i:j]</code>。</li>
      <li>用 Viterbi 动态规划选取对数概率之和最大的切分路径。</li>
    </ol>

    <h4>复杂度</h4>
    <p class="tokenizer-explanation__complexity">
      Viterbi 解码 O(n · L<sub>max</sub>)，<em>n</em> 为字符数，L<sub>max</sub> 为最长子词长度。
    </p>

    <div class="tokenizer-explanation__pros-cons">
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>优点</h4>
        <p>
          概率框架统一训练与推理；自然支持多种切分的软选择；与 SentencePiece 生态兼容，多语言表现稳健。
        </p>
      </div>
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>缺点</h4>
        <p>
          训练需 EM 迭代，成本高于 BPE；推理需 DP 搜索；词表与概率估计依赖语料质量。
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
