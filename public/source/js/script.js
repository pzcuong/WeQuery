
        
async function login() {
  var form = document.querySelector("#formElem");

  data = {
      username: form.querySelector("input[name=username]").value,
      password: form.querySelector("input[name=password]").value                
  }

  let response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          json: true
  })

  let text = await response.json(); 
  setCookie("x_authorization", text.accessToken);
  console.log(text)
  //alert(text.message);
  if(text.redirect)
      window.location.href = text.redirect;
  document.querySelector("#encoded").innerHTML = text.message;
  //window.open(text.captcha_url, "mywindow","menubar=1,resizable=1,width=350,height=250").focus();
};

async function register() {
  var form = document.querySelector("#formElem");

  data = {
      username: form.querySelector("input[name=username]").value,
      password: form.querySelector("input[name=password]").value,
      fullname: form.querySelector("input[name=fullname]").value,
      email: form.querySelector("input[name=email]").value,
      phoneNumber: form.querySelector("input[name=phoneNumber]").value                
  }

  let response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          json: true
  })

  let text = await response.json(); 
  setCookie("x_authorization", text.accessToken);
  console.log(text)
  //alert(text.message);
  if(text.redirect)
      window.location.href = text.redirect;
  document.querySelector("#encoded").innerHTML = text.message;
  //window.open(text.captcha_url, "mywindow","menubar=1,resizable=1,width=350,height=250").focus();
};


function setCookie(name,value) {
  document.cookie = name + "=" + value + ";; path=/";
}

function eraseCookie(name) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

async function checkToken() {
  console.log("Hello");

  let response = await fetch('/user/profile', {
    method: 'GET',
    json: true
  })

  if(response.status != 200) {
    let text = await response.json(); 
    
    if(text.alert)
      alert(text.alert);
    if(text.redirect)
      window.location.href = text.redirect;

    console.log(text);
  }
}

// auto send request to check time of token is valid
setInterval(checkToken, 60000);

async function SubmitSQL() {
  document.querySelector('#encoded').innerHTML = "Đang gửi yêu cầu, vui lòng đợi!";
  alert("Đang gửi yêu cầu, vui lòng đợi!");
  document.body.style.opacity = "20%";
  document.querySelector('.btn').disabled = true;

  var form = document.querySelector("#formElem");
  
  data = {
      SQLQuery : form.querySelector('textarea[name="SQLQuery"]').value,
  }

  let url = window.location.href;

  let response = await fetch(url, {
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          json: true
  })

  //selector button class btn btn-success from document
  //document.querySelector('')
  let text = await response.json(); 
  console.log(text)
  
  //if(text.alert)
    //  alert(text.alert)
  if(text.redirect)
      window.location.href = text.redirect;

  document.querySelector("#encoded").innerHTML = JSON.stringify(text.alert);
  document.body.style.opacity = "100%";
  document.querySelector('.btn').disabled = false;
};

async function changePassword() {
  var form = document.querySelector("#formElem");

  data = {
    username: form.querySelector("input[name=username]").value,
    password: form.querySelector("input[name=password]").value,
    newPassword: form.querySelector("input[name=newpassword]").value,
    confirmPassword: form.querySelector("input[name=confirmNewPassword]").value
  }

  let response = await fetch('/user/DoiMatKhau', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          json: true
  })

  let text = await response.json(); 
  console.log(text)
  alert(text.message);
  if(text.redirect)
      window.location.href = text.redirect;
  //document.querySelector("#encoded").innerHTML = text.message;
  //window.open(text.captcha_url, "mywindow","menubar=1,resizable=1,width=350,height=250").focus();
}


//insert source code js
// Language: javascript
// Path: "https://www.gstatic.com/charts/loader.js"




async function DrawTable(data) {
  google.charts.load('current', {'packages':['table']});
  google.charts.setOnLoadCallback(drawTable);

  function drawTable() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('number', 'Salary');
    data.addColumn('boolean', 'Full Time Employee');
    data.addRows([
      ['Mike',  {v: 10000, f: '$10,000'}, true],
      ['Jim',   {v:8000,   f: '$8,000'},  false],
      ['Alice', {v: 12500, f: '$12,500'}, true],
      ['Bob',   {v: 7000,  f: '$7,000'},  true]
    ]);

    var table = new google.visualization.Table(document.getElementById('table_div'));

    table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
  }
}

DrawTable();
