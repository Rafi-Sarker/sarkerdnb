// ===== Investor Data =====
const investors = [
  {
    username: "rafi",
    password: "1",
    profile: [{ name: "Mohhammad Rafi Sarker", img: "rafi.jpg" }],
    investments: [
      { project: "Prime Tower", total: 600000, invested: 5000 },
      { project: "Project Alpha", total: 200000, invested: 20000 }
    ],
    notices: [
      { title: "Payment Reminder 1", message: "Pay within 5 days", date: "2026-04-01", pin: true, expiry: "2026-04-30" },
      { title: "Payment Reminder 2", message: "Pay within 5 days", date: "2026-04-01", pin: false, expiry: "2027-03-30" },
      { title: "Payment Reminder 3", message: "Pay within 5 days", date: "2026-04-01", pin: true, expiry: "" }
    ]
  },
  {
    username: "rifat",
    password: "1234",
    profile: [{ name: "Rifat Hossain", img: "rifat.jpg" }],
    investments: [
      { project: "Prime Tower", total: 600000, invested: 100000 }
    ],
    notices: [
      { title: "Payment Reminder 1", message: "Pay within 5 days", date: "2026-04-01", pin: true, expiry: "2026-03-30" },
      { title: "Payment Reminder 2", message: "Pay within 5 days", date: "2026-04-01", pin: false, expiry: "2027-03-30" },
      { title: "Payment Reminder 3", message: "Pay within 5 days", date: "2026-04-01", pin: true, expiry: "" }
    ]
  }
];

// 👇 GLOBAL NOTICES (FOR ALL USERS)
const globalNotices = [
  { title: "New Project Launch", message: "New project coming soon", date: "2026-04-01" },
  { title: "Prime Tower 1 Registration", message: "Next Monday we are going to register all the shares to Prime Tower. Please join there in time to get your asset properly", date: "2026-04-01", pin: true },
  { title: "Prime Tower 2 Registration", message: "Next Monday we are going to register all the shares to Prime Tower. Please join there in time to get your asset properly", date: "2026-04-01" },
  { title: "Prime Tower 3 Registration", message: "Next Monday we are going to register all the shares to Prime Tower. Please join there in time to get your asset properly", date: "2026-04-01" }
];

let currentUser = null;

// ===== Notices =====
function loadNotices() {
  let notices = [...globalNotices];
  if (currentUser && currentUser.notices) {
    notices = notices.concat(currentUser.notices);
  }

  const today = new Date();
  notices = notices.filter(n => !n.expiry || new Date(n.expiry) >= today);

  // Sort pinned first
  notices.sort((a, b) => (b.pin === true) - (a.pin === true));

  window.noticeData = notices; // save globally

  // Render notices
  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");
  let html = "";
  let unreadCount = 0;

  notices.forEach((n, i) => {
    const isRead = read.includes(n.title);
    if (!isRead) unreadCount++;
    html += `<div class="notice-item ${!isRead ? 'unread' : ''}" onclick="openNotice(${i})">
      <h4>${n.title} ${n.pin ? '📌' : ''}</h4>
      <small>${n.date}</small>
    </div>`;
  });

  if (notices.length === 0) html = "<p style='font-size:13px;color:#777;'>No updates</p>";
  document.getElementById('noticeList').innerHTML = html;

  const noticeCountEl = document.getElementById('noticeCount');
  if (noticeCountEl) noticeCountEl.innerText = unreadCount;
}

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

// ===== Login & Logout =====
function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  currentUser = investors.find(inv => inv.username === u && inv.password === p);
  if (currentUser) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    loadDashboard();
  } else {
    alert('Wrong login');
  }
}

function logout() {
  location.reload();
}

// ===== Dashboard =====
function loadDashboard() {
  loadNotices();

  let totalInvested = 0;
  let projectHTML = "", historyHTML = "";

  currentUser.investments.forEach(inv => {
    const progress = ((inv.invested / inv.total) * 100).toFixed(2);

    totalInvested += inv.invested;

    projectHTML += `<div class="project-card">
      <div class="project-content">
        <h3>${inv.project}</h3>
        <p><b>Total Value:</b> ৳${inv.total}</p>
        <p><b>Invested:</b> ৳${inv.invested}</p>
        <div class="progress-bar">
          <div class="progress" style="width:${progress}%">${progress}%</div>
        </div>
      </div>
    </div>`;

    historyHTML += `<tr>
      <td>${inv.project}</td>
      <td>৳${inv.invested}</td>
      <td>${progress}%</td>
    </tr>`;
  });

  document.getElementById('user').innerText = currentUser.profile[0].name;
  document.getElementById('investment').innerText = '৳' + totalInvested;
  document.getElementById('totalProjects').innerText = currentUser.investments.length;
  document.getElementById('projectList').innerHTML = projectHTML;
  document.getElementById('historyTable').innerHTML = historyHTML;
}

// Auto-load notices on DOM ready
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("noticeList")) loadNotices();
});
