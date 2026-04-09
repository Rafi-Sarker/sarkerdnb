// ===== CONFIG =====
const BASE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkLvYO7zFb0hAHx-c1Y_oIjFd9XrLVc3PNbO3SFkcDZB0c0cN1rSufukzRr2kqA1nacfBpNOw9vPuX/pub";

const SHEETS = {
  Investors: `${BASE}?gid=1569939234&single=true&output=csv`,
  Investments: `${BASE}?gid=1466113161&single=true&output=csv`,
  UserNotices: `${BASE}?gid=1179149768&single=true&output=csv`,
  GlobalNotices: `${BASE}?gid=1569939234&single=true&output=csv`
};

// ===== GLOBAL DATA =====
let investors = [];
let investments = [];
let userNotices = [];
let globalNotices = [];

let currentUser = null;
let isDataLoaded = false;

// ===== BETTER CSV PARSER =====
function parseCSV(text) {
  const rows = text.trim().split("\n").map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
  const headers = rows.shift().map(h => h.trim());

  return rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = r[i]?.replace(/(^"|"$)/g, "").trim() || "";
    });
    return obj;
  });
}

// ===== LOAD DATA =====
async function initSheets() {
  console.log("⏳ Loading Sheets...");

  try {
    for (const key in SHEETS) {
      const res = await fetch(SHEETS[key]);
      if (!res.ok) throw new Error(`Failed: ${key}`);

      const text = await res.text();
      const data = parseCSV(text);

      if (key === "Investors") investors = data;
      if (key === "Investments") investments = data;
      if (key === "UserNotices") userNotices = data;
      if (key === "GlobalNotices") globalNotices = data;

      console.log(`✅ ${key}`, data);
    }

    isDataLoaded = true;
    console.log("✅ ALL DATA LOADED");

  } catch (err) {
    console.error("❌ ERROR:", err);
    alert("Sheet loading failed");
  }
}

// ===== LOGIN =====
function waitForDataAndLogin() {
  if (!isDataLoaded) {
    setTimeout(waitForDataAndLogin, 500);
  } else login();
}

function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  currentUser = investors.find(i => i.username === u && i.password === p);

  if (!currentUser) return alert("❌ Wrong login");

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("dashboardPage").style.display = "block";

  loadDashboard();
}

// ===== DASHBOARD =====
function loadDashboard() {

  loadNotices();

  const userInvestments = investments.filter(i => i.username === currentUser.username);

  const grouped = {};

  userInvestments.forEach(i => {
    if (!grouped[i.project]) {
      grouped[i.project] = {
        total: Number(i.total) || 0,
        invested: []
      };
    }

    grouped[i.project].invested.push({
      amount: Number(i.amount) || 0,
      date: i.date || "-"
    });
  });

  let totalValue = 0;
  let totalInvested = 0;
  let projectHTML = "";
  let historyHTML = "";

  Object.keys(grouped).forEach(project => {

    const inv = grouped[project];
    const investedSum = inv.invested.reduce((s, i) => s + i.amount, 0);
    const progress = inv.total > 0 ? ((investedSum / inv.total) * 100).toFixed(2) : 0;

    totalValue += inv.total;
    totalInvested += investedSum;

    projectHTML += `
      <div class="project-card">
        <div class="project-content">
          <h3>${project}</h3>
          <p><b>Total Value:</b> ৳${inv.total}</p>
          <p><b>Invested:</b> ৳${investedSum}</p>
          <div class="progress-bar">
            <div class="progress" style="width:${progress}%">${progress}%</div>
          </div>
        </div>
      </div>
    `;

    inv.invested.forEach(i => {
      historyHTML += `<tr>
        <td>${project}</td>
        <td>৳${i.amount}</td>
        <td>${i.date}</td>
      </tr>`;
    });
  });

  document.getElementById("user").innerText = currentUser.name || currentUser.username;
  document.getElementById("investment").innerText = "৳" + totalValue;
  document.getElementById("invested").innerText = "৳" + totalInvested;
  document.getElementById("totalProjects").innerText = Object.keys(grouped).length;
  document.getElementById("projectList").innerHTML = projectHTML;
  document.getElementById("historyTable").innerHTML = historyHTML;
}

// ===== NOTICES =====
function loadNotices() {

  let notices = [...globalNotices];

  let userSpecific = userNotices.filter(n => n.username === currentUser.username);
  notices = notices.concat(userSpecific);

  const today = new Date();

  notices = notices.filter(n => !n.expiry || new Date(n.expiry) >= today);

  notices.sort((a, b) =>
    (String(b.pin).toLowerCase() === "true") -
    (String(a.pin).toLowerCase() === "true")
  );

  window.noticeData = notices;

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  let html = "";
  let unreadCount = 0;

  notices.forEach((n, i) => {

    const isRead = read.includes(n.title);
    if (!isRead) unreadCount++;

    html += `
      <div class="notice-item ${!isRead ? "unread" : ""}" onclick="openNotice(${i})">
        <h4>${n.title} ${String(n.pin).toLowerCase() === "true" ? "📌" : ""}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  document.getElementById("noticeList").innerHTML = html;

  const badge = document.getElementById("noticeCount");
  if (badge) badge.innerText = unreadCount;
}

// ===== MODAL =====
function openNotice(i) {
  const n = window.noticeData[i];

  document.getElementById("noticeTitle").innerText = n.title;
  document.getElementById("noticeMessage").innerText = n.message;
  document.getElementById("noticeModal").style.display = "flex";

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  if (!read.includes(n.title)) {
    read.push(n.title);
    localStorage.setItem("readNotices", JSON.stringify(read));
  }

  loadNotices();
}

function closeNotice() {
  document.getElementById("noticeModal").style.display = "none";
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initSheets();
});
