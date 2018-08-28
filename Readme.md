# Castelet

### Easy, async Puppeteer Pool

#### It's as simple as it gets

It's just a wrapping of [lightning-pool](https://github.com/panates/lightning-pool) around [puppeteer](https://github.com/GoogleChrome/puppeteer), with a few additions.

To keep with the design of [puppeteer-pool](https://github.com/latesh/puppeteer-pool), it adds a `use` method, that can be used just like theirs:

This is the easiest method of use.
```js
import { createPool } from 'castelet'

const pool = createPool({
  min: 1,
  max: 10,
})

pool.use(async browser => {
  const page = await browser.newPage()
  const status = await page.goto('http://google.com')
  if (!status.ok) {
    throw new Error('cannot open google.com')
  }
  const content = await page.content()
  page.close()
  return content
})
```


It's all async, and usage is just like any other `generic-pool`-like system:

```js
import { createPool } from 'castelet'

const pool = createPool({
  min: 1,
  max: 10,
})

pool.acquire(browser => {
  const page = await browser.newPage()
  const status = await page.goto('http://google.com')
  if (!status.ok) {
    throw new Error('cannot open google.com')
  }
  const content = await page.content()
  page.close()
  pool.release(browser) // the important bit!
  return content
})
```

**Note:** be sure to `pool.release(browser)` when you're done. Otherwise the browser will not be released back to the pool (and cleared of its pages). It's much easier to use the above syntax.