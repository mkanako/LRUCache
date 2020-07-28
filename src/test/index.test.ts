import { assert } from 'chai'
import LRUCache from '../'

const { equal, isUndefined } = assert

const timer = (fn: () => void, timeout: number, done: Mocha.Done) => {
  setTimeout(() => {
    try {
      fn()
      done()
    } catch (error) {
      done(error)
    }
  }, timeout * 1000)
}

describe('basic test without expiration time', () => {
  it('basic', () => {
    const cache = new LRUCache()
    cache.set('a', 'a')
    equal(cache.get('a'), 'a')
    isUndefined(cache.get('b'))
  })

  it('least recently set', () => {
    const cache = new LRUCache(2)
    cache.set('a', 'a')
    cache.set('b', 'b')
    cache.set('c', 'c')
    equal(cache.get('c'), 'c')
    equal(cache.get('b'), 'b')
    isUndefined(cache.get('a'))
  })

  it('recently gotten', () => {
    const cache = new LRUCache(2)
    cache.set('a', 'a')
    cache.set('b', 'b')
    cache.get('a')
    cache.set('c', 'c')
    equal(cache.get('c'), 'c')
    isUndefined(cache.get('b'))
    equal(cache.get('a'), 'a')
  })
})

describe('with expiration time', function () {
  const expiry = 1
  const cache = new LRUCache(2, expiry)
  cache.set('a', 'a')
  cache.set('b', 'b')

  it('not expired', function (done) {
    timer(() => {
      equal(cache.get('a'), 'a')
      equal(cache.get('b'), 'b')
    }, expiry / 2, done)
  })

  it('has expired', function (done) {
    timer(() => {
      isUndefined(cache.get('a'))
      isUndefined(cache.get('b'))
    }, expiry, done)
  })

  it('drop expired item first', function (done) {
    const cache = new LRUCache(3, expiry)
    cache.set('a', 'a')
    setTimeout(() => {
      cache.set('b', 'b')
    }, 200)
    setTimeout(() => {
      cache.set('c', 'c')
    }, 400)
    setTimeout(() => {
      cache.get('a')
    }, 600)
    timer(() => {
      cache.set('d', 'd')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      isUndefined(cache.map.get('a'))
      equal(cache.get('b'), 'b')
    }, expiry, done)
  })

  it('all not expired will fallback to basic LRU', function (done) {
    const cache = new LRUCache(3, expiry)
    cache.set('a', 'a')
    cache.set('b', 'b')
    cache.set('c', 'c')
    cache.get('a')
    timer(() => {
      cache.set('d', 'd')
      isUndefined(cache.get('b'))
      equal(cache.get('a'), 'a')
      cache.set('e', 'e')
      isUndefined(cache.get('c'))
    }, expiry / 2, done)
  })
})
