/**
 * @summary Change of server, client,SSID and password enable
 */
function Functionenable() {
    document.getElementById("server").disabled = false;
    //document.getElementById("ssid").disabled = false;
    //document.getElementById("password").disabled = false;
    document.getElementById("client").disabled = false;
    //document.getElementById("server").disabled = false;
    //document.getElementById("ssid_button").disabled = false;
    //document.getElementById("config_check").disabled = false;
    
}
/**
 * @summary Change of server, client,SSID and password disabled
 */
 function Functiondisabled(){
    //document.getElementById("server").value="";
    //console.log(a);
    document.getElementById("ssid").value="";
    document.getElementById("password").value="";
    document.getElementById("server").checked=false;
    document.getElementById("client").checked=false;
    document.getElementById("server").disabled = true;
    document.getElementById("ssid").disabled = true;
    document.getElementById("password").disabled = true;
    document.getElementById("client").disabled = true;
    document.getElementById("server").disabled = true;
    document.getElementById("ssid_button").disabled = true;
    document.getElementById("config_check").disabled = true;
}
/**
 * @summary Change of SSID and password enable
 */
 function FunctionenableServer() {
    document.getElementById("ssid").disabled = false;
    document.getElementById("password").disabled = false;
    document.getElementById("ssid_button").disabled = false;
    document.getElementById("config_check").disabled = false;
    
}
/**
 * @summary Change of SSID and password disable
 */
 function FunctiondisableServer() {
    document.getElementById("ssid").value="";
    document.getElementById("password").value="";
    document.getElementById("ssid").disabled = true;
    document.getElementById("password").disabled = true;
    document.getElementById("ssid_button").disabled = true;
    document.getElementById("config_check").disabled = true;
    
}
/**
 * @summary check ssid and password by ajax
 */
function Configssid(){
    var xhttp = new XMLHttpRequest();
    var ssid=document.getElementById("ssid").value;
    var password=document.getElementById("password").value;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    };
    xhttp.open("POST", "setting/configssid",true);
    xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xhttp.send(JSON.stringify(
        { 
            "ssid": ssid,
            "password":password 
        }
    ));
}
/**
 * @summary Get the list of ssids by ajax
 */
function Viewssid(){
    var xhttp = new XMLHttpRequest();
    var ssid = new Array();
    
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4 && this.status == 200) {
            var str='';
            ssid = JSON.parse(this.responseText);
            let ssids = ssid.ssids;

            for (var i=0; i < ssids.length;++i){
                str += '<option value="'+ssids[i]+'" />'; // Storing options in variable
            }
            
            var my_list=document.getElementById("ssid_list");
            my_list.innerHTML = str;
        }
        else if(this.readyState == 4 &&  this.status== 401)
        {
            console.log(this)
            alert((this.responseText).toString())
            return;
        }
    };
    xhttp.open("POST", "setting/getwifi", true);
    xhttp.send();
}
/**
* get Report
*/
function getReport(){
    var xhttp = new XMLHttpRequest();
    var ssid = new Array();
    
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4/* && this.status == 200*/) {

            var disposition = this.getResponseHeader('Content-Disposition');
            var matches = /"([^"]*)"/.exec(disposition);
            var filename = (matches != null && matches[1] ? matches[1] : 'file.xlsx');
            
            var blob = new Blob([this.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            /*var report = JSON.parse(this.responseText).report;
            
            var reportTable = document.getElementById('table_');
            for(var k = reportTable.rows.length - 1; k > 0; k--)
            {
                reportTable.deleteRow(k);
            }

            for (var i=0; i < report.length;++i){
                var newRow = reportTable.insertRow(i+1);
                newRow.setAttribute("class",'tr');
                var cell0 = newRow.insertCell(0);
                var cell1 = newRow.insertCell(1);
                var cell2 = newRow.insertCell(2);
                var cell3 = newRow.insertCell(3);
                var cell4 = newRow.insertCell(4);

                cell0.innerHTML = report[i]._ID;
                cell1.innerHTML = report[i].USER;
                cell2.innerHTML = report[i].TOTAL_COST;
                cell3.innerHTML = report[i].TOTAL_ENERGY;
                cell4.innerHTML = report[i].DATE;

                cell0.setAttribute("class",'td');
                cell1.setAttribute("class",'td');
                cell2.setAttribute("class",'td');
                cell3.setAttribute("class",'td');
                cell4.setAttribute("class",'td');
            }*/
        }
    };

    var date_from = document.getElementById('date_from_hide').value;
    var date_to = document.getElementById('date_to_hide').value;
    
    xhttp.open("POST", "setting/report", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.responseType = 'blob';
    xhttp.send(JSON.stringify({date_from, date_to}));
}
/**
 * @summary Read RFID from server with ajax and set in rfid_id
 */
