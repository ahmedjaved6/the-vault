import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

test.describe('The Vault E2E Full Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    fullName: `Test Admin ${timestamp}`,
    username: `tester_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'Password123!',
  };

  async function navigateWithRetry(page: any, url: string, selector: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      console.log(`Navigating to ${url} (Attempt ${i + 1})...`);
      await page.goto(url);
      
      // Check if body is empty or has error
      const bodyContent = await page.innerText('body');
      if (bodyContent.trim().length > 0) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
          return;
        } catch (e) {
          console.log(`Selector ${selector} not found, reloading...`);
        }
      } else {
        console.log('Page body is empty, retrying...');
      }
      await page.waitForTimeout(2000);
    }
    throw new Error(`Failed to navigate to ${url} after ${retries} retries`);
  }

  test('Complete application lifecycle', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
    
    // A. Create User via Admin API
    console.log('--- A. Account Creation ---');
    const { data: adminUser, error: createError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: testUser.fullName,
        username: testUser.username,
      }
    });

    if (createError) throw createError;
    const newUser = adminUser.user;
    console.log('✅ User created.');

    // Login via UI
    console.log('Logging in...');
    await page.goto('/auth/signin');
    await page.waitForSelector('[data-hydrated="true"]', { timeout: 10000 });
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    
    // Wait for redirect + cookie sync delay (1s on server + 1s buffer)
    await page.waitForTimeout(2500);
    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
    console.log('✅ Login successful');

    // B. Add a Statue
    console.log('--- B. Add Item ---');
    await navigateWithRetry(page, '/app/add?open=true', '[data-testid="category-card-statue"]');
    
    await page.click('[data-testid="category-card-statue"]');
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    
    // Fill Form (Sections are already open due to ?open=true)
    await page.fill('input[name="name"]', 'Aphrodite of Test');
    await page.fill('input[name="manufacturer"]', 'Antigravity Studio');
    await page.fill('input[name="license_holder"]', 'Ancient Mythos');
    await page.fill('input[name="series_name"]', 'E2E Collection');
    await page.fill('input[name="scale"]', '1/4');
    await page.click('button:has-text("Select material")');
    await page.click('span:has-text("Polystone")');
    await page.fill('input[name="cost_price"]', '1200');
    await page.fill('input[name="current_value"]', '1800');
    await page.fill('input[name="authenticity"]', 'Certified AI');
    await page.fill('textarea[name="notes"]', 'Created during E2E test run.');

    // Upload Image
    await page.setInputFiles('input[type="file"]', 'public/test-image.png');
    await page.waitForSelector('img[alt="Preview"]', { timeout: 15000 });
    
    await page.click('button:has-text("Add to Vault")');
    await page.waitForURL(/\/app\/[a-z0-9-]+/);
    console.log('✅ Item added.');

    // C. Edit Item
    console.log('--- C. Edit Item ---');
    const detailUrl = page.url();
    await page.click('button:has(svg.lucide-more-vertical)');
    await page.click('text=Edit Item');
    
    // Force sections open on edit too
    const editUrl = page.url() + (page.url().includes('?') ? '&open=true' : '?open=true');
    await page.goto(editUrl);
    
    await page.fill('input[name="name"]', 'Aphrodite of Test (Edited)');
    await page.click('button:has-text("Update Collectible")');
    await expect(page.locator('h1')).toContainText('Edited');
    console.log('✅ Item edited.');

    // D. Portfolio
    console.log('--- D. Portfolio ---');
    await page.goto('/app/portfolio');
    await expect(page.locator('text=$1,800')).toBeVisible({ timeout: 15000 });
    console.log('✅ Portfolio verified.');

    // E. Search
    console.log('--- E. Search ---');
    await page.goto('/app/search');
    await page.fill('input[placeholder*="Search"]', 'Aphrodite');
    await expect(page.locator('text=Aphrodite')).toBeVisible();
    console.log('✅ Search verified.');

    // F. Admin
    console.log('--- F. Admin ---');
    if (newUser) {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', newUser.id);
    }
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Admin Overview');
    console.log('✅ Admin verified.');

    // G. Deletion
    console.log('--- G. Deletion ---');
    await page.click('text=Users');
    await page.click('button:has(svg.lucide-more-horizontal)');
    await page.click('text=Delete Account');
    await page.click('button:has-text("Delete Account")');
    await expect(page).toHaveURL(/\/auth\/signin/);
    console.log('✅ User deleted.');
  });
});
