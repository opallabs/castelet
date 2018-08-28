import test from 'ava'
import { createPool } from '.'

test('creates a pool', async t => {
  const pool = await createPool()
  t.is(pool.size, 0)
  pool.close()
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
  t.plan(2)
  const pool = await createPool({ min: 1 })
  const browser = await pool.acquire()
  t.not(browser, undefined)
  pool.acquire().then(() => {
    t.pass()
  })
  await pool.release(browser)
  pool.close()
})

test('can use a browser', async t => {
  t.plan(3)
  const pool = await createPool({ min: 1 })
  let theBrowser
  await pool.use(browser => {
    theBrowser = browser
    t.not(browser, undefined)
    t.is(pool.isAcquired(browser), true)
  })
  t.is(pool.isAcquired(theBrowser), false)
  pool.close()
})

test('handles errors in use usage', async t => {
  t.plan(2)
  const pool = await createPool({ min: 1 })
  try {
    await pool.use(() => {
      throw new Error('Noooooo!')
    })
  } catch (e) {
    t.pass()
    t.is(pool.acquired, 0)
  }
  pool.close()
})

test('terminates', async t => {
  t.plan(1)
  const pool = await createPool({ min: 1 })
  pool.terminate(t.pass)
})

test('destroys browsers', async t => {
  t.plan(2)
  const pool = await createPool({ min: 1 })
  const browser = await pool.acquire()
  t.not(browser, undefined)
  pool.destroy(browser)
  const newBrowser = await pool.acquire()
  t.not(browser, newBrowser)
  pool.close()
})