function ReadId(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        //if (this.readyState == 4 && this.status == 200) {
        document.getElementById("rfid_id").innerHTML = this.responseText;
        document.getElementById("rfid_id").value = this.responseText;
        console.log(this.responseText);
        //}
    };
    xhttp.open("POST", "setting/getrfid", true);
    xhttp.send();
}
/**
 * @summary Change of user name, user id,READ and ADD disabled, Empty RFID information
 */
function changedisabled()
{
    document.getElementById("rfid_name").disabled = true;
    document.getElementById("rfid_name").value="";
    document.getElementById("rfid_id").value = "";
    document.getElementById("btn_read").disabled = true;
    document.getElementById("btnGenerate").disabled = true;
    document.getElementById("qr_submit").hidden = false;
    
    var empTab = document.getElementById('rfid_table');
    if(empTab!=null)
    {
       // document.getElementById("rfid_table").innerHTML="";
        document.getElementById("rfid_table").hidden=true;
        document.getElementById("rfid_div").innerHTML="";
        document.getElementById("reg_div").innerHTML="";
    }
}
/**
 * @summary Change of user name, user id,READ and ADD enable
 */
function changeEnable()
{
    document.getElementById("rfid_name").disabled = false;
    document.getElementById("btn_read").disabled = false;
    document.getElementById("btnGenerate").disabled = false;
    document.getElementById("qr_submit").hidden = true;
    /*if(users_rfid!=undefined && users_rfid.length>0)
    {
        for(var i=0; i<users_rfid.length; i++)
            createtable(users_rfid[i]);
    }*/
}
/**
 * @summary Create tables and enter RFID information dynamically
 * @returns error Empty information,Duplicate information
 * If user is defined, it means displaying information in the page load, otherwise the function is called when registering a new user
 */
