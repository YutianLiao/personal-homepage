<template>
  <div class="tokenizer-explanation">
    <h4>原理</h4>
    <p>
      WordPiece 与 BPE 同属子词分词：对未登录词用词表中最长匹配子串递归切分。BERT 用 <code>##</code> 前缀标记非词首子词（如
      <code>playing → play + ##ing</code>）。
    </p>
    <h4>本 Demo 使用的词表</h4>
    <p>
      <strong>bert-base-uncased</strong>（30,522 tokens），从 HuggingFace 加载真实
      <code>vocab.txt</code>，推理逻辑与原始 BERT tokenizer 一致（简化版 basic 预处理：小写 + 标点独立）。
    </p>
    <h4>编码步骤</h4>
    <ol>
      <li>Basic 切分：空白分隔，标点独立，英文转小写。</li>
      <li>对每个词贪心最长匹配：从整词开始，找不到则缩短，非词首加 <code>##</code>。</li>
      <li>查表得 token ID；无法切分时输出 UNK。</li>
    </ol>
    <h4>复杂度</h4>
    <p>单词最长匹配 O(L²)，L 为词长；整句 O(n)。</p>
    <h4>优缺点</h4>
    <ul>
      <li><strong>优点</strong>：词表适中；与 BERT 生态完全对齐；英文效果好。</li>
      <li><strong>缺点</strong>：uncased 丢失大小写；中文需多语言词表；贪心切分非全局最优。</li>
    </ul>
    <h4>References</h4>
    <ul class="tokenizer-explanation__refs">
      <li><a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noopener noreferrer">Devlin et al. 2019 — BERT</a></li>
      <li><a href="https://huggingface.co/bert-base-uncased" target="_blank" rel="noopener noreferrer">HuggingFace — bert-base-uncased</a></li>
      <li><a href="https://github.com/google-research/bert/blob/master/tokenization.py" target="_blank" rel="noopener noreferrer">Google Research — BERT tokenization.py</a></li>
    </ul>
  </div>
</template>
