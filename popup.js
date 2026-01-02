document.getElementById("start").addEventListener("click", () => {
    const limit = Number(document.getElementById("limit").value);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "START_EXTRACTION",
            limit,
        });
    });
});
