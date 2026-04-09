// ===== CONFIG =====
// Replace with your published CSV URLs
const SHEETS = {
  Investors: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkLvYO7zFb0hAHx-c1Y_oIjFd9XrLVc3PNbO3SFkcDZB0c0cN1rSufukzRr2kqA1nacfBpNOw9vPuX/pub?gid=0&single=true&output=csv",
  Investments: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkLvYO7zFb0hAHx-c1Y_oIjFd9XrLVc3PNbO3SFkcDZB0c0cN1rSufukzRr2kqA1nacfBpNOw9vPuX/pub?output=csv",
  UserNotices: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkLvYO7zFb0hAHx-c1Y_oIjFd9XrLVc3PNbO3SFkcDZB0c0cN1rSufukzRr2kqA1nacfBpNOw9vPuX/pub?output=csv",
  GlobalNotices: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkLvYO7zFb0hAHx-c1Y_oIjFd9XrLVc3PNbO3SFkcDZB0c0cN1rSufukzRr2kqA1nacfBpNOw9vPuX/pub?output=csv"
};

// ===== GLOBAL DATA =====
let investors = [];
let investments = [];
let userNotices = [];
let globalNotices = [];

let currentUser = null;
let isDataLoaded = false;

// ===== CSV PARSER =====
function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows.shift().split(",").map(h => h.trim());
  return rows.map(r => {
    const values = r.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

// ===== FETCH ALL SHEETS =====
async function initSheets() {
  console.log("⏳ Loading Google Sheets via CSV...");

  try {
    const keys = Object.keys(SHEETS);
    for (const key of keys) {
      const res = await fetch(SHEETS[key]);
      if (!res.ok) throw new Error(`Failed to fetch ${key}`);
      const text = await res.text();
      const data = parseCSV(text);

      switch (key) {
        case "Investors": investors = data; break;
        case "Investments": investments = data; break;
        case "UserNotices": userNotices = data; break;
        case "GlobalNotices": globalNotices = data; break;
      }
      console.log(`✅ ${key} loaded`, data);
    }

    isDataLoaded = true;
    console.log("✅ All sheets loaded successfully");
  } catch (err) {
    console.error("❌ CSV load error:", err);
    alert("Failed to load sheets. Check the CSV links.");
  }
}

// ===== WAIT FOR DATA BEFORE LOGIN =====
function waitForDataAndLogin() {
  if (!isDataLoaded) {
    console.log("⏳ Waiting for data...");
    setTimeout(waitForDataAndLogin, 500);
  } else login();
}

// ===== LOGIN =====
function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  currentUser = investors.find(i => i.username === u && i.password === p);

  if (currentUser) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboardPage").style.display = "block";
    loadDashboard();
  } else {
    alert("❌ Wrong username or password");
  }
}

// ===== DASHBOARD =====
function loadDashboard() {
  loadNotices();

  const userInvestments = investments.filter(i => i.username === currentUser.username);
  const grouped = {};

  userInvestments.forEach(i => {
    if (!grouped[i.project]) grouped[i.project] = { total: Number(i.total) || 0, invested: [] };
    grouped[i.project].invested.push({ amount: Number(i.amount) || 0, date: i.date || "-" });
  });

  let totalValue = 0, totalInvested = 0, projectHTML = "", historyHTML = "";

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
      historyHTML += `<tr><td>${project}</td><td>৳${i.amount}</td><td>${i.date}</td></tr>`;
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
  if (!currentUser) return;

  let notices = [...globalNotices, ...userNotices.filter(n => n.username === currentUser.username)];
  const today = new Date();
  notices = notices.filter(n => !n.expiry || new Date(n.expiry) >= today);

  // Sort pinned first
  notices.sort((a, b) => (String(b.pin).toLowerCase() === "true") - (String(a.pin).toLowerCase() === "true"));

  window.noticeData = notices;
  const read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  let html = "", unreadCount = 0;
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

// ===== NOTICE MODAL =====
function openNotice(i) {
  const n = window.noticeData[i];
  document.getElementById("noticeTitle").innerText = n.title;
  document.getElementById("noticeMessage").innerText = n.message;
  document.getElementById("noticeModal").style.display = "flex";

  const read = JSON.parse(localStorage.getItem("readNotices") || "[]");
  if (!read.includes(n.title)) {
    read.push(n.title);
    localStorage.setItem("readNotices", JSON.stringify(read));
  }
  loadNotices();
}

function closeNotice() {
  document.getElementById("noticeModal").style.display = "none";
}

// ===== LOGOUT =====
function logout() {
  location.reload();
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {
  initSheets();
  const loginBtn = document.querySelector("button[onclick='waitForDataAndLogin()']");
  if (loginBtn) loginBtn.addEventListener("click", waitForDataAndLogin);
});
