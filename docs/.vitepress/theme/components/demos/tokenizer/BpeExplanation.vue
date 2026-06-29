<template>
  <div class="tokenizer-explanation">
    <h4>原理</h4>
    <p>
      Byte Pair Encoding (BPE) 从字符/字节序列出发，反复合并语料中最频繁的相邻符号对，直到词表达到目标大小。推理时按合并优先级贪心切分。
    </p>
    <h4>本 Demo 使用的词表</h4>
    <ul>
      <li><strong>cl100k_base</strong>：GPT-3.5 / GPT-4 系列（约 100k merges）。</li>
      <li><strong>o200k_base</strong>：GPT-4o 系列（约 200k merges）。</li>
    </ul>
    <p>通过 <code>js-tiktoken</code> 加载与生产环境一致的真实编码表。中文等多字节字符常被拆成若干 UTF-8 字节片段——单个 token 可能不是完整字符，可视化中以十六进制显示。</p>
    <h4>编码步骤</h4>
    <ol>
      <li>文本先映射到 UTF-8 字节（byte-level BPE 基础）。</li>
      <li>按预训练 merge 规则迭代合并最频繁 byte pair。</li>
      <li>输出整数 token ID 序列，供 Transformer embedding 查表。</li>
    </ol>
    <h4>复杂度</h4>
    <p>编码 O(n)（tiktoken 为 Rust 实现的高效贪心）；词表大小固定，与语料无关。</p>
    <h4>优缺点</h4>
    <ul>
      <li><strong>优点</strong>：词表可控；子词泛化好；与 GPT 系列完全兼容。</li>
      <li><strong>缺点</strong>：同一字符在不同上下文可能被不同切分；对人类不完全直观。</li>
    </ul>
    <h4>References</h4>
    <ul class="tokenizer-explanation__refs">
      <li><a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener noreferrer">Sennrich et al. 2016 — Neural Machine Translation of Rare Words with Subword Units</a></li>
      <li><a href="https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" target="_blank" rel="noopener noreferrer">Radford et al. 2019 — GPT-2 Technical Report</a></li>
      <li><a href="https://github.com/openai/tiktoken" target="_blank" rel="noopener noreferrer">OpenAI tiktoken</a></li>
      <li><a href="https://platform.openai.com/tokenizer" target="_blank" rel="noopener noreferrer">OpenAI Tokenizer Playground</a></li>
    </ul>
  </div>
</template>
