<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      字符级分词直接把文本拆成一个个 Unicode 字符，每个字符就是一个独立的 token。这种策略曾在早期 char-RNN 模型和部分中文、日文、韩文（CJK）模型中使用，核心思路是用最小的词表换取对任意文本的编码能力。
    </p>

    <h4>原理</h4>
    <p>
      把每个 Unicode 码点（包括字母、汉字、标点、emoji 等）都当作一个 token。因为不依赖任何预设词汇，所以词表可以做到极小——通常只需要几千个条目，就能表示世界上几乎所有文字。
    </p>

    <h4>实现步骤</h4>
    <ol class="tokenizer-explanation__steps">
      <li>用 <code>Array.from(text)</code> 按 Unicode 码点展开文本，这能正确处理 emoji 等需要代理对（surrogate pair）的字符。</li>
      <li>将每个字符映射为一个独立 token，空格和标点也都会获得自己的编号，可以单独标记颜色或权重。</li>
    </ol>

    <h4>复杂度</h4>
    <p class="tokenizer-explanation__complexity">
      时间 O(n)，空间 O(n)，其中 <em>n</em> 是文本的字符数量。实现非常直接，只需一次线性扫描。
    </p>

    <div class="tokenizer-explanation__pros-cons">
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>优点</h4>
        <p>
          词表极小（通常 &lt; 5000），任何生僻字、颜文字、乱码都能被直接编码，没有未登录词（OOV）的烦恼；对形态变化丰富的语言（如阿拉伯语、土耳其语）也很友好。
        </p>
      </div>
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>缺点</h4>
        <p>
          把序列拉得非常长，原本一个单词「hello」就会被拆成 5 个 token，导致模型需要处理的步数大增，计算效率低，而且很难直接从单字符层面捕捉到完整的词语含义。
        </p>
      </div>
    </div>

    <p>
      尽管单独使用字符分词器的场景已不多见，但它依然是构成更先进子词算法（如 BPE）的「基础粒子」，也是理解分词粒度的重要参照点。
    </p>

    <h4>参考</h4>
    <ul class="tokenizer-explanation__refs">
      <li>
        <a href="https://karpathy.github.io/2015/05/21/rnn-effectiveness/" target="_blank" rel="noopener noreferrer">
          Karpathy — The Unreasonable Effectiveness of Recurrent Neural Networks
        </a>
      </li>
      <li>
        <a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener noreferrer">
          Sennrich et al. 2016 — Subword Units (对比字符级基线)
        </a>
      </li>
    </ul>
  </div>
</template>
