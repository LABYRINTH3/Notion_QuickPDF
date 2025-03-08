// 지정한 시간(ms) 동안 기다리는 Promise 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 특정 선택자에 해당하는 요소가 나타날 때까지 대기하는 함수 (최대 타임아웃: 5초)
const waitForElement = async (selector, timeout = 5000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await wait(100);
  }
  throw new Error(`요소를 찾지 못했습니다: ${selector}`);
};

const clickElement = async (selector) => {
  try {
    const el = await waitForElement(selector);
    el.click();
    console.log(`Clicked element: ${selector}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Notion PDF 내보내기 자동화 함수
const exportPdfProcess = async () => {
  try {
    // 1. 더보기 버튼 클릭 (클래스명으로 예시)
    await clickElement('.notion-topbar-more-button');
    await wait(200); // 애니메이션 고려

    // 2. 내보내기 옵션 클릭 (옵션 텍스트 "내보내기"를 포함하는 요소 선택)
    const exportOption = Array.from(document.querySelectorAll('div[role="option"]'))
      .find(el => el.textContent.trim().includes("내보내기"));
    if (exportOption) {
      exportOption.click();
      console.log("내보내기 옵션 클릭");
    } else {
      throw new Error("내보내기 옵션을 찾지 못했습니다");
    }
    await wait(200);

    // 3. 내보내기 형식에서 PDF 선택 (PDF 텍스트를 포함하는 버튼 클릭)
    const pdfButton = Array.from(document.querySelectorAll('div[role="button"]'))
      .find(el => el.textContent.trim().startsWith("PDF"));
    if (pdfButton) {
      pdfButton.click();
      console.log("PDF 버튼 클릭");
    } else {
      throw new Error("PDF 버튼을 찾지 못했습니다");
    }
    await wait(200);

    // 3.5. "크기 비율" 입력란에 80 입력
    // 주어진 HTML 구조의 특징을 활용하여 해당 input 요소를 선택합니다.
    // (div의 스타일에 width: 60px; padding: 4px 10px; 가 포함된 요소 내부의 input[type="text"] 선택)
    const ratioInputSelector = 'div[style*="width: 60px"][style*="padding: 4px 10px;"] input[type="text"]';
    const ratioInput = await waitForElement(ratioInputSelector);
    if (ratioInput) {
      ratioInput.value = "80";
      ratioInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("크기 비율 입력란에 80을 입력했습니다.");
    } else {
      throw new Error("크기 비율 input을 찾지 못했습니다");
    }
    await wait(500);

    // 4. 최종 내보내기 버튼 클릭 (팝업 내의 내보내기 버튼)
    const finalExportButton = Array.from(document.querySelectorAll('div[role="button"]'))
      .find(el => el.textContent.trim() === "내보내기");
    if (finalExportButton) {
      finalExportButton.click();
      console.log("최종 내보내기 버튼 클릭");
    } else {
      throw new Error("최종 내보내기 버튼을 찾지 못했습니다");
    }
  } catch (error) {
    console.error("PDF 내보내기 과정 중 에러:", error);
  }
};

// 팝업으로부터 메시지 수신 시 실행
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "exportPdf") {
    exportPdfProcess();
    sendResponse({ status: "시작됨" });
  }
});
