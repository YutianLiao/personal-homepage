<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      空格分词是最直觉的词级切分方法：遇到空格、制表符、换行符就把文本断开。它不依赖任何词表，也不做词根还原等形态分析，因此实现成本极低。时间复杂度 O(n)，空间复杂度 O(n)，只需从左到右扫描一遍文本：连续的非空白字符合并成一个 token，而空格和换行符则各自保留为独立的 token，这样就能完整保留原文的缩进与换行结构。
    </p>
    <p>
      优点很突出：直观、可解释，而且因为没有「词表」这个概念，所以不存在未登录词（OOV）问题——任何没见过的字符组合都能直接当作一个新 token。缺点是它处理不了标点粘连（比如「hello!」会被当成一个整体 token，而不是「hello」和「!」），对于中文这类没有天然空格的语言几乎完全失效，并且词表规模会随着见过的不同「词」不断膨胀，最终无法控制。
    </p>
    <p>
      尽管简单，空格分词依然是理解分词器演进的重要起点，也是许多早期系统和教学中的标准实现。
    </p>
    <h4>参考</h4>
    <ul class="tokenizer-explanation__refs">
      <li>
        <a href="https://web.stanford.edu/~jurafsky/slp3/" target="_blank" rel="noopener noreferrer">
          Jurafsky &amp; Martin — Speech and Language Processing (Tokenization)
        </a>
      </li>
      <li>
        <a href="https://en.wikipedia.org/wiki/Lexical_analysis#Tokenization" target="_blank" rel="noopener noreferrer">
          Wikipedia — Lexical Analysis: Tokenization
        </a>
      </li>
    </ul>
  </div>
</template>
