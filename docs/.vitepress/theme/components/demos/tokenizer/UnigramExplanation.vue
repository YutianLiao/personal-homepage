<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      Unigram 语言模型分词（Unigram LM）与 BPE 的「自下而上合并」相反，采用<strong>自上而下剪枝</strong>：从大规模语料中提取海量候选子词，赋予每个子词一个出现概率，再迭代删除对似然损失贡献最小的符号，直到词表缩小到目标大小。T5、LLaMA 等模型通过 SentencePiece 采用这一路线。
    </p>
    <p>
      推理时，Unigram 不在训练阶段贪心合并，而是把切分看作<strong>概率最大化路径搜索</strong>：在所有合法切分方式中，选取使各 token 对数概率之和最大的那条（本 Demo 用 Viterbi 动态规划实现）。因此同一输入在不同词表下可能得到不同但「概率最优」的切分。
    </p>

    <h4>本 Demo 的词表</h4>
    <p>
      使用教学用精简词表（常见英文词/子词 + 示例汉字），并非完整 SentencePiece 训练产物。每个 token 附带对数概率 <em>log p</em>；多字符片段概率高于单字回退，以体现子词偏好。
    </p>

    <h4>编码步骤</h4>
    <ol class="tokenizer-explanation__steps">
      <li>在位置 <em>i</em> 尝试所有词表中匹配的子串 <code>text[i:j]</code>（长度 1…L<sub>max</sub>）。</li>
      <li>动态规划：令 <code>dp[j]</code> 为覆盖前 <em>j</em> 个字符的最大对数似然，从 <code>dp[0]=0</code> 向前递推。</li>
      <li>回溯得到 token 序列；未命中多字符片段时回退为单字符 token。</li>
    </ol>

    <h4>复杂度</h4>
    <p class="tokenizer-explanation__complexity">
      Viterbi 解码 O(n · L<sub>max</sub>)，<em>n</em> 为字符数，L<sub>max</sub> 为最长子词长度；词表大小 |V| 影响常数因子。
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
      <li>
        <a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener noreferrer">
          Sennrich et al. 2016 — BPE（对比子词路线）
        </a>
      </li>
    </ul>
  </div>
</template>
