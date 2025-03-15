// 1) Wait helper
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 2) Wait for an element to appear in the DOM (with timeout).
async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await wait(100);
  }
  throw new Error(`Timed out waiting for: ${selector}`);
}

// 3) Helper to do the actual click after waiting
async function clickElement(selector) {
  const el = await waitForElement(selector);
  el.click();
  return el;
}

async function exportPdfProcess() {
  try {
    // 1. Click "더보기" (the triple-dot in top-right)
    await clickElement('.notion-topbar-more-button');
    await wait(200);

    // 2. Click "내보내기" in that menu
    //    If your original code uses `role="option"` with text "내보내기" then:
    const exportOption = Array.from(document.querySelectorAll('div[role="option"]'))
      .find(el => el.textContent.trim().includes("내보내기"));
    if (!exportOption) {
      throw new Error("Cannot find '내보내기' option in the topbar menu");
    }
    exportOption.click();
    await wait(300);

    // 3. Now the "내보내기" dialog should appear. We must set the format to PDF.
    //    First, click the format dropdown (which might say “Markdown & CSV,” “HTML,” or “PDF”)
    //    In your HTML snippet, that button looks like:
    //         <div role="button" ...>Markdown & CSV<svg ...></div>
    //    So we can find it by searching the dialog for a role="button" that likely has “Markdown” or “HTML” or “PDF”.
    const formatButton = Array.from(
      document.querySelectorAll('.notion-dialog [role="button"]')
    ).find(el => {
      const txt = el.textContent.trim();
      return (
        // It's the row that shows which format is currently selected:
        txt === "Markdown & CSV" ||
        txt === "HTML" ||
        txt === "PDF"
      );
    });
    if (!formatButton) {
      throw new Error("Could not find the export-format dropdown button.");
    }
    formatButton.click();
    await wait(300);

    // 4. In the popup that appears, select "PDF".
    //    This is typically a <div role="menuitem">PDF</div>.
    const pdfMenuItem = Array.from(
      document.querySelectorAll('div[role="menuitem"]')
    ).find(el => el.textContent.trim() === "PDF");
    if (!pdfMenuItem) {
      throw new Error("Could not find 'PDF' in the export format menu.");
    }
    pdfMenuItem.click();
    await wait(200);

    // 4.5) If Notion shows a “크기 비율” input for PDF, select/enter ratio
    //      (some Notion “export as PDF” flows do not show it, so optional)
    //      Example if your old code used:
    
    const ratioInputSelector = 'div[style*="width: 60px"][style*="padding: 4px 10px;"] input[type="text"]';
    const ratioInput = document.querySelector(ratioInputSelector);
    if (ratioInput) {
      ratioInput.value = "80";
      ratioInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("Set ratio to 80.");
    }
    // await wait(700);

    // 5. Finally, click the “내보내기” button at the bottom of the dialog
    const finalExportBtn = Array.from(
      document.querySelectorAll('.notion-dialog [role="button"]')
    ).find(el => el.textContent.trim() === "내보내기");
    if (!finalExportBtn) {
      throw new Error('Could not find the final "내보내기" button.');
    }
    finalExportBtn.click();

    console.log("Export to PDF done!");
  } catch (err) {
    console.error("PDF export failed:", err);
  }
}

// Listen for a Chrome extension message, or just call exportPdfProcess():
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "exportPdf") {
    exportPdfProcess();
    sendResponse({ status: "started" });
  }
});
