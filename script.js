// ===== CONFIG =====
const SHEET_ID = "1C5_z0VJIxW-KlD1MppZPogrvI1tpHrowZIpPSG6Lw5s";

// ===== GLOBAL DATA =====
let investors = [];
let investments = [];
let userNotices = [];
let globalNotices = [];

let currentUser = null;
let isDataLoaded = false;

// ===== INIT GOOGLE SHEET =====
function initSheet() {
  console.log("⏳ Loading Google Sheet...");

  Tabletop.init({
    key: SHEET_ID,
    simpleSheet: false,
    callback: function (data) {
      console.log("📦 FULL DATA:", data);

      investors = data.Investors?.elements || [];
      investments = data.Investments?.elements || [];
      userNotices = data.UserNotices?.elements || [];
      globalNotices = data.GlobalNotices?.elements || [];

      isDataLoaded = true;
      console.log("✅ Data Loaded Successfully");
    },
    error: function (err) {
      console.error("❌ Tabletop Error:", err);
      alert("Failed to load sheet data. Check the Sheet ID and publish status.");
    }
  });
}

// ===== WAIT FOR DATA BEFORE LOGIN =====
function waitForDataAndLogin() {
  if (!isDataLoaded) {
    console.log("⏳ Waiting for data...");
    setTimeout(waitForDataAndLogin, 500); // Retry after 500ms
  } else {
    login();
  }
}

// ===== LOGIN =====
function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();

  currentUser = investors.find(i =>
    i.username === u && i.password === p
  );

  if (currentUser) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    loadDashboard();
  } else {
    alert("❌ Wrong username or password");
  }
}

// ===== DASHBOARD =====
function loadDashboard() {
  loadNotices();

  const userInvestments = investments.filter(i =>
    i.username === currentUser.username
  );

  const grouped = {};

  // Group by project
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
      historyHTML += `
        <tr>
          <td>${project}</td>
          <td>৳${i.amount}</td>
          <td>${i.date}</td>
        </tr>
      `;
    });
  });

  document.getElementById('user').innerText = currentUser.name || currentUser.username;
  document.getElementById('investment').innerText = '৳' + totalValue;
  document.getElementById('invested').innerText = '৳' + totalInvested;
  document.getElementById('totalProjects').innerText = Object.keys(grouped).length;
  document.getElementById('projectList').innerHTML = projectHTML;
  document.getElementById('historyTable').innerHTML = historyHTML;
}

// ===== NOTICES =====
function loadNotices() {
  if (!currentUser) return;

  let notices = [...globalNotices];
  const userSpecific = userNotices.filter(n =>
    n.username === currentUser.username
  );

  notices = notices.concat(userSpecific);

  const today = new Date();
  notices = notices.filter(n =>
    !n.expiry || new Date(n.expiry) >= today
  );

  // Sort pinned first
  notices.sort((a, b) =>
    (String(b.pin).toLowerCase() === "true") -
    (String(a.pin).toLowerCase() === "true")
  );

  window.noticeData = notices;

  const read = JSON.parse(localStorage.getItem("readNotices") || "[]");
  let html = "";
  let unreadCount = 0;

  notices.forEach((n, i) => {
    const isRead = read.includes(n.title);
    if (!isRead) unreadCount++;
    html += `
      <div class="notice-item ${!isRead ? 'unread' : ''}" onclick="openNotice(${i})">
        <h4>${n.title} ${String(n.pin).toLowerCase() === "true" ? "📌" : ""}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  if (notices.length === 0) html = "<p style='font-size:13px;color:#777;'>No updates</p>";

  document.getElementById('noticeList').innerHTML = html;

  const badge = document.getElementById('noticeCount');
  if (badge) badge.innerText = unreadCount;
}

// ===== NOTICE MODAL =====
function openNotice(i) {
  const n = window.noticeData[i];

  document.getElementById('noticeTitle').innerText = n.title;
  document.getElementById('noticeMessage').innerText = n.message;
  document.getElementById('noticeModal').style.display = 'flex';

  const read = JSON.parse(localStorage.getItem("readNotices") || "[]");
  if (!read.includes(n.title)) {
    read.push(n.title);
    localStorage.setItem("readNotices", JSON.stringify(read));
  }

  loadNotices();
}

function closeNotice() {
  document.getElementById('noticeModal').style.display = 'none';
}

// ===== LOGOUT =====
function logout() {
  location.reload();
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {
  initSheet();

  const loginBtn = document.querySelector("button[onclick='waitForDataAndLogin()']");
  if (loginBtn) {
    loginBtn.addEventListener("click", waitForDataAndLogin);
  }
});
