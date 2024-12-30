const start = document.getElementById("start");
const form = document.getElementById("form");

function showCurrentTime() {
  var currentDate = new Date();

  // 시, 분, 초를 가져오기
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  // 시, 분, 초를 두 자리 숫자로 표시
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  // 현재 시간을 hh:mm:ss 형태로 표시
  var currentTime = hours + ":" + minutes + ":" + seconds;

  const timeEl = document.getElementById("time");
  timeEl.innerText = currentTime;

  // 특정 시간에 도달하면 alert 보여주기
  if (currentTime === "10:00:00") {
    start.click();
  }

  // 1초(1000밀리세컨드)마다 함수를 호출하여 계속해서 시간을 업데이트
  setTimeout(showCurrentTime, 10);
}

window.onload = () => {
  showCurrentTime();
};

chrome.storage.sync.get(null, (values) => {
  Object.entries(values).forEach(([name, value]) => {
    console.log(name, value, form[name]);

    if (form[name]) {
      form[name].value = value;
    }
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

          const url = `https://online.igangdong.or.kr/rent/list.do?SITE_CD=${SITE_CD}&PART_CD=${PART_CD}&PLACE_CD=${PLACE_CD}&F_Year=${F_Year}&F_Month=${F_Month}&d=m&flag=Next&agree1=Y`;

          window.location.href = url;
        });
      } catch (err) {
        console.error(err);
      }
    },
  });
});
