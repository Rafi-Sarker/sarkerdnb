const SHEET_ID = "YOUR_SHEET_ID";

let investors = [];
let investments = [];
let userNotices = [];
let globalNotices = [];

let currentUser = null;

// ===== LOAD DATA FROM GOOGLE SHEET =====
function initSheet() {
  Tabletop.init({
    key: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pubhtml`,
    simpleSheet: false,
    callback: function (data) {

      investors = data.Investors.elements;
      investments = data.Investments.elements;
      userNotices = data.UserNotices.elements;
      globalNotices = data.GlobalNotices.elements;

      console.log("Data Loaded");
    }
  });
}

document.addEventListener("DOMContentLoaded", initSheet);

// ===== LOGIN =====
function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  currentUser = investors.find(i => i.username === u && i.password === p);

  if (currentUser) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    loadDashboard();
  } else {
    alert("Wrong login");
  }
}

// ===== DASHBOARD =====
function loadDashboard() {

  loadNotices();

  let userInvestments = investments.filter(i => i.username === currentUser.username);

  let grouped = {};

  userInvestments.forEach(i => {
    if (!grouped[i.project]) {
      grouped[i.project] = {
        total: Number(i.total),
        invested: []
      };
    }

    grouped[i.project].invested.push({
      amount: Number(i.amount),
      date: i.date
    });
  });

  let totalValue = 0;
  let totalInvested = 0;
  let projectHTML = "";
  let historyHTML = "";

  Object.keys(grouped).forEach(project => {

    let inv = grouped[project];

    let investedSum = inv.invested.reduce((s, i) => s + i.amount, 0);
    let progress = ((investedSum / inv.total) * 100).toFixed(2);

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

  document.getElementById('user').innerText = currentUser.name;
  document.getElementById('investment').innerText = '৳' + totalValue;
  document.getElementById('invested').innerText = '৳' + totalInvested;
  document.getElementById('totalProjects').innerText = Object.keys(grouped).length;
  document.getElementById('projectList').innerHTML = projectHTML;
  document.getElementById('historyTable').innerHTML = historyHTML;
}

// ===== NOTICES =====
function loadNotices() {

  let notices = [...globalNotices];

  let userSpecific = userNotices.filter(n => n.username === currentUser?.username);
  notices = notices.concat(userSpecific);

  let today = new Date();

  notices = notices.filter(n => !n.expiry || new Date(n.expiry) >= today);

  notices.sort((a, b) => (b.pin === "true") - (a.pin === "true"));

  window.noticeData = notices;

  let html = "";
  notices.forEach((n, i) => {
    html += `
      <div class="notice-item" onclick="openNotice(${i})">
        <h4>${n.title} ${n.pin === "true" ? "📌" : ""}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  document.getElementById('noticeList').innerHTML = html;
}

// ===== MODAL =====
function openNotice(i) {
  const n = window.noticeData[i];
  document.getElementById('noticeTitle').innerText = n.title;
  document.getElementById('noticeMessage').innerText = n.message;
  document.getElementById('noticeModal').style.display = 'flex';
}

function closeNotice() {
  document.getElementById('noticeModal').style.display = 'none';
}
