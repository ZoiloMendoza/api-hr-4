class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfPath = false;
    this.varName = null; 
    this.obj = null;
  }
}

class PathTrie {
  constructor() {
    this.root = new TrieNode();
  }

  // Add a path to the trie
  addPath(path, obj) {
    const segments = path.split("/").filter(Boolean);
    let currentNode = this.root;

    segments.forEach((segment) => {
      if (segment.startsWith(":")) {
        const varName = segment.slice(1); // extract variable name
        if (!currentNode.children[":var"]) {
          currentNode.children[":var"] = new TrieNode();
          currentNode.children[":var"].varName = varName;
        }
        currentNode = currentNode.children[":var"];
      } else {
        if (!currentNode.children[segment]) {
          currentNode.children[segment] = new TrieNode();
        }
        currentNode = currentNode.children[segment];
      }
    });

    currentNode.isEndOfPath = true;
    currentNode.obj = obj;
  }
  // Match a path and extract variables
  matchPath(path) {
    const segments = path.split("/").filter(Boolean);
    const variables = {};
    let currentNode = this.root;
    let currentPath = "";

    for (const segment of segments) {      
      if (currentNode.children[segment]) {
        currentPath += "/"  + segment ;
        currentNode = currentNode.children[segment]; // Exact match
      } else if (currentNode.children[":var"]) {
        // If there's a variable match, store the variable value
        const varNode = currentNode.children[":var"];
        currentPath += "/:" + varNode.varName;
        variables[varNode.varName] = segment;
        currentNode = varNode;
      } else {
        // If no match, return null
        return null;
      }
    }

    if (currentNode.isEndOfPath) {
      return {path: currentPath, variables, obj: currentNode.obj}; // Successfully matched, return the collected variables
    }

    return null; // No match
  }
}

const trie = new PathTrie();

module.exports = trie;