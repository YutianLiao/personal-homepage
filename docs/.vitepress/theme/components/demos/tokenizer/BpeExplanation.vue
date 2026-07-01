<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      BPE（Byte Pair Encoding）是 GPT-3.5、GPT-4 与 GPT-4o 等模型实际使用的分词算法，OpenAI 用 tiktoken 库高效实现。它的核心思想很朴素：从最基础的字节序列出发，反复统计语料里最常相邻出现的一对符号，把它们合并成一个新符号。这样不断迭代，直到词表扩充到预设的大小（比如 100k 或 200k）。推理时，只需按当初学到的合并顺序「贪心」地组合输入——遇到能合并的就合并，直到不能合并为止——最终得到一串整数 token ID。
    </p>
    <p>
      与现代 BPE 的一个关键不同是，GPT 系列采用的是 <strong>byte-level BPE</strong>，也就是直接在 UTF-8 字节上操作，而不是在 Unicode 字符上。这意味着每个 token 的底层单位是字节。对英文来说，一个常见单词可能就是整词 token；但对中文、emoji 等多字节字符，单个字符在 UTF-8 中占 2~4 个字节，极有可能被切成若干字节片段，这时 token 就可能不是一个完整的汉字，看起来像十六进制字节的碎片。不过，当词表足够大（如 o200k_base），许多高频汉字和词语已经作为整体被存进词表，字节碎片的情况大幅减少，中文常用语往往能整词映射为一个 token。
    </p>

    <h4>实现的词表</h4>
    <ul>
      <li><strong>cl100k_base</strong>：约 100k 次合并，用于 GPT-3.5 / GPT-4。</li>
      <li><strong>o200k_base</strong>：约 200k 次合并，用于 GPT-4o 系列，进一步提升了多语言 token 效率。</li>
    </ul>
    <p>这些词表已随 <code>js-tiktoken</code> 库直接可用，与生产环境完全一致。</p>

    <h4>编码步骤简述</h4>
    <ol class="tokenizer-explanation__steps">
      <li>将输入文本转换成 UTF-8 字节流（byte-level 的基础表示）。</li>
      <li>按预先训练好的合并优先级（merge ranks），反复把最频繁相邻字节对替换成对应的合并符号，直到无法再合并。</li>
      <li>将最终得到的每个符号查找词表，映射为整数 ID，交给 Transformer 的 Embedding 层。</li>
    </ol>

    <h4>复杂度</h4>
    <p class="tokenizer-explanation__complexity">
      编码过程为 O(n)，因为 tiktoken 使用 Rust 实现，按顺序贪心扫描即可，非常高效。词表大小一旦训练完成就固定不变，与输入语料无关。
    </p>

    <div class="tokenizer-explanation__pros-cons">
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>优点</h4>
        <p>
          词表大小可控，既避免了词级分词的无限膨胀，又解决了字符级序列过长的问题。子词泛化能力强，对未登录词能用已知片段拼接。与整个 GPT 生态无缝兼容。
        </p>
      </div>
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>缺点</h4>
        <p>
          同一个汉字在不同上下文中可能被切分成不同的字节序列（虽然概率不高），不如词级分词那么直观；对于生僻字或新造词，仍可能拆成多字节 token，在可视化时显示为十六进制片段，对人类不够友好。
        </p>
      </div>
    </div>

    <h4>参考</h4>
    <ul class="tokenizer-explanation__refs">
      <li>
        <a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener noreferrer">
          Sennrich et al. 2016 — Neural Machine Translation of Rare Words with Subword Units
        </a>
      </li>
      <li>
        <a href="https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" target="_blank" rel="noopener noreferrer">
          Radford et al. 2019 — GPT-2 Technical Report
        </a>
      </li>
      <li>
        <a href="https://github.com/openai/tiktoken" target="_blank" rel="noopener noreferrer">OpenAI tiktoken</a>
      </li>
      <li>
        <a href="https://platform.openai.com/tokenizer" target="_blank" rel="noopener noreferrer">
          OpenAI Tokenizer Playground
        </a>
      </li>
    </ul>
  </div>
</template>
