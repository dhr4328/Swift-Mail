# 📬 Smart Gmail Cleaner — User Manual

> **Smart Gmail Cleaner** (also known as Swift Mail / Inbox Zen) is a web app that helps you clean, organize, and analyze your Gmail inbox in minutes — not hours. All operations go through the Gmail API so your email content is never stored on our servers.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Signing In with Google](#2-signing-in-with-google)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Overview Tab — Analytics & Insights](#4-overview-tab--analytics--insights)
5. [Emails Tab — Browsing Your Inbox](#5-emails-tab--browsing-your-inbox)
6. [Filtering Emails](#6-filtering-emails)
7. [Searching Emails](#7-searching-emails)
8. [Selecting Emails & Bulk Actions](#8-selecting-emails--bulk-actions)
9. [Deleting All Emails (Trash All)](#9-deleting-all-emails-trash-all)
10. [Refreshing the Email List](#10-refreshing-the-email-list)
11. [Signing Out](#11-signing-out)
12. [Pricing Plans](#12-pricing-plans)
13. [Privacy & Safety](#13-privacy--safety)
14. [FAQ](#14-faq)

---

## 1. Getting Started

### Requirements
- A **Google / Gmail account**
- A modern web browser (Chrome, Edge, Firefox, or Safari)
- An internet connection

### Accessing the App
Open your browser and navigate to the app URL provided to you.

No installation, no downloads — the app runs entirely in the browser.

---

## 2. Signing In with Google

1. On the **Landing Page**, click the **"Continue with Google"** button (or **"Sign In"** in the top-right corner).
2. A Google OAuth consent screen will open.
3. Select the Gmail account you want to clean.
4. Grant the requested permissions:
   - **Read** your emails (to show and analyze them)
   - **Modify** your emails (to delete, archive, and mark as read)
5. You will be automatically redirected to your **Dashboard**.

> **Note:** We only request the minimum permissions needed. Your email content is never stored on our servers.

---

## 3. Dashboard Overview

After signing in you land on the **Dashboard**, which has two main sections accessible via tabs at the top:

| Tab | Purpose |
|-----|---------|
| **Overview** | Analytics, charts, inbox health, and smart suggestions |
| **Emails** | Browse, filter, search, select, and manage individual emails |

The **header** (always visible) contains:
- 📧 **App logo / name** — Smart Gmail Cleaner
- 🔍 **Search bar** — search across your inbox in real time
- 🔄 **Refresh button** — reload the email list and stats
- 🟢 **Your email address** — shows the connected Gmail account
- 🚪 **Logout button** — sign out of the app

---

## 4. Overview Tab — Analytics & Insights

Switch to the **Overview** tab to see a high-level summary of your inbox.

### Stat Cards
Three cards at the top show:
- **Total Emails** — total number of emails in your inbox
- **Social** — count of social media emails and their percentage of your inbox
- **Storage Used** — how much of your 15 GB Gmail quota is used (when available)

### Category Chart
A visual breakdown of your emails by category:
- Promotions, Social, Updates/Newsletters, Personal, Spam, etc.

### Storage Chart
A visual indicator of your overall Gmail storage consumption.

### Inbox Health Card
A health score and tips based on your inbox state — unread counts, old emails, large attachments, etc.

### Quick Insights
Smart, one-click suggestions to help you clean your inbox fast. Examples:
- "You have 1,200 promotional emails — clean them up"
- "500 emails older than 2 years"

**Clicking any suggestion** switches to the **Emails tab** and applies that filter automatically.

---

## 5. Emails Tab — Browsing Your Inbox

Switch to the **Emails** tab to see, filter, and manage your emails.

### The 4-Stage Flow

The Emails tab follows a deliberate 4-stage process designed to keep you informed and safe:

```
Stage 1: Apply a Filter
       ↓
Stage 2: Wait — App Loads ALL Emails (buffering indicator shown)
       ↓
Stage 3: Total count displayed + "Trash All" button unlocked
       ↓
Stage 4: Confirm → Emails moved to Trash
```

#### Stage 1 — Apply a Filter
Use the Filter Sidebar or Search bar to select which emails you want to clean.

#### Stage 2 — Buffering
The app immediately starts fetching **every matching email** from Gmail (page by page) in the background. A progress indicator shows at the bottom of the list:

> *"Buffering emails… 1,240 loaded so far"*
> *Loading all matching emails before enabling Trash All*

The **Trash All** button is deliberately locked during this phase so you always know the exact scope before acting.

#### Stage 3 — All Loaded
Once all pages are fetched, a green summary footer appears:

> ✅ **2,450 emails loaded** — All matching emails are ready
> **[Trash All 2,450 Emails]** ← button unlocked

#### Stage 4 — Confirm & Delete
Clicking **Trash All** opens a confirmation dialog showing the exact count and filter name. Confirm to proceed. A live "Moving emails to Trash…" overlay appears during the operation, and a success notification appears when done.

---

## 6. Filtering Emails

The **Filter Sidebar** (left side of the Emails tab) lets you narrow down which emails are shown and acted upon.

On **mobile**, tap the ☰ menu icon in the top-left to open the filter sidebar.

### Filter Groups

#### Categories
| Filter | Matches |
|--------|---------|
| Personal | Emails in the Personal category |
| Work | Primary/Work emails |
| Promotions | Marketing and promotional emails |
| Newsletters | Updates and newsletter emails |
| Social Media | Emails from social networks |
| Finance | Financial notifications |
| Spam-like | Emails flagged as spam |

#### Time Period
| Filter | Matches |
|--------|---------|
| Last month | Emails from the last 30 days |
| Last 6 months | Emails from the last 6 months |
| Last year | Emails from the last 12 months |
| Older than 1 year | Emails older than 1 year |
| Older than 2 years | Emails older than 2 years |
| Older than 3 years | Emails older than 3 years |

#### Email Type
| Filter | Matches |
|--------|---------|
| Unread | All unread emails |
| With attachments | Emails that have file attachments |
| Large (>5MB) | Emails larger than 5 MB |
| Starred | Starred / important emails |

#### Senders
After emails load, a dynamic **Senders** section appears listing the top senders found in your current view. Click any sender to filter by them.

### Combining Filters
You can select **multiple filters at once** — for example, "Promotions + Older than 1 year" to find and delete old promotional emails.

### Clearing Filters
Click **"Clear all"** at the top of the Filter Sidebar to reset all active filters.

---

## 7. Searching Emails

Use the **Search bar** in the header to search across your Gmail inbox using standard Gmail search syntax.

- Type any keyword, sender name, subject, or Gmail operator (e.g. `from:newsletter@example.com`)
- Search combines with active filters — for example, filter by "Promotions" and search for "unsubscribe"
- Results update automatically as you type

---

## 8. Selecting Emails & Bulk Actions

### Selecting Individual Emails
- Check the **checkbox** next to any email row to select it.
- Use the **header checkbox** to select/deselect all visible emails.

### Bulk Action Bar
Once one or more emails are selected, the **Bulk Action Bar** appears at the top of the email list with the following actions:

| Button | Action |
|--------|--------|
| **Mark Read** | Marks all selected emails as read |
| **Archive** | Archives all selected emails (removes from inbox, keeps in All Mail) |
| **Delete Selected** | Moves all selected emails to Trash |
| **Clear** | Deselects all selected emails |

> **Trash All** (for deleting *all* filtered emails at once, not just selected ones) is available in the email list footer after buffering completes — see Section 5 and Section 9.

---

## 9. Deleting All Emails (Trash All) — Step by Step

The **Trash All** feature lets you delete thousands of emails at once safely.

### Step 1 — Apply a Filter
Open the **Emails** tab. In the Filter Sidebar, select one or more filters (e.g. "Promotions" + "Older than 2 years") or use the Search bar.

### Step 2 — Wait for Buffering
The app loads every matching email in the background. You will see the buffering footer:

```
⟳  Buffering emails… 800 loaded so far
   Loading all matching emails before enabling Trash All
   • • •
```

**Do not click anything yet** — the Trash All button is locked during this phase.

### Step 3 — Review the Total Count
When buffering finishes, the footer changes to:

```
✅  1,500 emails loaded — All matching emails are ready
                          [Trash All 1,500 Emails]
```

Review the count carefully. This is exactly how many emails will be moved to Trash.

### Step 4 — Click "Trash All"
Click the red **"Trash All N Emails"** button. A confirmation dialog appears:

> *You are about to move **1,500 emails** matching **Promotions, Older than 2 Years** to Gmail Trash.*
> - Emails will sit in Trash for 30 days before permanent deletion.
> - You can restore them from Gmail Trash during that window.
> - To free storage immediately, empty Trash in Gmail afterward.

Click **"Yes, Trash All 1,500"** to proceed, or **"Cancel"** to go back.

### Step 5 — Wait for Completion
A "Moving emails to Trash…" overlay covers the email list. Do not navigate away. Once done:
- A success toast appears: *"✅ Done — 1,500 emails moved to Gmail Trash."*
- A follow-up reminder appears after 1.5 seconds about emptying Gmail Trash to reclaim storage.

### Step 6 — (Optional) Empty Gmail Trash
To free storage immediately:
1. Open [Gmail](https://mail.google.com)
2. Click **Trash** in the left sidebar
3. Click **"Empty Trash Now"**

> ⚠️ **This action cannot be undone from the app.** You can manually recover emails from Gmail Trash within 30 days.

---

## 10. Refreshing the Email List

Click the **🔄 Refresh** button (top-right of the header) to:
- Reload the email list for the current filter/search
- Re-trigger the auto-load-all buffering process
- Refresh inbox stats

---

## 11. Signing Out

Click the **🚪 Logout** icon in the top-right corner of the header. You will be returned to the Landing Page.

---

## 12. Pricing Plans

| Plan | Price | Key Features |
|------|-------|-------------|
| **Free** | $0 / forever | Analytics, inbox health, up to 500 email deletions/month, basic filters, bulk select & delete |
| **Pro** | $6 / month | Everything in Free + unlimited Delete All, all category & time filters, unsubscribe assistant, priority support |
| **Lifetime** | $49 one-time | Everything in Pro + lifetime updates, multi-account support, early access to new features |

- No credit card required for the Free plan.
- Cancel Pro anytime — no questions asked.
- Archiving and Mark as Read actions are **unlimited on all plans**.

---

## 13. Privacy & Safety

- **OAuth only** — we use Google's secure OAuth flow. We never see or store your password.
- **No email content stored** — all operations are performed live via the Gmail API.
- **Trash, not permanent delete** — all delete actions move emails to Gmail Trash first. Emails stay there for 30 days.
- **Minimum permissions** — we only request Gmail read and modify scopes.
- **GDPR-friendly** — your data is yours.

---

## 14. FAQ

**Q: Will deleting emails here permanently erase them?**
No. All delete actions move emails to your Gmail Trash. They stay there for 30 days and can be manually restored from Gmail.

**Q: Why does the Trash All button only appear after buffering completes?**
The app deliberately loads all matching emails first so you see the exact count before confirming. This prevents accidental deletions and gives you full visibility.

**Q: Can I undo a bulk delete?**
Not from within the app. Go to Gmail → Trash and restore individual emails before they expire (30 days).

**Q: What counts toward the 500 email/month limit on the Free plan?**
Each email moved to Trash counts as 1. Archiving and marking as read are unlimited on all plans.

**Q: Is it safe to grant Gmail permissions?**
Yes. We use the official Google OAuth flow and only request the permissions needed to read and manage your emails.

**Q: The buffering indicator has been showing for a long time. Is something wrong?**
No — if you have tens of thousands of emails matching your filter, buffering can take 1–2 minutes. The Trash All button will appear automatically once complete.

**Q: Can I use the app on mobile?**
Yes. On mobile, tap the ☰ hamburger icon in the top-left to open the filter sidebar.

---

*© 2026 Swift Mail — Your emails, your privacy.*
