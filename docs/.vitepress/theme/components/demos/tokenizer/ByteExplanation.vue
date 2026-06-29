<template>
  <div class="tokenizer-explanation">
    <h4>原理</h4>
    <p>
      字节级分词先把文本用 UTF-8 编码，再按字节切分。GPT-2 在此基础上做 byte-level BPE，从而用有限词表覆盖任意 Unicode 文本，避免 UNK。
    </p>
    <h4>步骤</h4>
    <ol>
      <li><code>TextEncoder</code> 将字符串转为 UTF-8 字节数组。</li>
      <li>每个字节值 0–255 作为一个 token，展示为十六进制。</li>
      <li>多字节字符（如中文）会拆成 3–4 个连续 byte token。</li>
    </ol>
    <h4>复杂度</h4>
    <p>时间 O(n)，空间 O(n)；UTF-8 最多约 4× 字符数。</p>
    <h4>优缺点</h4>
    <ul>
      <li><strong>优点</strong>：词表固定 256；无 UNK；与 BPE 组合后成为现代 LLM 标配。</li>
      <li><strong>缺点</strong>：单字符被拆成多 token，序列变长；裸字节流对人类不直观。</li>
    </ul>
    <h4>References</h4>
    <ul class="tokenizer-explanation__refs">
      <li><a href="https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" target="_blank" rel="noopener noreferrer">Radford et al. 2019 — GPT-2 (byte-level BPE)</a></li>
      <li><a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener noreferrer">Sennrich et al. 2016 — BPE</a></li>
    </ul>
  </div>
</template>
