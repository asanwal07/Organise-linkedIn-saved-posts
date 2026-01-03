chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url?.includes("linkedin.com")) return;

    chrome.tabs.sendMessage(tab.id, { action: "GET_STATUS" }, (state) => {
        if (!state) return;

        if (state.isRunning) {
            document.getElementById(
                "progress"
            ).innerText = `Extracted ${state.extracted} / ${state.limit}`;

            document.getElementById("start").disabled = true;
            document.getElementById("start").innerText = "Extracting...";
            document.getElementById("start").style.backgroundColor = "gray";
            document.getElementById("start").style.color = "white";
        }
    });
});

document.getElementById("start").addEventListener("click", () => {
    const limit = Number(document.getElementById("limit").value);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        if (!tab?.url || !tab.url.includes("linkedin.com")) {
            alert("Please open LinkedIn Saved Posts page first.");
            return;
        }

        chrome.tabs.sendMessage(tab.id, { action: "GET_STATUS" }, (state) => {
            if (state?.isRunning) {
                alert("Extraction already in progress");
                return;
            }

            document.getElementById("start").disabled = true;
            document.getElementById("start").innerText = "Extracting...";

            chrome.tabs.sendMessage(tab.id, {
                action: "START_EXTRACTION",
                limit,
            });
        });
    });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url?.includes("linkedin.com")) return;

    chrome.tabs.sendMessage(tab.id, { action: "GET_STATUS" }, (state) => {
        if (!state) return;

        if (state.isRunning) {
            document.getElementById(
                "progress"
            ).innerText = `Extracted ${state.extracted} / ${state.limit}`;

            document.getElementById("start").disabled = true;
            document.getElementById("start").innerText = "Extracting...";
        }
    });
});

document.getElementById("start").addEventListener("click", () => {
    const limit = Number(document.getElementById("limit").value);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        if (!tab?.url || !tab.url.includes("linkedin.com")) {
            alert("Please open LinkedIn Saved Posts page first.");
            return;
        }

        chrome.tabs.sendMessage(
            tab.id,
            {
                action: "START_EXTRACTION",
                limit,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Message failed:",
                        chrome.runtime.lastError.message
                    );
                }
            }
        );
    });
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "PROGRESS_UPDATE") {
        const { extracted, limit, isRunning } = msg.state;

        document.getElementById(
            "progress"
        ).innerText = `Extracted ${extracted} / ${limit}`;

        if (!isRunning) {
            const btn = document.getElementById("start");
            btn.disabled = false;
            btn.innerText = "Start Extraction";
        }
    }
});
