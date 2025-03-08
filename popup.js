document.getElementById("exportPdf").addEventListener("click", () => {
    // 현재 활성 탭에 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "exportPdf" });
    });
  });
  