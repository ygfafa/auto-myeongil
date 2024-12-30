window.onload = () => {
  const href = window.location.href;

  window.scrollTo(0, document.body.scrollHeight);

  chrome.storage.sync.get(null, async (values) => {
    const { SITE_CD, PART_CD, PLACE_CD, F_Year, F_Month, F_Day, startTime } =
      values;

    /**
     * 날짜 선택 페이지
     */
    if (href.includes("list.do")) {
      console.log("😃 코트 일일이용 신청 페이지 입니다.");
      const funcString = `go_rent("${SITE_CD}", "${PART_CD}", "${PLACE_CD}", "${F_Year}", "${F_Month}", "${F_Day}", "td${F_Day}")`;
      const dateButton = document.createElement("button");
      dateButton.setAttribute("onclick", funcString);
      document.body.appendChild(dateButton);
      dateButton.click();

      const 시간가져오기Form = new FormData();
      시간가져오기Form.append("SITE_CD", SITE_CD);
      시간가져오기Form.append("PART_CD", PART_CD);
      시간가져오기Form.append("PLACE_CD", PLACE_CD);
      시간가져오기Form.append("F_Year", F_Year);
      시간가져오기Form.append("F_Month", F_Month);
      시간가져오기Form.append("F_Day", F_Day);
      시간가져오기Form.append("d", "m");
      시간가져오기Form.append("flag", "Next");
      시간가져오기Form.append("agree1", "Y");

      const 시간목록 = await fetch(
        "https://online.igangdong.or.kr/rent/ajax.do",
        {
          method: "POST",
          body: 시간가져오기Form,
        }
      ).then((res) => res.json());

      console.log("### 시간 목록", 시간목록);

      console.log(
        "🚀 ~ file: content-script.js:43 ~ chrome.storage.sync.get ~ startTime:",
        startTime
      );
      const 선택한시간index = 시간목록.findIndex(
        ({ stime }) => stime === startTime
      );

      if (선택한시간index === -1) {
        alert("해당 날짜에 예약 가능한 시간이 없습니다.");
        return;
      }

      const key = setInterval(() => {
        const checkbox = document.getElementById(선택한시간index);
        const submit = document.querySelector("button.btn_blue");
        if (checkbox) {
          window.clearInterval(key);
          checkbox.click();
          submit.click();

          console.log("...??");
        }
      }, 100);
    }
  });

  /**
   * 신청 폼 페이지
   */
  if (href.includes("detail.do")) {
    if (document.querySelector('input[name="Use_Inwon"]')) {
      document.querySelector('input[name="Use_Inwon"]').value = 4;
      document.querySelector('[data-action="submit"]').click();
    }
  }
};