function createtable(user) {
    const SETTING_ID = document.getElementById('id').value;
    var customers = new Array();
    customers.push(["Name", "ID"]);
    if(user==undefined)
    {
        var rfid_name=document.getElementById("rfid_name").value;
        var rfid_id=document.getElementById("rfid_id").value;
        var block=0;
    }
    else
    {
        var rfid_name=user.NAME;
        var rfid_id=user.RFIDCode;
        var block=user.BLOCK_STATUS;
    }
    if(rfid_name == "undefined" || rfid_name == null || rfid_name == "" || rfid_name == '' || rfid_name.length <= 0)
    {
        alert("نام نمی تواند خالی باشد")
        return;
    }
    if(rfid_id == "undefined" || rfid_id == null || rfid_id == "" || rfid_id == '' || rfid_id.length <= 0)
    {
        alert(" شناسه نمی تواند خالی باشد")
        return;
    }
    var div = document.getElementById("rfid_div");
    var tb=document.getElementById("rfid_table");
    var data = new Array();
    if(tb==null)
    {
       /* if(users!=undefined)
            data=users
            console.log(data)*/
        var form =document.createElement("form");
        form.setAttribute('action','/setting/rfid/registerUsers');
        form.setAttribute('method','post');
        form.setAttribute('id','rfid_form');
        var table =document.createElement("table");
        table.setAttribute('id','rfid_table');
        table.setAttribute('class','table');
        var tblBody = document.createElement("tbody");
        tblBody.setAttribute('id','rfid_tblBody');
        var input_hidden =document.createElement("input");
        input_hidden.setAttribute('id','rfid_input');
        input_hidden.setAttribute('type','hidden');
        input_hidden.setAttribute('name','users');

        var input_hid =document.createElement("input");
        input_hid.value=0;
        input_hid.setAttribute('type','hidden');
        input_hid.setAttribute('name','setting_id');

        var authentication_type =document.createElement("input");
        if(document.getElementById("qr").checked)
            authentication_type.value=1;
        else if(document.getElementById("rfid").checked)
            authentication_type.value=2;
        authentication_type.setAttribute('type','hidden');
        authentication_type.setAttribute('name','authentication_type');
    }
    else
    {
        var count =  document.getElementById("rfid_table").rows.length;
        var check_item="";
        if(count>0)
        {
            for(var i=0; i <count; i++)
            {
                for(var j=0; j <2; j++)
                {
                    if(j==0)
                        check_item=rfid_name;
                    else
                        check_item=rfid_id;
                    var info=document.getElementById("rfid_table").rows[i].cells[j].getElementsByTagName('input')[0].value;
                    if(check_item==info)
                    {
                        alert("اطلاعات تکراری است،لطفا مجدد بررسی نمایید")
                        return;
                    }
                }
            }
        }
        var form =document.getElementById("rfid_form");
        var table =document.getElementById("rfid_table");
        var tblBody = document.getElementById("rfid_tblBody");
        var input_hidden =document.getElementById("rfid_input");
        var data =JSON.parse(input_hidden.value);
    }
    customers.push([rfid_name, rfid_id]);
    var user_={"RFIDCode":rfid_id,"name":rfid_name,"block":block}
    data.push(user_);
    input_hidden.value=JSON.stringify(data);
    data = [];
    var row = document.createElement("tr");
    var columnCount = 2;
    for (var j = 0; j < columnCount; j++) {
        var cell = document.createElement("td");
        
        var input = document.createElement("input");
        input.setAttribute('type', 'text');
        input.value = customers[1][j];
        if(j!=0)
            input.disabled = true;
        else if(j==0 && block==1)
            input.disabled = true;
        else
            input.disabled = false;
        cell.appendChild(input);
        row.appendChild(cell);
        row.style.border =  '1px solid black';
    }
    var cell = document.createElement("td");
    var input_btn = document.createElement("input");
    input_btn.setAttribute('type', 'button');
    input_btn.setAttribute('value', 'Delete');
    input_btn.setAttribute('onclick', 'removeRow(this)');
    cell.appendChild(input_btn);
    row.appendChild(cell);
    var cell = document.createElement("td");
    var input_block = document.createElement("input");
    input_block.setAttribute('type', 'button');
    if(block==1)
        input_block.setAttribute('value', 'unBlock');
    else
        input_block.setAttribute('value', 'Block');
    input_block.setAttribute('onclick', 'blockRow(this)');
    cell.appendChild(input_block);
    row.appendChild(cell);
    tblBody.appendChild(row);
    table.appendChild(tblBody);
    form.appendChild(table);
    form.appendChild(input_hidden);
    if(input_hid!=null){
        input_hid.value = SETTING_ID/*{{setting_id}}*/;
        form.appendChild(input_hid);
    }
    
    if(authentication_type != null){
        form.appendChild(authentication_type);
    }
      
    div.appendChild(form);
    document.getElementById("rfid_table").hidden=false;
    createRegister();
}
/**
 * Delete table row
 */
function removeRow(id){
    //debugger;
    const SETTING_ID = document.getElementById('id').value;
   var empTab = document.getElementById('rfid_table');
   if(empTab!=null)
   {
        var row_index = id.parentNode.parentNode.rowIndex;
        var rfidCode = empTab.rows[row_index].cells[1].getElementsByTagName('input')[0].value;
        
        var xhttp = new XMLHttpRequest();
    
        xhttp.onreadystatechange = function() {
            
            if (this.readyState == 4 && this.status == 200) {
                empTab.deleteRow(row_index); 

                var count =  empTab.rows.length;
                if(count<=0)
                {
                    document.getElementById("rfid_table").hidden=true;
                    document.getElementById("reg_div").innerHTML="";
                }
                var input_hidden = document.getElementById("rfid_input");
                var data = JSON.parse(input_hidden.value);
                document.getElementById("rfid_input").value = "";

                let dataMain = [];
                for(var i=0; i<data.length; i++){
                    if(data[i].RFIDCode != rfidCode){
                        dataMain.push(data[i]);
                    }
                }
                document.getElementById("rfid_input").value = JSON.stringify(dataMain);
                
            }else if(this.readyState == 4 && this.status != 200){
                alert('Problem occured while deleting user!');
            }
        };

        xhttp.open("POST", "setting/rfid/deleteUser", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({rfidCode, SETTING_ID}));

        
    }
}
/**
 * Block and unBlock table row
 */
