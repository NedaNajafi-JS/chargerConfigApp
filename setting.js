/**
 * Use the express,fs modules
 * Page for reading html form webtools settings
 * Define the paths sent from the form and save the data sent in the database
 */
const express = require("express");
const router = express.Router();

let util = require('util');
const exec_ = require('child_process').exec;
let exec = util.promisify(exec_);
var serialPort = require('serialport');
var bodyparser = require('body-parser');
var urlencodedparser = bodyparser.urlencoded({extended:false});
const axios = require('axios');
const http = require('http');

const excel = require('exceljs');
var dateFormat = require('dateformat');
const moment = require('moment-jalaali');
moment.loadPersian();
/**
 * Connect to RFID and get its code
 */
var RFIDDataReceived = 0;
function rfidReadData(){
  return new Promise(function(resolve, reject){
    try{
      var RFIDPortConfiguration = new serialPort('/dev/ttyAMA0', {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
      });
      if(RFIDPortConfiguration.isOpen) {
        //RFIDPortConfiguration.open();
        console.log('port is open')
      }
      RFIDPortConfiguration.on('error', function(err){
        console.log("errrrrrr"+ err);
      });
      RFIDPortConfiguration.on('data', async function (readBuffer) {
        RFIDDataLength = Buffer.byteLength(readBuffer);
        if(RFIDDataLength==4){ 
            console.log("RFID Code = ", readBuffer[0],readBuffer[1],readBuffer[2],readBuffer[3]);
            ScanedCodeOfRFID ="";
            DriverCodeFromRFID="";
    
            for(var i=0;i<4;i++){ 
                BufferForRFID = ("00" + readBuffer[i].toString(16)).slice(-2);
                DriverCodeFromRFID = DriverCodeFromRFID + BufferForRFID;
                readBuffer[i] =0;
            }
    
            ScanedCodeOfRFID="C"+DriverCodeFromRFID;  
            RFIDDataReceived =1; 
            //inputMode =2;
            console.log("ScanedCodeOfRFID = " , ScanedCodeOfRFID);
            resolve({"code": ScanedCodeOfRFID});
        }else{
          RFIDDataReceived = 0;
        }
        RFIDPortConfiguration.flush((err)=>console.log(err));

        if(RFIDPortConfiguration.isOpen){
          RFIDPortConfiguration.close(function(err){
            console.log("error close", err);
          });
        }

        axios.get('http://localhost:5000/rfid/enable')
        .then((response)=>{
          console.log(response);

        }).catch((err)=>{
          console.log(err);
        })
      });
    
      setTimeout(async function() {
        if(RFIDPortConfiguration.isOpen){
          RFIDPortConfiguration.close(function(err){
            console.log("error close", err);
          });
        }

        axios.get('http://localhost:5000/rfid/enable')
        .then((response)=>{
          console.log(response);

        }).catch((err)=>{
          console.log(err);
        })
      }, 10000);
  
      console.log("sdgdfgdfg", RFIDPortConfiguration.isOpen);
    }catch(err){
      console.log(err);
    }
    
  });
  //var RFIDPortConfiguration = require('./config/keys').RFIDPortConfiguration;
  
}

//rfidReadData();

const db_connection = require('./db_setting/connection').connection;
const globals = require('./practical_funcs');
/**
 * Reads and displays the html file by entering the /setting path
 */
/*router.get("/", (req, res) => {
  res.sendFile(__dirname + '/static/s.html');
});*/
/**
 * Restart the operating system
 */
router.get("/reset", async (req, res) => {
  console.log("reset: " + JSON.stringify(req.body));

  /**
  * System re-boot command - linux
  */
  let result = await globals.runCommand('sudo reboot');
  if (globals.validValue([result.stderr]))
    res.status(401).json(result.stderr);
  else
    res.status(200).json(result.stdout);
});
/**
 * check server connectivity
 */
