class TrieNode {
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }
  
  class Trie {
    constructor() {
      this.root = new TrieNode();
    }
  
    insert(word) {
      let node = this.root;
      for (let char of word.toLowerCase()) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
    }
  
    searchPrefix(prefix) {
      let node = this.root;
      for (let char of prefix.toLowerCase()) {
        if (!node.children[char]) {
          return [];
        }
        node = node.children[char];
      }
      return this.collectWords(node, prefix);
    }
  
    collectWords(node, prefix) {
      let words = [];
      if (node.isEndOfWord) {
        words.push(prefix);
      }
      for (let char in node.children) {
        words = words.concat(this.collectWords(node.children[char], prefix + char));
      }
      return words;
    }
  }
  
  module.exports = Trie;
  