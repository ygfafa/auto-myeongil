/**
 * ---------------------------------------------------------------------------------
 * | 팝업 |
 * ---------------------------------------------------------------------------------
 **/

const start = document.getElementById("start");
const form = document.getElementById("form");

chrome.storage.sync.get(null, (values) => {
  Object.entries(values).forEach(([name, value]) => {
    form[name].value = value;
  });
});

form.addEventListener("change", () => {
  const formData = new FormData(form);
  const formProps = Object.fromEntries(formData);

  chrome.storage.sync.set({ ...formProps });
});

start.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: async () => {
      try {
        chrome.storage.sync.get(null, async (storedValues) => {
          const {
            SITE_CD,
            PART_CD,
            PLACE_CD,
            F_Year,
            F_Month,
            F_Day,
            startTime,
          } = storedValues;

          console.log("### 저장된 입력값", storedValues);

          if (
            !SITE_CD ||
            !PART_CD ||
            !PLACE_CD ||
            !F_Year ||
            !F_Month ||
            !F_Day ||
            !startTime
          ) {
            alert("입력값을 확인해주세요.");
            return;
          }

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

          const 선택한시간 = 시간목록.find(({ stime }) => stime === startTime);

          if (!선택한시간) {
            alert("해당 날짜에 예약 가능한 시간이 없습니다.");
            return;
          }

          const {
            Night_fee,
            stime,
            Limit_Cnt,
            Use_Limit,
            etime,
            oneday_use_cnt,
            month_use_cnt,
            set_fee,
            Limit_Month,
          } = 선택한시간;

          const form = document.createElement("form");
          form.action = "https://online.igangdong.or.kr/rent/detail.do";
          form.method = "POST";
          const values = [
            { name: "SITE_CD", value: SITE_CD },
            { name: "PART_CD", value: PART_CD },
            { name: "PLACE_CD", value: PLACE_CD },
            { name: "F_Year", value: F_Year },
            { name: "F_Month", value: F_Month },
            { name: "F_Day", value: F_Day },
            { name: "R_FEE", value: Number(set_fee) },
            { name: "N_FEE", value: Number(Night_fee) },
            { name: "R_USEPLAN", value: `${stime | etime}` },
            { name: "Rent_info", value: `${stime}~${etime} (총2시간)` },
            { name: "Use_Limit", value: Use_Limit },
            { name: "Limit_Month", value: Limit_Month },
            { name: "Limit_Cnt", value: Limit_Cnt },
            { name: "month_use_cnt", value: month_use_cnt },
            { name: "oneday_use_cnt", value: oneday_use_cnt },
            {
              name: "rent_chk[]",
              value: `${stime}|${etime}|N|${set_fee}|${Night_fee}`,
            },
          ];

          console.log("### 최종 SUBMIT 값", values);

          values.forEach((value) => {
            const input = document.createElement("input");
            input.type = "text";
            input.name = value.name;
            input.value = value.value;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        });
      } catch (err) {
        console.error(err);
      }
    },
  });
});

// function startAutoScript() {
//   chrome.storage.sync.get("url", ({ url }) => {
//     if (!url) {
//       alert("옵션에서 코트를 먼저 설정해주세요.");
//       return;
//     }
//     window.location.href = url;
//   });
// }

// console.log(axios);

// 마지막 요청
// SITE_CD: 10019
// PART_CD: 1001
// PLACE_CD: 1001
// F_Year: 2023
// F_Month: 5
// F_Day: 30
// R_FEE: 8800
// N_FEE: 0
// Rent_info: 08:00~10:00 (총2시간)
// R_USEPLAN: 08:00|10:00
// DaePyo_Name: 박종혁
// tel:
// Group_Name: 박종혁
// mobile: 01033280917
// Ssn1: 900917
// Ssn2: 1
// fax:
// zipCode: 05264
// address: 서울 강동구 상암로11길 4 (암사동)
// subAddress: 선사
// Rent_Price: 8,800
// Night_Price: 0
// Use_Name: 테니스
// Use_Inwon: 2
// Use_Object: 연습
// Installation:
// g-recaptcha-response: 03AL8dmw88k0hFqAlEBPYPbnI-tsrJ_RoJR5YJo8hZT7Rh-sIwGBe2LVHZ1PVQvZKe2LTJJ37-9NUiWAh4Eic190qQcyLDqUIIxPGlbP8Ty4XfvEdqAre0ygX4nDdd675Ee7dbmSULYozZ0IJ6jHB7NLJLixb3uXUgiqM2I_rAX7NziXPhYnYtlqebo7UyRNtJIU54s-WhL34eplnHrdurt3yNi6YhOE-Pm2ftCKFyGGrCRBWgEEA_8ffULDo3F7QaQyddwjhSvKKNCvm-D_IcRER_vWfPA9XWFjHyWdu992A573LMPtOPpR79EsNhN9WKd-RPyJwVWXQR6g1VZa21LbQmw9l0p9S1l4jDGC90eJCCFoAuKSNMbADGIIXT67cEiNrTxtaoNGmj_BYKAQfAY0WgFitiMEISmyYObzlR3VBxpATxmgpuDf8hOcfFj14Qqw5lmQUobLAKBFOn1VCLRmxXmb_M7mNDUhvTV50QKF9lIAjqd639NAKQJCiOaShFqFTMB3iZsOCuDuB4CL8l_ZfyHm_5mwplWHzZV9OrosRyBbffm-NB4zJCvvEopKO6PO7Dawg966Wi
