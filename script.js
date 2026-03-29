// ===== Investor Data =====
const investors = [
  {
    username: "rafi",
    password: "1234",
    investments: [
      {project:"Project Alpha",amount:500000,roi:0,progress:35},
      {project:"Project Beta",amount:200000,roi:0,progress:10}
    ]
  },
  {
    username:"rifat",
    password:"1234",
    investments:[{project:"Project Bosila",amount:600000,roi:50,progress:1}]
  }
];

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
  let total=0, roiSum=0;
  let projectHTML="", historyHTML="";
  currentUser.investments.forEach(inv=>{
    total+=inv.amount;
    roiSum+=inv.roi;
    projectHTML+=`
      <div class="project-card">
        <div class="project-content">
          <h3>${inv.project}</h3>
          <p><b>Invested:</b> ৳${inv.amount}</p>
          <p><b>ROI:</b> ${inv.roi}%</p>
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
