import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:\\Users\\shrea\\.gemini\\antigravity\\brain\\4cfca2c4-7887-4bdf-8bed-4f93c274fff3'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  console.log('🚀 Launching Chrome for E2E Test & Screenshots...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--use-gl=swiftshader']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const consoleLogs = []
  page.on('console', msg => {
    const text = msg.text()
    consoleLogs.push(`[CONSOLE ${msg.type()}]: ${text}`)
    if (msg.type() === 'error') {
      console.error('❌ Browser Error:', text)
    }
  })

  page.on('pageerror', err => {
    console.error('❌ Page Error:', err.message)
    consoleLogs.push(`[PAGE ERROR]: ${err.message}`)
  })

  try {
    console.log('🌐 Navigating to http://localhost:3000...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(2000)

    // Screenshot 1: Initial Page
    const shot1 = path.join(ARTIFACT_DIR, '01_initial_page.png')
    await page.screenshot({ path: shot1 })
    console.log('📸 Saved:', shot1)

    // Step 1: Click "1. Ambient 7U"
    console.log('👉 Clicking "1. Ambient 7U" button...')
    const ambientBtn = await page.waitForSelector('xpath///button[contains(text(), "1. Ambient 7U")]')
    if (ambientBtn) {
      await ambientBtn.click()
      await sleep(2500)
      const shot2 = path.join(ARTIFACT_DIR, '02_ambient_7u.png')
      await page.screenshot({ path: shot2 })
      console.log('📸 Saved:', shot2)
    }

    // Step 2: Click "2. Depth Collision"
    console.log('👉 Clicking "2. Depth Collision" button...')
    const collisionBtn = await page.waitForSelector('xpath///button[contains(text(), "2. Depth Collision")]')
    if (collisionBtn) {
      await collisionBtn.click()
      await sleep(2500)
      const shot3 = path.join(ARTIFACT_DIR, '03_depth_collision.png')
      await page.screenshot({ path: shot3 })
      console.log('📸 Saved:', shot3)
    }

    // Step 3: Click "3. Spec Conflict"
    console.log('👉 Clicking "3. Spec Conflict" button...')
    const conflictBtn = await page.waitForSelector('xpath///button[contains(text(), "3. Spec Conflict")]')
    if (conflictBtn) {
      await conflictBtn.click()
      await sleep(1500)
      const shot4 = path.join(ARTIFACT_DIR, '04_spec_conflict_modal.png')
      await page.screenshot({ path: shot4 })
      console.log('📸 Saved:', shot4)
    }

    // Step 4: In conflict modal, click "Adopt Claim B (90mA Errata)"
    console.log('👉 Clicking "Adopt Claim B (90mA Errata)" in modal...')
    const adoptBtn = await page.waitForSelector('xpath///button[contains(., "Adopt Claim B") or contains(., "90mA")]')
    if (adoptBtn) {
      await adoptBtn.click()
      await sleep(2000)
      const shot5 = path.join(ARTIFACT_DIR, '05_errata_resolved.png')
      await page.screenshot({ path: shot5 })
      console.log('📸 Saved:', shot5)
    }

    // Step 5: Click "5. Export BOM"
    console.log('👉 Clicking "5. Export BOM" button...')
    const exportBtn = await page.waitForSelector('xpath///button[contains(text(), "5. Export BOM")]')
    if (exportBtn) {
      await exportBtn.click()
      await sleep(1500)
      const shot6 = path.join(ARTIFACT_DIR, '06_export_bom_modal.png')
      await page.screenshot({ path: shot6 })
      console.log('📸 Saved:', shot6)
    }

    console.log('✅ All steps captured cleanly!')
  } catch (err) {
    console.error('❌ E2E Execution Error:', err)
  } finally {
    await browser.close()
    console.log('🏁 Browser closed.')
  }
}

run()
