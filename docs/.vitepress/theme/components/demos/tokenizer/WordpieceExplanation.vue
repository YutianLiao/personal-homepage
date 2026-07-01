<template>
  <div class="tokenizer-explanation">
    <p class="tokenizer-explanation__lead">
      WordPiece 与 BPE 同属子词分词方案，但它的切分逻辑更像「翻词典」而不是事先合并。面对一个可能不在词表中的词，它会用贪心策略从词表里找到最长的匹配片段，然后把未匹配的尾巴继续切分，直到整个词被覆盖。为了区分一个片段是独立成词还是接在别的词后面，BERT 用 <code>##</code> 前缀标记非词首的子词，比如「playing」会被切成「play」和「##ing」。
    </p>
    <p>
      本 Demo 使用真实的 <strong>bert-base-uncased</strong> 词表（30,522 个 token），直接从 HuggingFace 加载。预处理阶段很简单：先按空白和标点把文本切开，全部转为小写，标点也独立成 token。随后对每个词执行贪心最长匹配——从整个词开始查词表，若找不到就缩短末尾字符，直到匹配成功；找到后，把剩余部分当作新词继续切分，所有非词首片段自动加上 <code>##</code>。最后查表得到整数 token ID，完全无法匹配的部分则输出 <code>&lt;redacted_UNK&gt;</code>。
    </p>

    <h4>复杂度</h4>
    <p class="tokenizer-explanation__complexity">
      单个长度 <em>L</em> 的词在最坏情况下需要反复缩短查找，约为 O(L<sup>2</sup>)，整句则保持 O(n)。
    </p>

    <div class="tokenizer-explanation__pros-cons">
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>优点</h4>
        <p>
          词表大小适中，与整个 BERT 生态无缝对齐，英文处理效果出色。
        </p>
      </div>
      <div class="tokenizer-explanation__pros-cons-col">
        <h4>缺点</h4>
        <p>
          uncased 版本会丢失大小写信息，原生词表主要面向英文，处理中文等语言时常需多语言扩展；另外贪心最长匹配只是局部最优，不保证切分结果的全局一致性。
        </p>
      </div>
    </div>

    <h4>参考</h4>
    <ul class="tokenizer-explanation__refs">
      <li>
        <a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noopener noreferrer">
          Devlin et al. 2019 — BERT
        </a>
      </li>
      <li>
        <a href="https://huggingface.co/bert-base-uncased" target="_blank" rel="noopener noreferrer">
          HuggingFace — bert-base-uncased
        </a>
      </li>
      <li>
        <a href="https://github.com/google-research/bert/blob/master/tokenization.py" target="_blank" rel="noopener noreferrer">
          Google Research — BERT tokenization.py
        </a>
      </li>
    </ul>
  </div>
</template>
