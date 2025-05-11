export class TreeNode<T> {
  public left: TreeNode<T> | null = null;
  public right: TreeNode<T> | null = null;
  constructor(public value: T) {}
}

export class BinarySearchTree<T> {
  public root: TreeNode<T> | null = null;
  constructor(private compare: (a: T, b: T) => number) {}

  insert(value: T): void {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let current = this.root;
    while (true) {
      const cmp = this.compare(value, current.value);
      if (cmp < 0) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }

  inOrderTraversal(callback: (value: T) => void): void {
    const traverse = (node: TreeNode<T> | null) => {
      if (!node) return;
      traverse(node.left);
      callback(node.value);
      traverse(node.right);
    };
    traverse(this.root);
  }

  search(predicate: (value: T) => boolean): T[] {
    const result: T[] = [];
    this.inOrderTraversal((value: T) => {
      if (predicate(value)) result.push(value);
    });
    return result;
  }
}