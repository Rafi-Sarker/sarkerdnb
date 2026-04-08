// ===== DATA =====
const investors = [
  {
    username: "rafi",
    password: "1",
    investments: [
      {project:"Project Alpha",amount:500000,progress:35,date:"2026-04-01"},
      {project:"Project Alpha",amount:200000,progress:10,date:"2026-04-05"}
    ],
    notices: [
      {id:1,title:"Payment Reminder",message:"Pay within 5 days",date:"2026-04-01",pin:true},
      {id:2,title:"File Approved",message:"Your file is approved",date:"2026-04-02"}
    ]
  }
];

const globalNotices = [
  {id:100,title:"New Project Launch",message:"Coming soon",date:"2026-04-01"},
  {id:101,title:"Prime Tower Registration",message:"Join on Monday",date:"2026-04-01",pin:true}
];

let currentUser = null;

// ===== LOGIN =====
function login(){
  let u = username.value;
  let p = password.value;

  currentUser = investors.find(i => i.username === u && i.password === p);

  if(currentUser){
    loginPage.style.display = "none";
    dashboardPage.style.display = "block";
    loadDashboard();
  } else {
    alert("Wrong login");
  }
}

function logout(){
  location.reload();
}

// ===== DASHBOARD =====
function loadDashboard(){
  loadNotices();

  let total = 0;
  let projectHTML = "";
  let historyHTML = "";

  currentUser.investments.forEach(inv => {
    total += inv.amount;

    projectHTML += `
      <div class="project-card">
        <h3>${inv.project}</h3>
        <p><b>Amount:</b> ৳${inv.amount.toLocaleString()}</p>
        <p><b>Date:</b> ${inv.date}</p>

        <div class="progress-bar">
          <div class="progress" style="width:${inv.progress}%">
            ${inv.progress}%
          </div>
        </div>
      </div>
    `;

    historyHTML += `
      <tr>
        <td>${inv.project}</td>
        <td>৳${inv.amount.toLocaleString()}</td>
        <td>${inv.date}</td>
      </tr>
    `;
  });

  totalPortfolio.innerText = "৳" + total.toLocaleString();
  totalInvested.innerText = "৳" + total.toLocaleString();
  totalProjects.innerText = currentUser.investments.length;

  projectList.innerHTML = projectHTML || "<p>No projects</p>";
  historyTable.innerHTML = historyHTML;
}

// ===== NOTICES =====
function loadNotices(){
  let notices = [...globalNotices, ...(currentUser?.notices || [])];

  notices.sort((a,b)=>(b.pin===true)-(a.pin===true));

  window.noticeData = notices;

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  let html = "";

  notices.forEach((n,i)=>{
    let isRead = read.includes(n.id);

    html += `
      <div class="notice-item ${!isRead ? 'unread':''}" onclick="openNotice(${i})">
        <h4>${n.title} ${n.pin ? '📌':''}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  noticeList.innerHTML = html || "<p>No updates</p>";
}

function openNotice(i){
  let n = window.noticeData[i];

  noticeTitle.innerText = n.title;
  noticeMessage.innerText = n.message;
  noticeModal.style.display = "flex";

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  if(!read.includes(n.id)){
    read.push(n.id);
    localStorage.setItem("readNotices", JSON.stringify(read));
  }

  loadNotices();
}

function closeNotice(){
  noticeModal.style.display = "none";
}
