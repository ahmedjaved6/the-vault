# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-flow.spec.ts >> The Vault E2E Full Flow >> Complete application lifecycle
- Location: e2e\full-flow.spec.ts:43:7

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: page.fill: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('input[name="authenticity"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - complementary [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img [ref=e7]
            - generic [ref=e11]: Vault
          - button [ref=e12]:
            - img
        - navigation [ref=e13]:
          - link "Home" [ref=e14] [cursor=pointer]:
            - /url: /app
            - img [ref=e15]
            - generic [ref=e18]: Home
          - link "Add" [ref=e19] [cursor=pointer]:
            - /url: /app/add
            - img [ref=e20]
            - generic [ref=e22]: Add
          - link "Portfolio" [ref=e23] [cursor=pointer]:
            - /url: /app/portfolio
            - img [ref=e24]
            - generic [ref=e27]: Portfolio
          - link "Search" [ref=e28] [cursor=pointer]:
            - /url: /app/search
            - img [ref=e29]
            - generic [ref=e32]: Search
          - link "Profile" [ref=e33] [cursor=pointer]:
            - /url: /app/profile
            - img [ref=e34]
            - generic [ref=e37]: Profile
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e41]: T
            - generic [ref=e42]:
              - paragraph [ref=e43]: Test Admin 1777970323427
              - paragraph [ref=e44]: test_1777970323427@example.com
          - generic [ref=e45]:
            - link "Settings" [ref=e46] [cursor=pointer]:
              - /url: /app/settings
              - img [ref=e47]
              - generic [ref=e50]: Settings
            - button "Logout" [ref=e51]:
              - img
              - generic [ref=e52]: Logout
      - main [ref=e54]:
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]:
              - heading "Add Statue" [level=1] [ref=e61]
              - paragraph [ref=e62]: Fill in the details below to catalog your item.
            - button "Change Category" [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66] [cursor=pointer]:
                - generic [ref=e67]:
                  - img [ref=e69]
                  - text: Basic Information
                - img [ref=e71]
              - generic [ref=e76]:
                - generic [ref=e77]:
                  - text: Item Name *
                  - textbox "Item Name *" [ref=e78]:
                    - /placeholder: e.g. Darth Vader Premium Format
                    - text: Aphrodite of Test
                - generic [ref=e79]:
                  - text: Manufacturer
                  - textbox "Manufacturer" [ref=e80]:
                    - /placeholder: e.g. Sideshow Collectibles
                    - text: Antigravity Studio
                - generic [ref=e81]:
                  - text: Artist / Line
                  - textbox "Artist / Line" [ref=e82]:
                    - /placeholder: e.g. XM Studios
                - generic [ref=e83]:
                  - text: License
                  - textbox "License" [ref=e84]:
                    - /placeholder: e.g. Star Wars
                    - text: Ancient Mythos
                - generic [ref=e85]:
                  - text: Series
                  - textbox "Series" [ref=e86]:
                    - /placeholder: e.g. Mythos
                    - text: E2E Collection
            - generic [ref=e87]:
              - generic [ref=e88] [cursor=pointer]:
                - generic [ref=e89]:
                  - img [ref=e91]
                  - text: Physical Details
                - img [ref=e96]
              - generic [ref=e101]:
                - generic [ref=e102]:
                  - text: Scale
                  - textbox "Scale" [ref=e103]:
                    - /placeholder: e.g. 1/4
                    - text: 1/4
                - generic [ref=e104]:
                  - text: Material
                  - combobox "Material" [ref=e105]:
                    - generic: Polystone
                    - img [ref=e106]
                  - combobox [ref=e108]
                - generic [ref=e109]:
                  - text: Sculptor
                  - textbox "Sculptor" [ref=e110]:
                    - /placeholder: Artist name
                - generic [ref=e111]:
                  - generic [ref=e112]:
                    - text: Height (cm)
                    - spinbutton "Height (cm)" [ref=e113]
                  - generic [ref=e114]:
                    - text: Width (cm)
                    - spinbutton "Width (cm)" [ref=e115]
                  - generic [ref=e116]:
                    - text: Depth (cm)
                    - spinbutton "Depth (cm)" [ref=e117]
            - generic [ref=e118]:
              - generic [ref=e119] [cursor=pointer]:
                - generic [ref=e120]:
                  - img [ref=e122]
                  - text: Edition & Rarity
                - img [ref=e125]
              - generic [ref=e130]:
                - generic [ref=e131]:
                  - text: Total Edition Size (ES)
                  - spinbutton "Total Edition Size (ES)" [ref=e132]
                  - paragraph [ref=e133]: Total number produced
                - generic [ref=e134]:
                  - text: Edition Number
                  - spinbutton "Edition Number" [ref=e135]
                  - paragraph [ref=e136]: Your specific number (e.g. 125 / 500)
            - generic [ref=e137]:
              - generic [ref=e138] [cursor=pointer]:
                - generic [ref=e139]:
                  - img [ref=e141]
                  - text: Provenance & Value
                - img [ref=e143]
              - generic [ref=e148]:
                - generic [ref=e149]:
                  - generic [ref=e150]: Purchase Date
                  - button "Purchase Date" [ref=e151]:
                    - generic [ref=e152]: Pick a date
                    - img
                - generic [ref=e153]:
                  - text: Purchase Price ($)
                  - spinbutton "Purchase Price ($)" [ref=e154]: "1200"
                - generic [ref=e155]:
                  - text: Current Market Value ($)
                  - spinbutton "Current Market Value ($)" [active] [ref=e156]: "1800"
                - generic [ref=e157]:
                  - text: Retailer / Seller
                  - textbox "Retailer / Seller" [ref=e158]:
                    - /placeholder: e.g. BigBadToyStore
                - generic [ref=e159]:
                  - generic [ref=e160]:
                    - text: Insured
                    - paragraph [ref=e161]: Item is covered by collectibles insurance
                  - switch "Insured" [ref=e162] [cursor=pointer]
                  - checkbox
            - generic [ref=e163]:
              - generic [ref=e164] [cursor=pointer]:
                - generic [ref=e165]:
                  - img [ref=e167]
                  - text: Condition
                - img [ref=e170]
              - generic [ref=e175]:
                - generic [ref=e176]:
                  - text: Box Condition
                  - combobox "Box Condition" [ref=e177]:
                    - generic: Select condition
                    - img [ref=e178]
                  - combobox [ref=e180]
                - generic [ref=e181]:
                  - text: Figure Condition
                  - combobox "Figure Condition" [ref=e182]:
                    - generic: Select condition
                    - img [ref=e183]
                  - combobox [ref=e185]
            - generic [ref=e186]:
              - generic [ref=e187] [cursor=pointer]:
                - generic [ref=e188]:
                  - img [ref=e190]
                  - text: Photos & Media
                - img [ref=e194]
              - generic [ref=e199]:
                - generic [ref=e201]:
                  - text: Primary Thumbnail Image
                  - generic [ref=e203]:
                    - img [ref=e205]
                    - paragraph [ref=e208]: Click or drag to upload
                    - paragraph [ref=e209]: PNG, JPG, WEBP up to 5MB
                    - button "Choose File" [ref=e210] [cursor=pointer]
                - generic [ref=e212]:
                  - text: Gallery Images
                  - generic [ref=e214] [cursor=pointer]:
                    - img [ref=e215]
                    - generic [ref=e217]: Add More
                    - button "Choose File" [ref=e218]
            - generic [ref=e219]:
              - generic [ref=e220] [cursor=pointer]:
                - generic [ref=e221]:
                  - img [ref=e223]
                  - text: Notes
                - img [ref=e226]
              - textbox "Add any extra details, history, or damage reports..." [ref=e232]
            - generic [ref=e233]:
              - button "Cancel" [ref=e234]
              - button "Add to Vault" [ref=e235]:
                - img
                - text: Add to Vault
    - region "Notifications alt+T"
  - generic [ref=e240] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e241]:
      - img [ref=e242]
    - generic [ref=e245]:
      - button "Open issues overlay" [ref=e246]:
        - generic [ref=e247]:
          - generic [ref=e248]: "0"
          - generic [ref=e249]: "1"
        - generic [ref=e250]: Issue
      - button "Collapse issues badge" [ref=e251]:
        - img [ref=e252]
  - alert [ref=e254]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { createClient } from '@supabase/supabase-js';
  3   | import * as dotenv from 'dotenv';
  4   | import * as path from 'path';
  5   | 
  6   | dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
  7   | 
  8   | const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  9   | const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  10  | const supabase = createClient(supabaseUrl, serviceRoleKey);
  11  | 
  12  | test.describe('The Vault E2E Full Flow', () => {
  13  |   const timestamp = Date.now();
  14  |   const testUser = {
  15  |     fullName: `Test Admin ${timestamp}`,
  16  |     username: `tester_${timestamp}`,
  17  |     email: `test_${timestamp}@example.com`,
  18  |     password: 'Password123!',
  19  |   };
  20  | 
  21  |   async function navigateWithRetry(page: any, url: string, selector: string, retries = 3) {
  22  |     for (let i = 0; i < retries; i++) {
  23  |       console.log(`Navigating to ${url} (Attempt ${i + 1})...`);
  24  |       await page.goto(url);
  25  |       
  26  |       // Check if body is empty or has error
  27  |       const bodyContent = await page.innerText('body');
  28  |       if (bodyContent.trim().length > 0) {
  29  |         try {
  30  |           await page.waitForSelector(selector, { timeout: 10000 });
  31  |           return;
  32  |         } catch (e) {
  33  |           console.log(`Selector ${selector} not found, reloading...`);
  34  |         }
  35  |       } else {
  36  |         console.log('Page body is empty, retrying...');
  37  |       }
  38  |       await page.waitForTimeout(2000);
  39  |     }
  40  |     throw new Error(`Failed to navigate to ${url} after ${retries} retries`);
  41  |   }
  42  | 
  43  |   test('Complete application lifecycle', async ({ page }) => {
  44  |     page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
  45  |     page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
  46  |     
  47  |     // A. Create User via Admin API
  48  |     console.log('--- A. Account Creation ---');
  49  |     const { data: adminUser, error: createError } = await supabase.auth.admin.createUser({
  50  |       email: testUser.email,
  51  |       password: testUser.password,
  52  |       email_confirm: true,
  53  |       user_metadata: {
  54  |         full_name: testUser.fullName,
  55  |         username: testUser.username,
  56  |       }
  57  |     });
  58  | 
  59  |     if (createError) throw createError;
  60  |     const newUser = adminUser.user;
  61  |     console.log('✅ User created.');
  62  | 
  63  |     // Login via UI
  64  |     console.log('Logging in...');
  65  |     await page.goto('/auth/signin');
  66  |     await page.waitForSelector('[data-hydrated="true"]', { timeout: 10000 });
  67  |     await page.fill('input[name="email"]', testUser.email);
  68  |     await page.fill('input[name="password"]', testUser.password);
  69  |     await page.click('button:has-text("Sign In")');
  70  |     
  71  |     // Wait for redirect + cookie sync delay (1s on server + 1s buffer)
  72  |     await page.waitForTimeout(2500);
  73  |     await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
  74  |     console.log('✅ Login successful');
  75  | 
  76  |     // B. Add a Statue
  77  |     console.log('--- B. Add Item ---');
  78  |     await navigateWithRetry(page, '/app/add?open=true', '[data-testid="category-card-statue"]');
  79  |     
  80  |     await page.click('[data-testid="category-card-statue"]');
  81  |     await page.waitForSelector('input[name="name"]', { timeout: 10000 });
  82  |     
  83  |     // Fill Form (Sections are already open due to ?open=true)
  84  |     await page.fill('input[name="name"]', 'Aphrodite of Test');
  85  |     await page.fill('input[name="manufacturer"]', 'Antigravity Studio');
  86  |     await page.fill('input[name="license_holder"]', 'Ancient Mythos');
  87  |     await page.fill('input[name="series_name"]', 'E2E Collection');
  88  |     await page.fill('input[name="scale"]', '1/4');
  89  |     await page.click('button:has-text("Select material")');
  90  |     await page.click('span:has-text("Polystone")');
  91  |     await page.fill('input[name="cost_price"]', '1200');
  92  |     await page.fill('input[name="current_value"]', '1800');
> 93  |     await page.fill('input[name="authenticity"]', 'Certified AI');
      |                ^ Error: page.fill: Test timeout of 180000ms exceeded.
  94  |     await page.fill('textarea[name="notes"]', 'Created during E2E test run.');
  95  | 
  96  |     // Upload Image
  97  |     await page.setInputFiles('input[type="file"]', 'public/test-image.png');
  98  |     await page.waitForSelector('img[alt="Preview"]', { timeout: 15000 });
  99  |     
  100 |     await page.click('button:has-text("Add to Vault")');
  101 |     await page.waitForURL(/\/app\/[a-z0-9-]+/);
  102 |     console.log('✅ Item added.');
  103 | 
  104 |     // C. Edit Item
  105 |     console.log('--- C. Edit Item ---');
  106 |     const detailUrl = page.url();
  107 |     await page.click('button:has(svg.lucide-more-vertical)');
  108 |     await page.click('text=Edit Item');
  109 |     
  110 |     // Force sections open on edit too
  111 |     const editUrl = page.url() + (page.url().includes('?') ? '&open=true' : '?open=true');
  112 |     await page.goto(editUrl);
  113 |     
  114 |     await page.fill('input[name="name"]', 'Aphrodite of Test (Edited)');
  115 |     await page.click('button:has-text("Update Collectible")');
  116 |     await expect(page.locator('h1')).toContainText('Edited');
  117 |     console.log('✅ Item edited.');
  118 | 
  119 |     // D. Portfolio
  120 |     console.log('--- D. Portfolio ---');
  121 |     await page.goto('/app/portfolio');
  122 |     await expect(page.locator('text=$1,800')).toBeVisible({ timeout: 15000 });
  123 |     console.log('✅ Portfolio verified.');
  124 | 
  125 |     // E. Search
  126 |     console.log('--- E. Search ---');
  127 |     await page.goto('/app/search');
  128 |     await page.fill('input[placeholder*="Search"]', 'Aphrodite');
  129 |     await expect(page.locator('text=Aphrodite')).toBeVisible();
  130 |     console.log('✅ Search verified.');
  131 | 
  132 |     // F. Admin
  133 |     console.log('--- F. Admin ---');
  134 |     if (newUser) {
  135 |       await supabase.from('profiles').update({ role: 'admin' }).eq('id', newUser.id);
  136 |     }
  137 |     await page.goto('/admin');
  138 |     await expect(page.locator('h1')).toContainText('Admin Overview');
  139 |     console.log('✅ Admin verified.');
  140 | 
  141 |     // G. Deletion
  142 |     console.log('--- G. Deletion ---');
  143 |     await page.click('text=Users');
  144 |     await page.click('button:has(svg.lucide-more-horizontal)');
  145 |     await page.click('text=Delete Account');
  146 |     await page.click('button:has-text("Delete Account")');
  147 |     await expect(page).toHaveURL(/\/auth\/signin/);
  148 |     console.log('✅ User deleted.');
  149 |   });
  150 | });
  151 | 
```