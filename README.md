# SNT — Tier-2 B2B/B2R Trade Platform Website

A marketing and lead-generation website for **SNT**, a B2B/B2R trade platform connecting contractors, dealers and farmers with verified local manufacturers across construction materials, hardware & electrical, and agri inputs — starting in Shimoga and Davangere, Karnataka.

**Live site:** [gorgeous-torte-24ff79.netlify.app](https://gorgeous-torte-24ff79.netlify.app/) *(update this link if you redeploy to a new URL)*

---

## What's in this repo

```
SNT-Website/
├── index.html        # Page structure and content
├── css/
│   └── style.css      # All styling (design tokens, layout, responsive rules)
├── js/
│   └── main.js         # Mobile nav, tabs, role toggle, enquiry form logic
└── README.md
```

Plain HTML/CSS/JS — no build step, no framework, no dependencies to install. Open `index.html` in any browser and it works.

## Features

- **Responsive design** — works on mobile, tablet and desktop
- **Three product verticals** — Construction Materials, Hardware & Electrical, Agri Inputs & Equipment
- **Buyer / Dealer / Vendor enquiry form** that sends straight to WhatsApp — no backend needed
- **Form memory** — details you type are remembered across role switches and across visits (using browser local storage), so you don't have to retype your name and phone every time
- **Custom inline SVG illustrations** — no external images, nothing that can break or fail to load
- **Coverage roadmap** — Shimoga → Davangere → Chitradurga/Bellary → Hubli-Dharwad rollout plan

## Running it locally

No installation needed — just open the file:

```bash
# Clone the repo, then:
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or use a simple local server (recommended, avoids any file:// quirks):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

This site is currently deployed on **Netlify** via drag-and-drop:

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole `SNT-Website` folder onto the page
3. Netlify gives you a live URL instantly

To update the live site after making changes, just drag the folder in again (or connect this GitHub repo to Netlify for auto-deploys on every push — see below).

### Auto-deploy from GitHub (optional, do this once you're comfortable)

1. On [netlify.com](https://netlify.com), click **Add new site → Import an existing project**
2. Connect your GitHub account and pick this repo
3. Leave build settings blank (no build command needed for a static site) and set publish directory to `/`
4. Every push to `main` will now auto-deploy

## Editing content

- **Text and structure** — edit `index.html`
- **Colors, fonts, spacing** — edit `css/style.css` (design tokens are at the top of the file under `:root`)
- **WhatsApp number, form behavior** — edit `js/main.js`, look for `WHATSAPP_NUMBER`

## Contact configured on this site

- WhatsApp / Call: +91 89040 93932, +91 87622 89733
- Email: ntvasu5208@gmail.com
- Base: Shimoga, Karnataka

## Save enquiries to a Google Sheet (optional, 5-minute setup)

By default, every enquiry only goes out via WhatsApp. If you also want a running list of every enquiry saved automatically to a spreadsheet, set this up once:

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet
2. In row 1, add these column headers: `Timestamp | Role | Name | Phone | Town | Category | Message`
3. Click **Extensions → Apps Script**. Delete anything in the editor and paste this in:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     sheet.appendRow([
       new Date(),
       e.parameter.role || '',
       e.parameter.name || '',
       e.parameter.phone || '',
       e.parameter.town || '',
       e.parameter.category || '',
       e.parameter.message || ''
     ]);
     return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

4. Click **Deploy → New deployment**. For "Select type," choose **Web app**.
5. Set **"Execute as"** to yourself, and **"Who has access"** to **Anyone**. Click Deploy.
6. Google will ask you to authorize it — approve it (it's your own script, this is normal).
7. Copy the **Web app URL** it gives you (starts with `https://script.google.com/macros/s/...`)
8. Open `js/main.js` in this project, find `SHEET_WEBHOOK_URL`, and paste your URL in there
9. Redeploy the site — every future enquiry now lands as a new row in your Sheet automatically

To get it as an actual `.xlsx` file at any point: in the Sheet, **File → Download → Microsoft Excel (.xlsx)**.

## Notes for next steps

- The 6 illustrations in the Categories and Gallery sections are placeholders (hand-drawn SVG, not real photos) — swap them for real site/vendor/farm photos when available. Search `slot-label` and `scene` in the code to find them.
- No backend/database — the enquiry form works entirely through WhatsApp deep links and browser local storage. If you outgrow this (e.g. want to store enquiries in a proper database), that's a good next milestone once volume justifies it.
