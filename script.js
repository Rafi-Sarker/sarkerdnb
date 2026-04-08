// ===== Investor Data =====
const investors = [
  {
    username: "rafi",
    password: "1",
    profile: [{ name: "Mohhammad Rafi Sarker", img: "rafi.jpg" }],
    investments: [
      { 
        project: "Prime Tower", 
        total: 600000, 
        invested: [
          { amount: 5000, date: "2026-04-05" },
          { amount: 4000, date: "2026-06-12" }
        ] 
      },
      { 
        project: "Project Alpha", 
        total: 200000, 
        invested: [
          { amount: 20000, date: "2026-03-06" }
        ] 
      }
    ],
    notices: [
      { title: "Payment Reminder 1", message: "Pay within 5 days", date: "2026-04-01", pin: true, expiry: "2026-04-30" },
      { title: "Payment Reminder 2", message: "Pay within 5 days", date: "2026-04-01", pin: false, expiry: "2027-03-30" },
      { title: "Payment Reminder 3", message: "Pay within 5 days", date: "2026-04-01", pin: true, expiry: "" }
    ]
  },
  {
    username: "rifat",
    password: "1",
    profile: [{ name: "Tanvir Rehman Rifat", img: "rifat.jpg" }],
    investments: [
      { 
        project: "Prime Tower", 
        total: 600000, 
        invested: [
          { amount: 5000, date: "2026-04-05" },
          { amount: 4000, date: "2026-06-12" },
          { amount: 51000, date: "2026-07-02" },
          { amount: -, date: "2026-06-12" }
        ] 
      }
    ],
    notices: [
      { title: "Enrollment Confirmed", message: "Congratulations! Your shares in Project Alpha have been successfully registered. Welcome aboard!", date: "2026-03-06", pin: false, expiry: "" },
      { title: "Investment Update", message: "We have received your payment of ৳5,000 for Project Alpha. Thank you!", date: "2026-03-06", pin: false, expiry: "" }
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
  let totalValue = 0;
  let projectHTML = "", historyHTML = "";

  currentUser.investments.forEach(inv => {
    const investedSum = Array.isArray(inv.invested) 
      ? inv.invested.reduce((sum, i) => sum + i.amount, 0)
      : inv.invested;
    const progress = ((investedSum / inv.total) * 100).toFixed(2);

    totalValue += inv.total;
    totalInvested += investedSum;

    projectHTML += `<div class="project-card">
      <div class="project-content">
        <h3>${inv.project}</h3>
        <p><b>Total Value:</b> ৳${inv.total}</p>
        <p><b>Invested:</b> ৳${investedSum}</p>
        <div class="progress-bar">
          <div class="progress" style="width:${progress}%">${progress}%</div>
        </div>
      </div>
    </div>`;

    // History table — show each installment
    if (Array.isArray(inv.invested)) {
      inv.invested.forEach(i => {
        historyHTML += `<tr>
          <td>${inv.project}</td>
          <td>৳${i.amount}</td>
          <td>${i.date}</td>
        </tr>`;
      });
    } else {
      historyHTML += `<tr>
        <td>${inv.project}</td>
        <td>৳${inv.invested}</td>
        <td>-</td>
      </tr>`;
    }
  });

  document.getElementById('user').innerText = currentUser.profile[0].name;
  document.getElementById('investment').innerText = '৳' + totalValue;
  document.getElementById('invested').innerText = '৳' + totalInvested;
  document.getElementById('totalProjects').innerText = currentUser.investments.length;
  document.getElementById('projectList').innerHTML = projectHTML;
  document.getElementById('historyTable').innerHTML = historyHTML;
}

// Auto-load notices on DOM ready
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("noticeList")) loadNotices();
});
