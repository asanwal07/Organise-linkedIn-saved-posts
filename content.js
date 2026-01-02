console.log("[LinkedIn Extractor] Content script loaded");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Simple tag inference for demonstration
function inferTags(text) {
    const tags = [];
    if (/javascript|js|react|frontend/i.test(text)) tags.push("frontend");
    if (/java|spring|backend/i.test(text)) tags.push("backend");
    if (/interview|question/i.test(text)) tags.push("interview");
    if (/hiring|opening|apply/i.test(text)) tags.push("job");
    if (/dsa|algorithm|leetcode/i.test(text)) tags.push("dsa");
    return tags;
}

// Scroll and extract posts
async function extractSavedPosts(limit = 50) {
    let extractedPosts = 0;
    const results = [];

    console.log("[LinkedIn Extractor] Starting extraction...");

    while (extractedPosts < limit) {
        // 1️⃣ Grab all currently loaded posts
        const posts = document.querySelectorAll(
            "div.entity-result__content-container"
        );

        for (const post of posts) {
            if (post.dataset.extracted) continue;
            post.dataset.extracted = "true";

            // Expand "See more"
            const seeMore = post.querySelector(
                'button[aria-label^="See more"]'
            );
            if (seeMore) {
                seeMore.click();
                await sleep(300 + Math.random() * 200);
            }

            // Extract post text
            const textEl = post.querySelector(
                "p.entity-result__content-summary"
            );
            const text = textEl?.innerText.trim() || "";
            if (!text) continue;

            // Extract author & profile
            const authorAnchor = post.querySelector('a[href*="/in/"]');
            const author = authorAnchor?.innerText.trim() || "";
            const profileUrl = authorAnchor?.href || "";

            // ✅ Post URL (NO dropdown click)
            let postUrl = "";
            const postLinkAnchor = post.querySelector(
                'a[href*="/feed/update"], a[href*="/posts/"], a[href*="/activity"]'
            );

            if (postLinkAnchor) {
                postUrl = postLinkAnchor.href.startsWith("http")
                    ? postLinkAnchor.href
                    : `https://www.linkedin.com${postLinkAnchor.getAttribute(
                          "href"
                      )}`;
            }

            results.push({
                text,
                author,
                profileUrl,
                postUrl,
                tags: inferTags(text),
            });

            extractedPosts++;
            console.log(
                `[LinkedIn Extractor] Extracted ${extractedPosts}: ${author}`
            );

            if (extractedPosts >= limit) break;
            await sleep(200 + Math.random() * 200); // small delay per post
        }

        // 2️⃣ Scroll container a bit
        const container = document.querySelector(
            "div.scaffold-finite-scroll__content"
        );
        if (container) container.scrollBy(0, 300);
        await sleep(500);

        // 3️⃣ Click "Show more results" button if present
        const showMoreBtn = document.querySelector(
            "button.scaffold-finite-scroll__load-button"
        );
        if (showMoreBtn) {
            showMoreBtn.click();
            console.log('[LinkedIn Extractor] Clicked "Show more results"');
            await sleep(1500 + Math.random() * 1000); // wait for new posts
        } else {
            // If no button, small pause
            await sleep(1000);
        }
    }

    console.log(
        "[LinkedIn Extractor] Extraction completed. Total posts:",
        results.length
    );
    downloadJSON(results);
}

// Download JSON in chunks of 10 posts
function downloadJSON(data) {
    const chunks = [];
    for (let i = 0; i < data.length; i += 10) {
        chunks.push(data.slice(i, i + 10));
    }

    const payload = {
        meta: {
            totalExtracted: data.length,
            chunkSize: 10,
            extractedAt: new Date().toISOString(),
            source: "linkedin-saved-posts",
        },
        chunks,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-saved-posts.json";
    a.click();
    URL.revokeObjectURL(url);

    console.log("[LinkedIn Extractor] JSON download complete!");
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "START_EXTRACTION") {
        const limit = msg.limit || 50;
        extractSavedPosts(limit);
    }
});
