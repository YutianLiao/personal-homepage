<template>
  <div class="tokenizer-explanation">
    <h4>原理</h4>
    <p>
      空格分词是最朴素的词级切分：遇到空格、制表符、换行就把文本断开。它不依赖词表，也不做形态学分析，因此实现成本极低。
    </p>
    <h4>步骤</h4>
    <ol>
      <li>从左到右扫描文本。</li>
      <li>连续非空白字符合并为一个 token。</li>
      <li>连续空白字符各自保留，便于观察缩进与换行。</li>
    </ol>
    <h4>复杂度</h4>
    <p>时间 O(n)，空间 O(n)。</p>
    <h4>优缺点</h4>
    <ul>
      <li><strong>优点</strong>：直观、可解释、无 OOV（未登录词）问题。</li>
      <li><strong>缺点</strong>：无法处理标点粘连；中文等无空格语言几乎无效；词表规模随语料膨胀。</li>
    </ul>
  </div>
</template>
