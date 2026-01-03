console.log("[LinkedIn Extractor] Content script loaded");

/* =========================
   🔹 GLOBAL EXTRACTION STATE
   ========================= */
let extractionState = {
    isRunning: false,
    extracted: 0,
    limit: 0,
};

/* =========================
   🔹 UTILS
   ========================= */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function cleanPostText(text) {
    return text
        .replace(/\n{2,}/g, "\n")
        .replace(/\s+\n/g, "\n")
        .replace(/\n\s+/g, "\n")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function inferTags(text) {
    const tags = [];
    if (/javascript|js|react|frontend/i.test(text)) tags.push("frontend");
    if (/java|spring|backend/i.test(text)) tags.push("backend");
    if (/interview|question/i.test(text)) tags.push("interview");
    if (/hiring|opening|apply/i.test(text)) tags.push("job");
    if (/dsa|algorithm|leetcode/i.test(text)) tags.push("dsa");
    return tags;
}

/* =========================
   🔹 MAIN EXTRACTION
   ========================= */
async function extractSavedPosts(limit = 20) {
    let extractedPosts = 0;
    const results = [];

    console.log("[LinkedIn Extractor] Starting extraction...");

    while (extractedPosts < limit) {
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
                await sleep(300);
            }

            // Text
            const textEl = post.querySelector(
                "p.entity-result__content-summary"
            );
            const rawText = textEl?.innerText || "";
            const text = cleanPostText(rawText);
            if (!text) continue;

            // Author
            const authorAnchor = post.querySelector('a[href*="/in/"]');
            const author = authorAnchor?.innerText.trim() || "";
            const profileUrl = authorAnchor?.href || "";

            // Post URL
            let postUrl = "";
            const postLinkAnchor =
                post.querySelector('a[href*="/feed/update"]') ||
                post.querySelector('a[href*="/posts/"]') ||
                post.querySelector('a[href*="/activity"]');

            if (postLinkAnchor?.href) {
                postUrl = postLinkAnchor.href.split("?")[0];
            }

            results.push({
                text,
                author,
                profileUrl,
                postUrl,
                tags: inferTags(text),
            });

            extractedPosts++;

            /* =========================
         🔹 STATE + PROGRESS UPDATE
         ========================= */
            extractionState.extracted = extractedPosts;

            chrome.runtime.sendMessage({
                type: "PROGRESS_UPDATE",
                state: extractionState,
            });

            console.log(
                `[LinkedIn Extractor] Extracted ${extractedPosts}: ${author}`
            );

            if (extractedPosts >= limit) break;
            await sleep(200);
        }

        // Scroll
        const container = document.querySelector(
            "div.scaffold-finite-scroll__content"
        );
        if (container) container.scrollBy(0, 300);

        await sleep(800);

        const showMoreBtn = document.querySelector(
            "button.scaffold-finite-scroll__load-button"
        );
        if (showMoreBtn) {
            showMoreBtn.click();
            await sleep(1500);
        }
    }

    console.log(
        "[LinkedIn Extractor] Extraction completed. Total posts:",
        results.length
    );

    downloadJSON(results);

    extractionState.isRunning = false;
}

/* =========================
   🔹 DOWNLOAD (WITH CHUNKS)
   ========================= */
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

/* =========================
   🔹 MESSAGE HANDLING
   ========================= */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "START_EXTRACTION") {
        if (extractionState.isRunning) {
            console.log("[LinkedIn Extractor] Already running");
            return;
        }

        extractionState.isRunning = true;
        extractionState.extracted = 0;
        extractionState.limit = msg.limit || 50;

        extractSavedPosts(extractionState.limit);
    }

    if (msg.action === "GET_STATUS") {
        sendResponse(extractionState);
    }
});
