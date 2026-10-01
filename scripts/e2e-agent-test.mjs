import puppeteer from 'puppeteer-core'
import path from 'path'

const ARTIFACT_DIR = 'C:\\Users\\shrea\\.gemini\\antigravity\\brain\\4cfca2c4-7887-4bdf-8bed-4f93c274fff3'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  console.log('🤖 Launching Chrome for Agent Prompt Test...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--use-gl=swiftshader']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Browser Console Error:', msg.text())
      consoleErrors.push(msg.text())
    }
  })

  page.on('pageerror', err => {
    console.error('❌ Page Error:', err.message)
    consoleErrors.push(err.message)
  })

  try {
    console.log('🌐 Opening http://localhost:3000...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(2000)

    // Shot 1: Initial State
    const shot1 = path.join(ARTIFACT_DIR, 'agent_01_ready.png')
    await page.screenshot({ path: shot1 })
    console.log('📸 Shot 1:', shot1)

    // Clear existing rack if any
    const clearBtn = await page.$('button[title="Clear all modules from rack"]')
    if (clearBtn) {
      await clearBtn.click()
      await sleep(500)
    }

    // Type prompt in AI agent input
    console.log('✍️ Typing prompt into Racksmith AI...')
    const inputSelector = 'input[placeholder*="Ask Racksmith"]'
    await page.waitForSelector(inputSelector)
    await page.focus(inputSelector)
    await page.keyboard.type('Build me a beginner ambient synthesis rack in Intellijel 7U with Plaits and Maths', { delay: 20 })

    await sleep(500)
    const shot2 = path.join(ARTIFACT_DIR, 'agent_02_prompt_typed.png')
    await page.screenshot({ path: shot2 })
    console.log('📸 Shot 2:', shot2)

    // Submit form
    console.log('🚀 Sending prompt to agent...')
    await page.keyboard.press('Enter')

    // Wait for agent to process and return response
    console.log('⏳ Waiting for Sanity Context MCP execution pipeline...')
    await page.waitForSelector('xpath///button[contains(., "Apply Rack to 3D View")]', { timeout: 35000 })
    await sleep(1500)

    // Open MCP Wire Inspector to show tool calls
    const mcpWireBtn = await page.$('button[title="Toggle MCP Protocol Wire Inspector"]')
    if (mcpWireBtn) {
      await mcpWireBtn.click()
      await sleep(800)
    }

    // Shot 3: Agent Response with execution steps and MCP Wire
    const shot3 = path.join(ARTIFACT_DIR, 'agent_03_mcp_response.png')
    await page.screenshot({ path: shot3 })
    console.log('📸 Shot 3:', shot3)

    // Click "Apply Rack to 3D View"
    console.log('🔨 Clicking "Apply Rack to 3D View"...')
    const applyBtn = await page.waitForSelector('xpath///button[contains(., "Apply Rack to 3D View")]')
    if (applyBtn) {
      await applyBtn.click()
      await sleep(2500)
    }

    // Shot 4: 3D Rack Updated
    const shot4 = path.join(ARTIFACT_DIR, 'agent_04_rack_built.png')
    await page.screenshot({ path: shot4 })
    console.log('📸 Shot 4:', shot4)

    console.log('🎉 Agent test completed successfully!')
    if (consoleErrors.length > 0) {
      console.warn('⚠️ Console errors noted:', consoleErrors)
    } else {
      console.log('✨ Zero console errors detected!')
    }
  } catch (err) {
    console.error('❌ Agent Test Failed:', err)
  } finally {
    await browser.close()
    console.log('🏁 Browser closed.')
  }
}

run()