router.get("/checkserver", async (req, res) => {

  /**
  * System ping to server command - linux
  */
  let result = await globals.runCommand('ping -c 5 10.19.1.8');
  if (globals.validValue([result.stderr]))
    res.status(401).json(result.stderr).end();
  else
     res.status(200).end();
});
/**
 * self check status
 * request to server and get status
 * Waiting for Mr.yousefi
 */
router.get("/selfcheck", (req, res) => {
  console.log("selfcheck: " + JSON.stringify(req.body))
});
/**
 * Receive reports within the announced time frame
 * It was supposed to be done by Mr.yousefi, 
 * but after discussion the decision is to be done by the backend team.
 */
router.post('/report', async (req, res) => {
  const date_from_int = parseInt(req.body.date_from);//new Date(req.body.date_from).getTime();
  const date_end_int = parseInt(req.body.date_to);//new Date(req.body.date_to).getTime();

  let workBook = new excel.Workbook();

  let worksheet = workBook.addWorksheet('Report');

  worksheet.columns = [
    { header: "Id", key: "id", width: 5 },
    { header: "User", key: "user", width: 25 },
    { header: "Total Energy", key: "total_energy", width: 15 },
    { header: "Total Cost", key: "total_cost", width: 15 },
    { header: "Date", key: "date", width: 30 },
  ];

  const reportQuery = `select _ID, USER, TOTAL_ENERGY, TOTAL_COST, DATE 
      from REPORTINFO where (DATE between ? and ?)`;

  let total_rows = [];

  db_connection.all(reportQuery,[date_from_int, date_end_int], function(err, report){
    if(err) console.log(err);
    
    report.forEach(row => {
      //row.DATE = new Date(parseInt(row.DATE));
      row.DATE = moment(parseInt(row.DATE)).format('jYYYY,jM,jD HH:mm');
      row.DATE = dateFormat(row.DATE, "isoDateTime");
      total_rows.push([row._ID, row.USER, row.TOTAL_ENERGY, row.TOTAL_COST, row.DATE]);
    });

    worksheet.addRows(total_rows);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "tutorials.xlsx"
      );
      
      return workBook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
  });
});

/**
 * change the username and password
 * gets the user's _ID and update "username" and "password"
 * Done
 */
router.post('/changeuserpass', async (req, res) => {
  console.log("username: " + JSON.stringify(req.body.username))
  console.log("password: " + JSON.stringify(req.body.password));
  try {
    var user_id = 0;
    if(req.user){
      user_id = req.user._ID;
    }
    if(globals.validValue([user_id, req.body.username, req.body.password])){
      db_connection.run('UPDATE CLIENTS SET USERNAME = ?, PASSWORD = ? WHERE _ID = ?'
        , [req.body.username, req.body.password, Number(user_id)]);
      res.status(200).end();
    }else{
      res.status(401).send(err).end();
    }
      
  } catch (err) {
    res.status(401).send(err);
  };
});

/**
 * change the date and time system
 * Done
 */
router.post('/setdatetime', async (req, res) => {
  //console.log("date_time: " + JSON.stringify(req.body.date_time))

  /**
  * System setTime command - linux
  */
//let date = req.body.date_time;
 //let time = req.body.time;
  if (globals.validValue([req.body.time])) {
    let command = `sudo date -s '${req.body.date_time} ${req.body.time}'`;
    let result = await globals.runCommand(command);
    if (globals.validValue([result.stderr]))
      res.status(401).json(result.stderr).end();
    else
      res.status(200).json(result.stdout).end();
  } else {
    res.status(401).send("ورودی نامعتبر");
  }
});

/**
 * get RFID
 */
