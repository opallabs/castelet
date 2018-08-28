import test from 'ava'
import { createPool } from './index.js'

test('creates a pool', async t => {
  const pool = await createPool()
  t.is(pool.size, 0)
})

test('acquires a browser', async t => {
  t.plan(1)
  const pool = await createPool({ min: 1 })
  await pool.acquire().then(() => {
    t.pass()
  })
  pool.close()
})

test('cannot acquire another', async t => {
  const pool = await createPool({ min: 1 })
  const browser = await pool.acquire()
  t.not(browser, undefined)
  let flag = false
  pool.acquire().then(() => {
    flag = true
  })
  t.is(flag, false)
  pool.close()
})

test('can release a browser ', async t => {
  t.plan(3)
  const pool = await createPool({ min: 1 })
  const browser = await pool.acquire()
  t.not(browser, undefined)
  let flag = false
  pool.acquire().then(() => {
    flag = true
  })
  t.is(flag, false)
  await pool.release(browser)
  t.pass()
  pool.close()
})

test('acquires after release', async t => {
  t.plan(3)
  const pool = await createPool({ min: 1 })
  const browser = await pool.acquire()
  t.not(browser, undefined)
  let flag = false
  pool.acquire().then(() => {
    t.pass()
  })
  t.is(flag, false)
  await pool.release(browser)
  pool.close()
})