const { createPool: createLightningPool } = require('lightning-pool')
const { launch } = require('puppeteer')
const debug = require('debug')('castelet')

const browsers = new Set()

let launcher = launch

if (process.env.NODE_ENV === 'test') {
  debug('using test launcher (mock)')
  launcher = () => ({
    launched: true,
    close: async () => true,
    pages: async () => [],
  })
}

const create = async opts => {
  debug('create')
  const browser = await launcher(opts)
  browsers.add(browser)
  debug(`browsers: ${browsers.size}`)
  return browser
}

const destroy = async browser => {
  debug('destroy')
  await browser.close()
  browsers.remove(browser)
  debug(`browsers: ${browsers.size}`)
}

const reset = async browser => {
  debug('reset')
  const pages = await browser.pages()
  const closers = await Promise.all(pages.map(page => page.close()))
  debug(closers)
  return true
}

const validate = async () => {
  debug('validate')
  return true
}

const factory = {
  create,
  destroy,
  reset,
  validate,
}

const defaults = {
  max: 1,
  min: 1,
  minIdle: 1,
  puppeteerArgs: [],
}
debug('defaults', defaults)

const use = async (fn, pool) => {
  debug('use')
  const browser = await pool.acquire()
  let ret
  try {
    ret = await fn(browser)
    debug('successful execution')
  } catch (e) {
    debug('error', e)
    await pool.release(browser)
    throw e
  }
  await pool.release(browser)
  debug('released')
  return ret
}

const terminate = (pool, fn) => {
  debug('terminate')
  pool.close(true)
  if (fn) {
    fn()
  }
}

export const createPool = async opts => {
  debug('create pool')
  const options = { ...defaults, ...opts }
  debug(options)
  const pool = createLightningPool(factory, options)
  Object.defineProperty(pool, 'use', { value: fn => use(fn, pool) })
  Object.defineProperty(pool, 'terminate', { value: fn => terminate(pool, fn) })
  process.on('SIGINT', pool.terminate)
  return pool
}

export default createPool