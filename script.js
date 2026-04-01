// ===== Investor Data =====
const investors = [
  {
    username: "rafi",
    password: "1234",
    investments: [
      {project:"Project Alpha",amount:500000,roi:0,progress:35},
      {project:"Project Alpha",amount:200000,roi:0,progress:10}
    ],

    // 👇 USER-SPECIFIC NOTICES (YOU CONTROL HERE)
    notices: [
      {title:"Payment Reminder", message:"Pay within 5 days", date:"2026-04-01"},
      {title:"File 1 Approved", message:"Your file is approved", date:"2024-01-02"},
      {title:"File 2 Approved", message:"Your file is approved. This is another one!", date:"2025-04-02"},
      {title:"File 3 Approved", message:"Your file is approved. We are happy to doing business with you. your invesment here proves your courange and intelect.", date:"2026-04-02"},
    ]
  },

  {
    username:"rifat",
    password:"1234",
    investments:[
      {project:"Prime Tower",amount:600000,roi:5000,progress:1}
    ],

    notices: [
      {title:"ROI Update", message:"ROI updated", date:"2026-04-01"}
    ]
  }
];

// 👇 GLOBAL NOTICES (FOR ALL USERS)
const globalNotices = [
  {title:"New Project Launch", message:"New project coming soon", date:"2026-04-01"},
  {title:"Prime Tomer 1 Registration.", message:"Next Monday we are going to register all the shares to Prime Tower. Please join there in time get you asset properly", date:"2026-04-01"},
  {title:"Prime Tomer 2 Registration.", message:"Next Monday we are going to register all the shares to Prime Tower. Please join there in time get you asset properly", date:"2026-04-01"},
  {title:"Prime Tomer 3 Registration.", message:"Next Monday we are going to register all the shares to Prime Tower. Please join there in time get you asset properly", date:"2026-04-01"},
  {title:"Prime Tomer 4 Registration.", message:"Next Monday we are going to register all the shares to Prime Tower. Please join there in time get you asset properly", date:"2026-04-01"},
  {title:"Prime Tomer 5 Registration.", message:"Next Monday we are going to register all the shares to Prime Tower. Please join there in time get you asset properly", date:"2026-04-01"},
  {title:"Prime Tomer 6 Registration.", message:"Next Monday we are going to register all the shares to Prime Tower. Please join there in time get you asset properly", date:"2026-04-01"},
];

function loadNotices(){
  let notices = [];

  // 1. Always add global notices
  notices = notices.concat(globalNotices);

  // 2. Add user notices ONLY if logged in
  if(currentUser && currentUser.notices){
    notices = notices.concat(currentUser.notices);
  }

  // 3. Render
  let html = "";
  notices.forEach((n, i)=>{
    html += `
      <div class="notice-item" onclick="openNotice(${i})">
        <h4>${n.title}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  document.getElementById('noticeList').innerHTML = html;

  window.noticeData = notices;
}

function openNotice(i){
  let n = window.noticeData[i];
  document.getElementById('noticeTitle').innerText = n.title;
  document.getElementById('noticeMessage').innerText = n.message;
  document.getElementById('noticeModal').style.display = 'flex';
}

function closeNotice(){
  document.getElementById('noticeModal').style.display = 'none';
}

let currentUser = null;

// ===== Login & Logout =====
function login(){
  let u = document.getElementById('username').value;
  let p = document.getElementById('password').value;
  currentUser = investors.find(inv=>inv.username===u && inv.password===p);
  if(currentUser){
    document.getElementById('loginPage').style.display='none';
    document.getElementById('dashboardPage').style.display='block';
    loadDashboard();
  } else alert('Wrong login');
}
function logout(){location.reload();}

// ===== Dashboard Load =====
function loadDashboard(){
  loadNotices();
  let total=0, roiSum=0;
  let projectHTML="", historyHTML="";
  currentUser.investments.forEach(inv=>{
    total+=inv.amount;
    roiSum+=inv.roi;
    projectHTML+=`
      <div class="project-card">
        <div class="project-content">
          <h3>${inv.project}</h3>
          <p><b>Total Value:</b> ৳${inv.amount}</p>
          <p><b>Invested:</b> ৳${inv.roi}</p>
          <div class="progress-bar">
            <div class="progress" style="width:${inv.progress}%">${inv.progress}%</div>
          </div>
        </div>
      </div>`;
    historyHTML+=`<tr><td>${inv.project}</td><td>৳${inv.amount}</td><td>${inv.roi}%</td></tr>`;
  });
  document.getElementById('investment').innerText='৳'+total;
  document.getElementById('roi').innerText=(roiSum/currentUser.investments.length).toFixed(2)+'%';
  document.getElementById('totalProjects').innerText=currentUser.investments.length;
  document.getElementById('projectList').innerHTML=projectHTML;
  document.getElementById('historyTable').innerHTML=historyHTML;
}