function blockRow(id){
    
   const SETTING_ID = document.getElementById('id').value;
   var empTab = document.getElementById('rfid_table');
   var row_index=id.parentNode.parentNode.rowIndex;
   var block=empTab.rows[row_index].cells[3].getElementsByTagName('input')[0].value;

   var xhttp = new XMLHttpRequest();
   xhttp.open("POST", "setting/rfid/blockUser", true);
   xhttp.setRequestHeader("Content-Type", "application/json");
   let blockStatus = -1;
   var rfidCode = empTab.rows[row_index].cells[1].getElementsByTagName('input')[0].value;

   if(block == "Block") blockStatus = 1;
   else if (block == "unBlock") blockStatus = 0;
    
    xhttp.onreadystatechange = function() {
            
        if (this.readyState == 4 && this.status == 200) {
            if(block == "Block")
            {
                var input_hidden =document.getElementById("rfid_input").value;
                var value=JSON.parse(input_hidden);
                value[row_index].block = 1;
                document.getElementById("rfid_input").value=JSON.stringify(value);
                empTab.rows[row_index].cells[0].getElementsByTagName('input')[0].disabled=true;
                empTab.rows[row_index].cells[3].getElementsByTagName('input')[0].value="unBlock";
            }
            else if (block == "unBlock")
            {
                var input_hidden =document.getElementById("rfid_input").value;
                var value=JSON.parse(input_hidden);
                value[row_index].block = 0;
                document.getElementById("rfid_input").value=JSON.stringify(value);
                empTab.rows[row_index].cells[0].getElementsByTagName('input')[0].disabled=false;
                empTab.rows[row_index].cells[3].getElementsByTagName('input')[0].value="Block";
            }
        }else if(this.readyState == 4 && this.status != 200){
            alert('Problem occured while blocking/unblocking user!');
        }
    };

    xhttp.send(JSON.stringify({rfidCode, blockStatus, SETTING_ID}));
}
/**
 * Create registration button
 */
function createRegister() {
    document.getElementById("reg_div").innerHTML="";
    document.getElementById("rfid_id").innerHTML="";
    document.getElementById("rfid_name").innerHTML="";
    document.getElementById("rfid_id").value="";
    document.getElementById("rfid_name").value="";
    
    //debugger;
    var div = document.getElementById("reg_div");
    var table =document.createElement("reg_table");
    var tblBody = document.createElement("tbody");
    var row_reg = document.createElement("tr");
    var cell_reg = document.createElement("td");
    var input_reg = document.createElement("input");
    input_reg.setAttribute('type', 'submit');
    input_reg.setAttribute('value', 'Register');
    input_reg.setAttribute('onclick', 'formsubmit(this)');
    cell_reg.appendChild(input_reg);
    row_reg.appendChild(cell_reg);
    tblBody.appendChild(row_reg);
    table.appendChild(tblBody);
    div.appendChild(table);
}
/**
 * Submit a form for save RFID information
 */
function formsubmit(id){
    //debugger;
    document.getElementById("rfid_form").submit();
}
/**
 * Receive users information from the database by ajax and create a dynamic table with the received information
 */
 function Load(){
    const SETTING_ID = document.getElementById('id').value;
    var rfid_value=document.getElementById("rfid").checked;
    if(rfid_value && SETTING_ID/*{{setting_id}}*/ >0)
     {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            
            if (this.readyState == 4 && this.status == 200) {
               var users = JSON.parse(this.responseText).users;
                console.log(users);
                users_rfid = users;
                for(var i=0; i<users.length;i++)
                    createtable(users[i]);
            }
        };
        xhttp.open("POST", "setting/getusers", true);

        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(
            {
                id:SETTING_ID/*{{setting_id}}*/
            }))
     }
}

function setTime(){
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4) {
            //if(this.status !== 200)
                alert(this.response);
            // else
            //     window.location.href = '/get';
        }
    };
    //debugger;
    var date_time = document.getElementById('date_time').value;
    var time = document.getElementById('time').value;
    xhttp.open("POST", "/setting/setdatetime", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({"time":time, "date_time":date_time}));
}

function checkServer(){
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4) {
            if(this.status == 200){
                alert("Successfully pinging 10.19.1.8!");
            }else{
                alert(this.response);
            }
        }

    };
    
    xhttp.open("GET", "/setting/checkserver", true);
    //xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}

function changeUserNamePassword(){
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4) {
            if(this.status == 200){
                alert("Username/password successfully changed.");
                document.getElementById('username').value = "";
                document.getElementById('password_setting').value = "";
            }else{
                alert(this.response);
            }
        }

    };

    var username = document.getElementById('username').value;
    var password = document.getElementById('password_setting').value;

    xhttp.open("POST", "/setting/changeuserpass", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({"username":username, "password":password}));
}