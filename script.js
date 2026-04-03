// ===== DATA =====
const investors = [
  {
    username: "rafi",
    password: "1",
    investments: [
      {project:"Project Alpha",amount:500000,roi:0,progress:35}
    ],
    notices: [
      {title:"Payment Reminder", message:"Pay within 5 days", date:"2026-04-01", pin:true}
    ]
  }
];

const globalNotices = [
  {title:"New Project Launch", message:"Coming soon", date:"2026-04-01"},
  {title:"Prime Tower Registration", message:"Join on Monday", date:"2026-04-01", pin:true}
];

let currentUser = null;

// ===== NOTICE SYSTEM =====
function loadNotices(){
  let notices = [...globalNotices];

  if(currentUser) notices = notices.concat(currentUser.notices);

  notices.sort((a,b)=>(b.pin===true)-(a.pin===true));

  window.noticeData = notices;

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");

  let html = "";
  let unread = 0;

  notices.forEach((n,i)=>{
    let isRead = read.includes(n.title);
    if(!isRead) unread++;

    html += `
      <div class="notice-item ${!isRead ? 'unread':''}" onclick="openNotice(${i})">
        <h4>${n.title} ${n.pin ? '📌':''}</h4>
        <small>${n.date}</small>
      </div>
    `;
  });

  document.getElementById("noticeList").innerHTML = html;
  document.getElementById("noticeCount").innerText = unread;
}

function openNotice(i){
  let n = window.noticeData[i];

  document.getElementById('noticeTitle').innerText = n.title;
  document.getElementById('noticeMessage').innerText = n.message;
  document.getElementById('noticeModal').style.display = 'flex';

  let read = JSON.parse(localStorage.getItem("readNotices") || "[]");
  if(!read.includes(n.title)){
    read.push(n.title);
    localStorage.setItem("readNotices", JSON.stringify(read));
  }

  loadNotices();
}

function closeNotice(){
  document.getElementById('noticeModal').style.display = 'none';
}

// ===== LOGIN =====
function login(){
  let u = document.getElementById('username').value;
  let p = document.getElementById('password').value;

  currentUser = investors.find(x=>x.username===u && x.password===p);

  if(currentUser){
    loadNotices();
  } else {
    alert("Wrong login");
  }
}

// ===== MENU =====
function toggleMenu(){
  document.querySelector('.nav').classList.toggle('active');
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", ()=>{
  loadNotices();
});
