// 2026년 6월 달력 기준 설정 (1일이 월요일)
const YEAR = 2026;
const MONTH = 6; // 6월
const START_DAY_OF_WEEK = 1; // 2026년 6월 1일은 월요일 (0:일, 1:월, 2:화...)
const DAYS_IN_MONTH = 30;    // 6월은 30일까지 있음

// 예약 데이터 구조 초기화 또는 불러오기 (key: "YYYY-MM-DD")
let appointments = JSON.parse(localStorage.getItem('consult_appointments')) || {};

document.addEventListener("DOMContentLoaded", () => {
    initStudentSelect();
    renderCalendar();
});

// 1~25번 학생 선택지 생성
function initStudentSelect() {
    const select = document.getElementById("student-num");
    for (let i = 1; i <= 25; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.innerText = `${i}번 학생`;
        opt.disabled = isStudentAlreadyBooked(i); // 이미 예약한 학생은 선택 불가 처리(선택사항)
        select.appendChild(opt);
    }
}

// 특정 학생이 이미 예약했는지 확인하는 함수
function isStudentAlreadyBooked(studentNum) {
    for (let date in appointments) {
        if (appointments[date].am === String(studentNum) || appointments[date].pm === String(studentNum)) {
            return true;
        }
    }
    return false;
}

// 달력 그리기
function renderCalendar() {
    const container = document.getElementById("calendar-days");
    container.innerHTML = "";

    // 1일 시작 전 빈칸 채우기
    for (let i = 0; i < START_DAY_OF_WEEK; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-cell", "empty-cell");
        container.appendChild(emptyCell);
    }

    // 1일부터 30일까지 날짜 칸 만들기
    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
        const dateStr = `${YEAR}-0${MONTH}-${day < 10 ? '0' + day : day}`;
        const dayData = appointments[dateStr] || { am: null, pm: null };

        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");

        // 날짜 숫자 표시
        const dateNum = document.createElement("div");
        dateNum.classList.add("date-num");
        dateNum.innerText = day;
        cell.appendChild(dateNum);

        // 아침 시간대 (am) 표시
        const amSlot = document.createElement("div");
        amSlot.classList.add("time-slot");
        if (dayData.am) {
            amSlot.classList.add("booked");
            amSlot.innerText = `☀️ ${dayData.am}번 완료`;
        } else {
            amSlot.classList.add("empty");
            amSlot.innerText = "☀️ 아침 비어있음";
        }
        cell.appendChild(amSlot);

        // 점심 시간대 (pm) 표시
        const pmSlot = document.createElement("div");
        pmSlot.classList.add("time-slot");
        if (dayData.pm) {
            pmSlot.classList.add("booked");
            pmSlot.innerText = `🍴 ${dayData.pm}번 완료`;
        } else {
            pmSlot.classList.add("empty");
            pmSlot.innerText = "🍴 점심 비어있음";
        }
        cell.appendChild(pmSlot);

        container.appendChild(cell);
    }
}

// 예약 버튼 클릭 이벤트
function bookAppointment() {
    const studentNum = document.getElementById("student-num").value;
    const dateInput = document.getElementById("consult-date").value;
    const timeInput = document.getElementById("consult-time").value;

    // 유효성 검사
    if (!studentNum) return alert("학생 번호를 선택해 주세요.");
    if (!dateInput) return alert("날짜를 선택해 주세요.");
    if (!timeInput) return alert("시간대를 선택해 주세요.");

    // 입력받은 날짜가 6월인지 검증
    if (!dateInput.startsWith(`${YEAR}-0${MONTH}`)) {
        return alert("6월 중의 날짜만 선택 가능합니다.");
    }

    // 해당 날짜에 예약 데이터 공간 확보
    if (!appointments[dateInput]) {
        appointments[dateInput] = { am: null, pm: null };
    }

    // 중복 예약 검사 (해당 시간대에 이미 예약이 있는지)
    if (appointments[dateInput][timeInput]) {
        return alert("⚠️ 해당 시간은 이미 다른 친구가 예약했습니다! 다른 시간을 골라주세요.");
    }

    // 한 학생이 중복으로 여러 날짜를 예약하는 것 방지
    if (isStudentAlreadyBooked(studentNum)) {
        return alert("⚠️ 이미 예약을 완료한 학생입니다. (1인 1회만 가능)");
    }

    // 예약 확정 및 저장
    appointments[dateInput][timeInput] = studentNum;
    localStorage.setItem('consult_appointments', JSON.stringify(appointments));

    alert(`🎉 ${studentNum}번 학생의 예약이 성공적으로 완료되었습니다!`);
    
    // UI 업데이트
    renderCalendar();
    
    // 폼 초기화 및 다음 학생을 위해 방금 예약한 번호 비활성화 비트 갱신
    document.getElementById("student-num").innerHTML = '<option value="">-- 번호 선택 --</option>';
    initStudentSelect();
    document.getElementById("consult-date").value = "";
    document.getElementById("consult-time").value = "";
}
