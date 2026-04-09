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

  // UI loading effect
  document.body.style.opacity = "0.5";

  Tabletop.init({
    key: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pubhtml`,
    simpleSheet: false,
    callback: function (data) {

      investors = data.Investors?.elements || [];
      investments = data.Investments?.elements || [];
      userNotices = data.UserNotices?.elements || [];
      globalNotices = data.GlobalNotices?.elements || [];

      isDataLoaded = true;

      document.body.style.opacity = "1";

      console.log("✅ Data Loaded");
    }
  });
}

document.addEventListener("DOMContentLoaded", initSheet);

// ===== LOGIN =====
function login() {

  if (!isDataLoaded) {
    alert("Loading data... please wait");
    return;
  }

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
    alert("Wrong username or password");
  }
}

// ===== DASHBOARD =====
function loadDashboard() {

  loadNotices();

  let userInvestments = investments.filter(i =>
    i.username === currentUser.username
  );

  let grouped = {};

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

    let inv = grouped[project];

    let investedSum = inv.invested.reduce((s, i) => s + i.amount, 0);
    let progress = inv.total > 0
      ? ((investedSum / inv.total) * 100).toFixed(2)
      : 0;

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

  let notices = [...globalNotices];

  let userSpecific = userNotices.filter(n =>
    n.username === currentUser?.username
  );

  notices = notices.concat(userSpecific);

  const today = new Date();

  // Remove expired
  notices = notices.filter(n =>
    !n.expiry || new Date(n.expiry) >= today
  );

  // Sort pinned first
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
      <div class="notice-item ${!isRead ? 'unread' : ''}" onclick="openNotice(${i})">
        <h4>${n.title} ${String(n.pin).toLowerCase() === "true" ? "📌" : ""}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  if (notices.length === 0) {
    html = "<p style='font-size:13px;color:#777;'>No updates</p>";
  }

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

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  if (!read.includes(n.title)) {
    read.push(n.title);
    localStorage.setItem("readNotices", JSON.stringify(read));
  }

  loadNotices();
}

function closeNotice() {
  document.getElementById('noticeModal').style.display = 'none';
}

// ===== LOGOUT (OPTIONAL) =====
function logout() {
  location.reload();
}