router.post('/getrfid', async (req, res) => {
  console.log("getrfid: " + JSON.stringify(req.body.getrfid));
  
  //if(checkServer("http://localhost:5000")){
  axios.get('http://localhost:5000/rfid/disable')
  .then(async function(response){
    console.log(response);

    await rfidReadData().then((resolve, err)=>{
      console.log(resolve);
      ScanedCodeOfRFID = resolve.code;
      if(RFIDDataReceived == 1 && ScanedCodeOfRFID.trim() != ''){
        res.status(200).send(ScanedCodeOfRFID);
      }else{
        res.status(200);
      }
      RFIDDataReceived = 0;
    });
    }).catch( async function(err){
    console.log(err);
      if(err.code === "ECONNREFUSED"){
        await rfidReadData().then((resolve, err)=>{
          console.log(resolve);
          ScanedCodeOfRFID = resolve.code;
          if(RFIDDataReceived == 1 && ScanedCodeOfRFID.trim() != ''){
            res.status(200).send(ScanedCodeOfRFID);
          }else{
            res.status(200);
          }
          RFIDDataReceived = 0;
  });
      }
    });
  // }else{
  //   await rfidReadData().then((resolve, err)=>{
  //     console.log(resolve);
  //     ScanedCodeOfRFID = resolve.code;
  //     if(RFIDDataReceived == 1 && ScanedCodeOfRFID.trim() != ''){
  //       res.status(200).send(ScanedCodeOfRFID);
  //     }else{
  //       res.status(200);
  //     }
  //     RFIDDataReceived = 0;
  //   });
  // }
});
/**
 * Get the information of registered users with rfid
 */
router.post('/getusers', async (req, res) => {

  const reportQuery = `select NAME,RFIDCode,BLOCK_STATUS,SETTING_ID from users where setting_id=?`
  db_connection.all(reportQuery,[req.body.id], function(err, users){
    if(err) console.log(err);
    res.json({"users" : users});
  });
});
/**
 * get WIFI
 * Done
 */
