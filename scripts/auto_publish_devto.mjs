import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const COVER_IMAGE_PATH = path.join(__dirname, '..', 'screenshots', 'cover_image_1000x420.png')
const SUBMISSION_MD_PATH = path.join(__dirname, '..', 'DEVTO_SUBMISSION.md')

export async function publishViaApi(apiKey) {
  console.log('Publishing to DEV.to via official API...')
  let markdown = fs.readFileSync(SUBMISSION_MD_PATH, 'utf-8').trim()
  if (markdown.startsWith('# Racksmith:')) {
    markdown = markdown.replace(/^#\s+[^\n]+\n+/, '')
  }

  const payload = {
    article: {
      title: 'Racksmith: The Autonomous Modular Synth Planner Powered by Sanity Context MCP',
      published: true,
      body_markdown: markdown,
      tags: ['devchallenge', 'sanitychallenge', 'sanity', 'ai'],
      main_image: 'https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/cover_image_1000x420.png'
    }
  }

  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(`DEV.to API Error: ${JSON.stringify(result)}`)
  }

  console.log('SUCCESS! Article published live at:', result.url)
  return result
}

export async function publishViaBrowser() {
  console.log('Launching browser to automate submission...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox']
  })

  const page = await browser.newPage()
  console.log('Opening https://dev.to/new ...')
  await page.goto('https://dev.to/new', { waitUntil: 'networkidle2' })

  // Check if we need to log in
  const isLoginPage = await page.evaluate(() => {
    return document.body.innerText.includes('Join the DEV Community') || document.body.innerText.includes('Continue with GitHub')
  })

  if (isLoginPage) {
    console.log('👉 Please click "Continue with GitHub" in the opened browser window...')
    // Wait until logged in and on the new article editor
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })
  }

  console.log('Currently at:', page.url())
  if (!page.url().includes('/new')) {
    await page.goto('https://dev.to/new', { waitUntil: 'networkidle2' })
  }

  console.log('Filling out DEV.to submission form...')
  const markdown = fs.readFileSync(SUBMISSION_MD_PATH, 'utf-8')

  // Wait for title and body inputs
  await page.waitForSelector('#article-form, #article_title, textarea', { timeout: 30000 })

  // Fill Title
  const titleInput = await page.$('#article_title, textarea[placeholder*="title" i], textarea[aria-label*="title" i]')
  if (titleInput) {
    await titleInput.click()
    await titleInput.type('Racksmith: The Autonomous Modular Synth Planner Powered by Sanity Context MCP')
  }

  // Upload Cover Image if file input exists
  const fileInput = await page.$('input[type="file"]')
  if (fileInput && fs.existsSync(COVER_IMAGE_PATH)) {
    console.log('Uploading cover image:', COVER_IMAGE_PATH)
    await fileInput.uploadFile(COVER_IMAGE_PATH)
    await new Promise(r => setTimeout(r, 2000))
  }

  // Fill Body Markdown
  const bodyTextarea = await page.$('#article_body_markdown, textarea[placeholder*="write" i], .crayons-article-form textarea')
  if (bodyTextarea) {
    console.log('Pasting markdown body...')
    await bodyTextarea.click()
    await page.evaluate((text) => {
      const textarea = document.querySelector('#article_body_markdown') || document.querySelectorAll('textarea')[1]
      if (textarea) {
        textarea.value = text
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        textarea.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, markdown)
  }

  console.log('Form filled successfully! Ready to publish.')
}

const args = process.argv.slice(2)
if (args[0] === '--api' && args[1]) {
  publishViaApi(args[1]).catch(e => console.error(e))
} else if (args[0] === '--browser') {
  publishViaBrowser().catch(e => console.error(e))
}
