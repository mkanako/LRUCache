type KEY_TYPE = string | number
type NODE_POINTER_TYPE<T> = Node<T> | DummyNode<T>
type LIST_ITEM_TYPE<T> = [Node<T>, Node<number>] | Node<T>

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

class ListContainer<T> {
  private dataList: DoublyLinkedList<T>
  private timestampList!: DoublyLinkedList<number>

  constructor (private expiry: number) {
    this.dataList = new DoublyLinkedList()
    if (this.expiry > 0) {
      this.timestampList = new DoublyLinkedList()
    }
  }

  size () {
    return this.dataList.size()
  }

  create (key: KEY_TYPE, value: T): LIST_ITEM_TYPE<T> {
    const dataNode = new Node(key, value)
    if (this.expiry > 0) {
      const timestampNode = new Node(key, time())
      return [dataNode, timestampNode]
    }
    return dataNode
  }

  getVal (data: LIST_ITEM_TYPE<T>) {
    if (data instanceof Node) {
      this.dataList.remove(data)
      this.dataList.add(data)
      return data.value
    } else {
      if (data[1].value + this.expiry >= time()) {
        this.dataList.remove(data[0])
        this.dataList.add(data[0])
        return data[0].value
      } else {
        this.dataList.remove(data[0])
        this.timestampList.remove(data[1])
      }
    }
    return undefined
  }

  remove (item: LIST_ITEM_TYPE<T>) {
    if (item instanceof Node) {
      this.dataList.remove(item)
    } else {
      this.dataList.remove(item[0])
      this.timestampList.remove(item[1])
    }
  }

  add (item: LIST_ITEM_TYPE<T>) {
    if (item instanceof Node) {
      this.dataList.add(item)
    } else {
      this.dataList.add(item[0])
      this.timestampList.add(item[1])
    }
  }

  getClearKey () {
    if (this.expiry > 0) {
      const tLast = this.timestampList.getLast()
      if (tLast && time() > tLast.value + this.expiry) {
        return tLast.key
      }
    }
    const dLast = this.dataList.getLast()
    if (dLast) {
      return dLast.key
    }
  }
}

export default class LRUCache<T = unknown> {
  private map: Map<KEY_TYPE, LIST_ITEM_TYPE<T>>
  private list: ListContainer<T>
  private capacity: number
  private expiry: number

  constructor (capacity = 20, expiry = 0) {
    this.capacity = capacity
    this.expiry = expiry * 1000
    this.map = new Map()
    this.list = new ListContainer(this.expiry)
  }

  get (key: KEY_TYPE): T | undefined {
    const item = this.map.get(key)
    if (item) {
      const val = this.list.getVal(item)
      if (val === undefined) {
        this.map.delete(key)
      } else {
        return val
      }
    }
    return undefined
  }

  set (key: KEY_TYPE, value: T): void {
    if (value === undefined) return
    const item = this.list.create(key, value)
    const oldItem = this.map.get(key)
    if (oldItem) {
      this.list.remove(oldItem)
    } else {
      if (this.list.size() >= this.capacity) {
        const clearKey = this.list.getClearKey()
        if (clearKey) {
          const clearItem = this.map.get(clearKey)
          if (clearItem) {
            this.list.remove(clearItem)
            this.map.delete(clearKey)
          }
        }
      }
    }
    this.list.add(item)
    this.map.set(key, item)
  }
}