router.post('/getwifi', async (req, res) => {
  let command = `sudo iwlist wlan0 scan | perl -nle '/ESSID:(.*)$/ && print $1'`;
  let result = await globals.runCommand(command);
  if (globals.validValue([result.stderr]))
    res.status(401).send(result.stderr);
  else {
    const ssids = result.stdout;
    
    let ssids_ = ssids.replace(/"/g,'');
    ssids_ = ssids_.split(/\r?\n/);
    res.status(200).json({"ssids":ssids_});
  }
});

/**
 * @summary If the Authentication type is QR, registered through this rout.
 * @param setting_id,authen_type
 * @returns error - an array of error strings
 * @returns status - 400 if error occurs, 200 if successful.
 * @input_example 
 * Done
 */
router.post('/qr/register', (req, res) => {
  console.log(req.body)
  try {
      if(req.body.id == 0)
      {
        db_connection.run('INSERT INTO SETTING(AUTHENTICATION_TYPE) VALUES(1)')
    
      }
      else{
          db_connection.run('UPDATE SETTING SET AUTHENTICATION_TYPE=1 WHERE _ID=?'
                        ,[req.body.id])
      }
      res.status(200).redirect('./../../get');
    } catch (err) {
      console.log(err)
      res.status(400).send(err.message)
    }
});

/**
 * @summary If the Authentication type is RFID, users are registered through this rout.
 * @param users - array of users to be registered. Each user is an object {user.id, user.name}
 * @param setting_id
 * @returns error - an array of error strings
 * @returns status - 401 if error occurs, 200 if successful.
 * @input_example 
 * {
 *  "users" : [{"id" : "222", "name":"Neda"}, {"id" : "333", "name":"Nava"}],
 *  "setting_id": "1"
 * }
 * Done
 */
router.post('/rfid/registerUsers', async (req, res) => {
  try{
    let error = [];
    let users = JSON.parse(req.body.users);
    var userID = 0;

    const res_ = await db_connection.query(`select max(_id) as id from users`, [], 'select');
    if(res_.rows.length > 0){
       if(res_.rows[0].id == '' || res_.rows[0].id == null)  userID = 0;
       else userID = parseInt(res_.rows[0].id);
    }

    let get_user = `select _id, name from users where RFIDCode = ? and setting_id = ? `;
    let save_user = `insert into users(_id, RFIDCode, name, setting_id) values(?,?,?,?) `;

    if(parseInt(req.body.setting_id) <= 0){
      if(addOrUpdateMainSetting(parseInt(req.body.setting_id) + 1)){
        req.body.setting_id = parseInt(req.body.setting_id) + 1;
      }
    }

    db_connection.run(`update setting set AUTHENTICATION_TYPE = ?`, [req.body.authentication_type], function(err){
      console.log(err);
    });

    Promise.all(
      users.map(
        async(user) => {  
          const res = await db_connection.query(get_user, [user.RFIDCode, parseInt(req.body.setting_id)], 'select');
          
          if(res.rows.length > 0){
            //const err = new Error(`کاربر ${res.rows[0].NAME} قبلا در این تنظیمات ثبت شده است.`);
            //error.push(err);
            
          }else{
            userID++;
            const res__ = await db_connection.query(save_user, [userID, user.RFIDCode, user.name, req.body.setting_id], 'update');
            console.log("res__", res__);
            if(res__.changes <= 0){
              const err = new Error(`کاربر ${user.name} ذخیره نشد.`);
              error.push(err);
            }else{
              console.log(parseInt(res__.lastID));
            }
          }
      })
    ).then(()=>{
      if(error.length > 0){
        res.status(401).json({"errors": error[0].message});
      }else{
        res.status(200).redirect('./../../get');
      }
    });//end of .map
      //.filter(user_ => globals.validValue([user_.id, user_.name]) == true)
    
  }catch(err){
    console.log(err);
  }

});

router.post('/rfid/deleteUser', async function(req, res){
  let deleteQuery = `DELETE FROM USERS WHERE RFIDCode = ? and setting_id = ?`;
  
  if(validValue([req.body.rfidCode, req.body.SETTING_ID])){
    db_connection.run(deleteQuery, [req.body.rfidCode, req.body.SETTING_ID], function(err){
      if(err != undefined && err !== ''){
        res.status(401).send(err).end();
      }else{
        res.status(200).end();
      }
    })
  }
});

router.post('/rfid/blockUser', async function(req, res){
  let blockQuery = `UPDATE USERS SET BLOCK_STATUS = ? WHERE RFIDCode = ? and setting_id = ?`;

  if(validValue([req.body.rfidCode, req.body.SETTING_ID]) && 
    (req.body.blockStatus === 0 || req.body.blockStatus === 1)){
    db_connection.run(blockQuery, [req.body.blockStatus, req.body.rfidCode, req.body.SETTING_ID], function(err){
      if(err != undefined && err !== ''){
        res.status(401).send(err).end();
      }else{
        res.status(200).end();
      }
    })
  }
});
/**
 * save information about language and type of authentication
 */
router.post('/sys_conf1', async (req, res) => {
  console.log("sys_conf1: " + req.body.id)
  console.log("sys_conf1: " + req.body.name)
  console.log("sys_conf1: " + req.body.language)
  console.log("sys_conf1: " + req.body.authen_type)

  try {
    console.log("sys_conf1: " + JSON.stringify(req.body))
  } catch (err) {
    console.log(err)
    res.status(400).send(err.message)
  }
})
/**
 * save operational mode information
 */
router.post('/sys_conf2', async (req, res) => {
  console.log("sys_conf2: " + req.body.ip)
  console.log("sys_conf2: " + req.body.name)
  console.log("sys_conf2: " + req.body.op_mode)

  try {
    console.log("sys_conf1: " + JSON.stringify(req.body))
  } catch (err) {
    console.log(err)
    res.status(400).send(err.message)
  }
})
/**
 * Save information about network settings
 * Done
 */
router.post('/configssid', async (req, res) => {
  try {
    //console.log(req.body.toString())
    console.log(req.body)
    set_ssid(req.body.ssid, req.body.password);
    res.status(200).send("Success!");
  } catch (err) {
    console.log(err)
    res.status(400).send(err.message)
  }
});
/**
 * Save information about network settings
 * Done
 */
router.post('/netsetting', async (req, res) => {
 // console.log("net_type: " + req.body);

  try {
    //set_ssid(req.body.ssid, req.body.password);
    var op_mode = "",net_connection=null;
    if(req.body.net_type=="wifi")
      op_mode=1;
    else if(req.body.net_type=="gsm")
      op_mode=2;
    else if(req.body.net_type=="lan")
      op_mode=3;
    if(req.body.wifi_!=undefined)
    {
      if(req.body.wifi_=="server")
      net_connection=1;
      else if(req.body.wifi_=="client")
        net_connection=2;
    }
    if(req.body.id == 0)
    {
      db_connection.run('INSERT INTO SETTING(OPERATIN_MODE,internetConnection) VALUES(?,?)'
                      ,[op_mode, net_connection])
    }
    else{
        db_connection.run('UPDATE SETTING SET OPERATIN_MODE=?,internetConnection=? WHERE _ID=?'
                      ,[op_mode, net_connection,req.body.id])
    }
    res.status(200).redirect('./../../get');
  } catch (err) {
    console.log(err)
    res.status(400).send(err.message)
  }
});
/**
 * @summary Save charging value setting information.
 * @param max_current,max_voltage,cost_kwh
 * @returns error - an array of error strings
 * @returns status - 400 if error occurs, 200 if successful.
 */
router.post('/charghing_sett/', async (req, res) => {
  console.log("charghing_sett: " + req.body.max_current)
  console.log("charghing_sett: " + req.body.max_voltage)
  console.log("charghing_sett: " + req.body.cost_kwh)
  console.log("setting_id: " + req.body.id)

  try {
    /*(globals.validValue([req.body.max_current, req.body.max_voltage, req.body.cost_kwh])) 
    ?*/
    if(req.body.id == 0)
    {
      db_connection.run('INSERT INTO SETTING(maxCurrent,maxVoltage,costValue) VALUES(?, ?,?)'
                      ,[req.body.max_current, req.body.max_voltage, req.body.cost_kwh])
    }
    else{
        db_connection.run('UPDATE SETTING SET maxCurrent=?,maxVoltage=?,costValue=? WHERE _ID=?'
                      ,[req.body.max_current, req.body.max_voltage, req.body.cost_kwh,req.body.id])
    }
    // : 
    res.status(200).redirect('./../../get');
  } catch (err) {
    console.log(err)
    res.status(400).send(err.message)
  }
})
/**
 * @summary Save ocpp information.
 * @param center_system_add,center_system_add,charging_point_port
 * @returns error - an array of error strings
 * @returns status - 400 if error occurs, 200 if successful.
 */
router.post('/ocpp', async (req, res) => {
  console.log("ocpp: " + req.body.center_system_add)
  console.log("ocpp: " + req.body.charging_point_add)
  console.log("ocpp: " + req.body.charging_point_port)
  console.log("setting_id: " + req.body.id)

  try {
    /*(globals.validValue([req.body.max_current, req.body.max_voltage, req.body.cost_kwh])) 
    ?*/
    if(req.body.id == 0)
    {
      db_connection.run('INSERT INTO SETTING(OCPPValue_1,OCPPValue_2,OCPPValue_3) VALUES(?,?,?)'
                      ,[req.body.center_system_add, req.body.charging_point_add, req.body.charging_point_port])
    }
    else{
        db_connection.run('UPDATE SETTING SET OCPPValue_1=?,OCPPValue_2=?,OCPPValue_3=? WHERE _ID=?'
                      ,[req.body.center_system_add, req.body.charging_point_add, req.body.charging_point_port,req.body.id])
    }
     // : 
    res.status(200).redirect('./../../get');
  } catch (err) {
    console.log(err)
    res.status(400).send(err.message)
  }
});

function set_ssid(ssid, password){
  //get network id(net_id), use in wifi setting commands
  exec('sudo wpa_cli -i wlan0 add_network',(err,stdout,stderr)=>{
    if (err) {
      console.log(`error: ${err.message}`);
      return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    let ssid_ = `${ssid}`;

    let net_id = stdout;
    net_id = net_id.replace(/(\r\n|\n|\r)/gm, "");
    console.log(net_id);
    //select ssid(wifi) from wifi list 
    let command = `sudo wpa_cli -i wlan0 set_network ${net_id} ssid '\"${ssid_}\"'`;
    
    exec(command,(err,stdout,stderr)=>{
      if (err) {
        console.log(`error: ${err.message}`);
        
        return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
          
      }
      console.log(`stdout: ${stdout}`);
      
      //check if the selected ssid is available
      command = `sudo wpa_cli -i wlan0 set_network ${net_id} scan_ssid 1`;
      exec(command,(err,stdout,stderr)=>{
        if (err) {
          console.log(`error: ${err.message}`);
          return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        let password_ = `${password}`;
        //if the password is provided, run a command to clarify that the user has entered password.
        //if not, pass NONE
        if(password.length > 0)
            command = `sudo wpa_cli -i wlan0 set_network ${net_id} key_mgmt WPA-PSK`;
        else
            command = `sudo wpa_cli -i wlan0 set_network ${net_id} key_mgmt NONE`;
        exec(command,(err,stdout,stderr)=>{
          if (err) {
            console.log(`error: ${err.message}`);
            return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          console.log(`stdout: ${stdout}`);
          
          //set network using ssid name and password
          command = `sudo wpa_cli -i wlan0 set_network ${net_id} psk '\"${password_}\"'`;
          if(password.length > 0)
          {
            exec(command,(err,stdout,stderr)=>{
              if (err) {
                console.log(`error: ${err.message}`);
                return;
              }
              if (stderr) {
                  console.log(`stderr: ${stderr}`);
                  return;
              }
              console.log(`stdout: ${stdout}`);
              
              command = `sudo wpa_cli -i wlan0 enable_network ${net_id}`;
              exec(command,(err,stdout,stderr)=>{
                if (err) {
                  console.log(`error: ${err.message}`);
                  return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                
                command = `sudo wpa_cli -i wlan0 select_network ${net_id}`;
                exec(command,(err,stdout,stderr)=>{
                  if (err) {
                    console.log(`error: ${err.message}`);
                    return;
                  }
                  if (stderr) {
                      console.log(`stderr: ${stderr}`);
                      return;
                  }
                  console.log(`stdout: ${stdout}`);
                  
                });
              });
            });
          }else{
              command = `sudo wpa_cli -i wlan0 enable_network ${net_id}`;
              exec(command,(err,stdout,stderr)=>{
                if (err) {
                  console.log(`error: ${err.message}`);
                  return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                
                command = `sudo wpa_cli -i wlan0 select_network ${net_id}`;
                exec(command,(err,stdout,stderr)=>{
                  if (err) {
                    console.log(`error: ${err.message}`);
                    return;
                  }
                  if (stderr) {
                      console.log(`stderr: ${stderr}`);
                      return;
                  }
                  console.log(`stdout: ${stdout}`);
                  
                });
              });
          }
          
        });
      });
    });
    
  });
}

function addOrUpdateMainSetting(setting_id){
  if(parseInt(setting_id) <= 0 || setting_id == 'undefined')
    return false;
  db_connection.run(`insert into setting(_id) values(?)`,[setting_id],(err)=>{
    if(err){
      console.log(err);
      return false;
    }
  });
  return true;
}

db_connection.query = function (sql, params, queryType) {
  var that = this;
  return new Promise(function (resolve, reject) {

    if(queryType == 'select'){
      that.all(sql, params, function (error, rows) {
        if (error)
          reject(error);
        else
          resolve({ rows: rows });
      });
    }else{
      that.run(sql, params, function (error) {
        if (error)
          reject(error);
        else
          resolve({lastID: this.lastID, changes: this.changes});
      });
    }
    
  });
}

/*checkServer = function(host){
  http.get({host: host, function(res){
    if( res.statusCode == 200 || res.statusCode == 301 ){
      console.log("Website Up and Running ..")
      return true;
    }else{
      console.log("Website down");
      return false;
    }
  }})
}*/
module.exports = router;