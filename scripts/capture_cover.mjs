import puppeteer from 'puppeteer-core'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const ARTIFACT_DIR = 'C:\\Users\\shrea\\.gemini\\antigravity\\brain\\4cfca2c4-7887-4bdf-8bed-4f93c274fff3'

async function capture() {
  console.log('Rendering 1000:420 cover image...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1000, height: 420, deviceScaleFactor: 2 })

  const htmlPath = path.join(__dirname, 'cover.html')
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1000))

  const targetPath1 = path.join(__dirname, '..', 'cover_image_1000x420.png')
  const targetPath2 = path.join(ARTIFACT_DIR, 'cover_image_1000x420.png')

  await page.screenshot({ path: targetPath1, type: 'png' })
  await page.screenshot({ path: targetPath2, type: 'png' })

  console.log('Saved cover images to:', targetPath1, 'and', targetPath2)
  await browser.close()
}

capture().catch(err => {
  console.error(err)
  process.exit(1)
})
