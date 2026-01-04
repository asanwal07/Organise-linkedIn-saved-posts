# LinkedIn Saved Posts Extractor

A Chrome Extension that automatically extracts LinkedIn **saved posts**, handling infinite scrolling, dynamic DOM updates, and the **“Show more results”** button. The script collects post content and post URLs without using Node.js or any backend.

---

## 🚀 Features

-   Automatically extracts LinkedIn saved posts
-   Handles infinite scrolling and lazy-loaded posts
-   Detects and clicks the **“Show more results”** button
-   Extracts:
    -   Post text/content
    -   Post URL
-   Pure JavaScript + Chrome Extension
-   No Node.js
-   No `node_modules`
-   No backend required

---

## 🛠 Tech Stack

-   JavaScript
-   Chrome Extension APIs
-   DOM Manipulation

---

## 📂 Project Structure

linkedin-saved-post-extractor/
│
├── manifest.json <br>
├── content.js <br>
├── popup.html <br>
├── popup.js <br>
└── README.md

---

## ⚙️ Installation

1. Clone or download this repository
2. Open **Google Chrome**
3. Navigate to: Extensions
4. Enable **Developer Mode** (top-right corner)
5. Click **Load unpacked**
6. Select the project folder

The extension will now appear in your Chrome toolbar.

---

## ▶️ How to Use

1. Open LinkedIn and go to **Saved Posts**
2. Click the Chrome extension icon
3. Start the extraction process
4. The script will:

-   Scroll the page automatically
-   Click **“Show more results”** when LinkedIn stops auto-loading posts
-   Extract posts until the required count is reached

5. Extracted data is stored in structured JSON format

---

## 📄 Sample Output

```json
[
    {
        "postText": "Excited to share my latest project...",
        "postUrl": "https://www.linkedin.com/posts/abcd1234"
    },
    {
        "postText": "Great insights on frontend performance optimization",
        "postUrl": "https://www.linkedin.com/posts/efgh5678"
    }
]
```

---

## 🧠 How It Works

Uses MutationObserver to detect newly added posts

Programmatically scrolls the page

Detects and clicks the “Show more results” button when present

Dynamically extracts content from the DOM

Avoids hardcoded delays by waiting for DOM changes

---

## ⚠️ Important Notes

LinkedIn frequently changes its DOM structure

Selectors may need updates if LinkedIn UI changes

Extraction speed depends on network and LinkedIn load behavior

---

## 🔒 Disclaimer

This project is for educational and personal use only.

It is not affiliated with, endorsed by, or connected to LinkedIn.
Users are responsible for complying with LinkedIn’s Terms of Service.

---

## 💡 Future Enhancements

Export data as CSV or downloadable JSON

UI to configure number of posts to extract

Option to unsave posts after extraction

Better progress indicator in popup UI

---

👤 Author

## Akshit Sanwal
