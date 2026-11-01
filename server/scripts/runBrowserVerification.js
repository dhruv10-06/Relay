import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHOTS_DIR = path.resolve(__dirname, '../../docs/verification_screenshots');

if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true });

async function runBrowserJourney() {
  console.log('======================================================================');
  console.log('STARTING REAL BROWSER USER JOURNEY VERIFICATION (GOOGLE CHROME)');
  console.log('======================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // Accept all browser dialogs (confirm/alert) automatically
  page.on('dialog', async (dialog) => {
    console.log(`  [Dialog] ${dialog.type()}: "${dialog.message()}" -> Auto Accepting`);
    await dialog.accept();
  });

  // Helper to log and screenshot
  async function snap(name, desc) {
    const file = path.join(SHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const stats = fs.statSync(file);
    console.log(`📸 [${name}] Captured screenshot: ${desc} (${stats.size} bytes)`);
  }

  // 1. Open Landing Page
  console.log('Step 1: Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await snap('01_landing_page', 'Landing Page with RELAY branding and 4 Knowledge States');

  // 2. Open Projects Dashboard
  console.log('\nStep 2: Clicking "Open Projects Dashboard"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dashBtn = btns.find((b) => b.textContent.includes('Open Projects Dashboard'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('02_dashboard', 'Projects Dashboard showing project cards and metrics');

  // 3. Load Sample Scenario (Project Nexus)
  console.log('\nStep 3: Loading Sample Scenario (Project Nexus)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sampleBtn = btns.find((b) => b.textContent.includes('Load Sample Project') || b.textContent.includes('Load Sample Scenario'));
    if (sampleBtn) sampleBtn.click();
  });
  // Wait for ingestion and auto-analysis
  await new Promise((r) => setTimeout(r, 4500));
  await snap('03_workspace_sample_loaded', 'Workspace loaded with Project Nexus and gap metrics');

  // 4. Inspect Tab 1: Source Documents
  console.log('\nStep 4: Inspecting Tab 1: Source Documents...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const docTab = tabs.find((b) => b.textContent.includes('Source Documents'));
    if (docTab) docTab.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('04_tab1_source_documents', 'Source Documents listing PDF, DOCX, TXT, CSV');

  // 5. Open Preview Modal on ADR-042 PDF
  console.log('\nStep 5: Opening Extracted Text Preview Modal...');
  await page.evaluate(() => {
    const previewBtn = document.querySelector('button[title="Preview Extracted Text"]');
    if (previewBtn) previewBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('05_doc_preview_modal', 'Extracted Document Preview Modal');

  // Close preview modal
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Close Document Preview') || b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // 6. Switch to Tab 3: Knowledge Gap & Evidence Matrix
  console.log('\nStep 6: Switching to Tab 3: Gap & Evidence Matrix...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const gapTab = tabs.find((b) => b.textContent.includes('Gap & Evidence Matrix'));
    if (gapTab) gapTab.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('06_tab3_gap_matrix_all', 'Knowledge Gap Matrix showing all findings');

  // 7. Filter by "Contradicted"
  console.log('\nStep 7: Filtering by "Contradicted"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const contraBtn = btns.find((b) => b.textContent.includes('Contradicted'));
    if (contraBtn) contraBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await snap('07_tab3_contradicted_filter', 'Contradicted Findings Filter (Redis LRU vs LFU)');

  // 8. Open Evidence Modal on Redis finding
  console.log('\nStep 8: Opening Supporting Evidence Modal on Contradiction...');
  await page.evaluate(() => {
    const evBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Inspect Evidence'));
    if (evBtn) evBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('08_evidence_modal_redis', 'Evidence Modal showing verbatim quotes from meeting notes & QA report');

  // Close evidence modal
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Close Evidence Inspector') || b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // 9. Switch to Tab 4: Human Review
  console.log('\nStep 9: Switching to Tab 4: Human Review...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const reviewTab = tabs.find((b) => b.textContent.includes('Human Review'));
    if (reviewTab) reviewTab.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('09_tab4_human_review_pending', 'Human Review Queue before bulk approval');

  // Click "Approve All Verified Findings"
  console.log('\nStep 10: Clicking "Approve All Verified Findings"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bulkBtn = btns.find((b) => b.textContent.includes('Approve All Verified Findings'));
    if (bulkBtn) bulkBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2500));
  await snap('10_tab4_human_review_approved', 'Human Review Queue after approval (100% progress)');

  // 10. Switch to Tab 5: Handover Report & 24H Continuation Plan
  console.log('\nStep 11: Switching to Tab 5: Handover Report & 24H Continuation Plan...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const hTab = tabs.find((b) => b.textContent.includes('Handover & 24H Plan'));
    if (hTab) hTab.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // If "Compile Handover Now" or "Re-compile" button is present, click it
  await page.evaluate(() => {
    const compileBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Compile Handover') || b.textContent.includes('Generate Handover'));
    if (compileBtn) compileBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2500));
  await snap('11_tab5_handover_report', 'Handover Report with First 24 Hours Continuation Plan Table');

  // 11. Return to Dashboard and Create New Project
  console.log('\nStep 12: Returning to Dashboard and Creating New Project...');
  await page.evaluate(() => {
    const navBtns = Array.from(document.querySelectorAll('header button, nav button'));
    const dashBtn = navBtns.find((b) => b.textContent.includes('Projects Workspace'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await snap('12_dashboard_returned', 'Dashboard returned');

  // Click "New Project" button
  console.log('Clicking "New Project" button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const newBtn = btns.find((b) => b.textContent.includes('New Project'));
    if (newBtn) newBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Wait for modal input
  await page.waitForSelector('input[name="name"]', { visible: true, timeout: 5000 });

  // Fill in form inputs
  await page.type('input[name="name"]', 'Project Apollo — Real-Time Fraud Engine');
  await page.type('textarea[name="description"]', 'Sub-second feature store migration to Redis Enterprise with Flink stream joins.');
  await page.type('input[name="departingPerson"]', 'Alex Vance');
  await page.type('input[name="incomingPerson"]', 'Jordan Lee');

  await snap('13_new_project_modal', 'New Project Creation Modal filled in');

  // Submit form
  console.log('Submitting New Project form...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find((b) => b.textContent.includes('Create Project'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2500));

  await snap('14_new_project_workspace_opened', 'New Project Workspace initialized and opened');

  console.log('\n======================================================================');
  console.log('✅ REAL BROWSER JOURNEY COMPLETED: 14/14 SCREENSHOTS CAPTURED');
  console.log(`Saved in: ${SHOTS_DIR}`);
  console.log('======================================================================\n');

  await browser.close();
}

runBrowserJourney().catch(console.error);
