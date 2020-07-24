type KEY_TYPE = string | number
type NODE_POINTER_TYPE<T> = Node<T> | DummyNode<T>

function time () {
  return (new Date()).getTime()
}

class Node<T> {
  next!: NODE_POINTER_TYPE<T>
  prev!: NODE_POINTER_TYPE<T>
  constructor (public key: KEY_TYPE, public value: T) { }
}

class DummyNode<T> {
  next!: NODE_POINTER_TYPE<T>
  prev!: NODE_POINTER_TYPE<T>
}

class DoublyLinkedList<T> {
  private head: DummyNode<T>
  private tail: DummyNode<T>
  private length = 0

  constructor () {
    this.head = new DummyNode()
    this.tail = new DummyNode()
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  size () {
    return this.length
  }

  add (node: Node<T>) {
    node.next = this.head.next
    node.prev = this.head
    this.head.next.prev = node
    this.head.next = node
    this.length++
  }

  remove (node: Node<T>) {
    const prev = node.prev
    const next = node.next
    node.prev.next = next
    next.prev = prev
    this.length--
  }

  pop () {
    const last = this.getLast()
    if (last) {
      this.remove(last)
    }
    return last
  }

  getLast () {
    return this.tail.prev instanceof Node ? this.tail.prev : null
  }
}

export default class LRUCache<T = string> {
  private map: Map<KEY_TYPE, [Node<T>, Node<number>]>
  private dataList: DoublyLinkedList<T>
  private timestampList: DoublyLinkedList<number>
  private capacity: number
  private expire: number

  constructor (capacity = 20, expire = 10 * 60) {
    this.map = new Map()
    this.dataList = new DoublyLinkedList()
    this.timestampList = new DoublyLinkedList()
    this.capacity = capacity
    this.expire = expire * 1000
  }

  get (key: KEY_TYPE): T | undefined {
    const result = this.map.get(key)
    if (result) {
      if (result[1].value + this.expire >= time()) {
        this.dataList.remove(result[0])
        this.dataList.add(result[0])
        return result[0].value
      } else {
        this.dataList.remove(result[0])
        this.timestampList.remove(result[1])
        this.map.delete(key)
      }
    }
    return undefined
  }

  set (key: KEY_TYPE, value: T): void {
    const dataNode = new Node(key, value)
    const timestampNode = new Node(key, time())
    const result = this.map.get(key)
    if (result) {
      this.dataList.remove(result[0])
      this.timestampList.remove(result[1])
    } else {
      if (this.dataList.size() >= this.capacity) {
        const tLast = this.timestampList.getLast()
        if (tLast && time() > tLast.value + this.expire) {
          const result = this.map.get(tLast.key)
          if (result) {
            this.timestampList.pop()
            this.dataList.remove(result[0])
            this.map.delete(tLast.key)
          }
        } else {
          const dLast = this.dataList.getLast()
          if (dLast) {
            const result = this.map.get(dLast.key)
            if (result) {
              this.dataList.pop()
              this.timestampList.remove(result[1])
              this.map.delete(dLast.key)
            }
          }
        }
      }
    }
    this.dataList.add(dataNode)
    this.timestampList.add(timestampNode)
    this.map.set(key, [dataNode, timestampNode])
  }
}
