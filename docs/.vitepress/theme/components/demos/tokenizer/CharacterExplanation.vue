<template>
  <div class="tokenizer-explanation">
    <h4>原理</h4>
    <p>
      字符级分词把每个 Unicode 标量值当作一个 token。早期 char-RNN、部分 CJK 模型会采用这一策略，以换取极小词表与任意字符串可编码性。
    </p>
    <h4>步骤</h4>
    <ol>
      <li>使用 <code>Array.from(text)</code> 按 Unicode 码点展开（正确处理 surrogate pair）。</li>
      <li>每个字符映射为独立 token，空白与标点单独着色。</li>
    </ol>
    <h4>复杂度</h4>
    <p>时间 O(n)，空间 O(n)。</p>
    <h4>优缺点</h4>
    <ul>
      <li><strong>优点</strong>：词表极小（通常 &lt; 5k）；任意字符串可表示；适合形态丰富语言。</li>
      <li><strong>缺点</strong>：序列极长，建模效率低；难以直接捕获词级语义。</li>
    </ul>
  </div>
</template>
