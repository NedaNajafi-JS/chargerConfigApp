const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const cors = require('cors');
const ip_setting = require('ip');
const {exec} = require('child_process');
const hbs = require("hbs");
const path = require('path');

const setting = require('./setting');
const user = require('./user');
const create_tables = require('./db_setting/create_tables');
const db_connection = require('./db_setting/connection').connection;
/**
 * Create database tables if they do not exist.
 */
create_tables(db_connection);

const flash = require('connect-flash');
const app = express();
const server = http.createServer(app);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Passport middleware
app.use(flash());
app.use(session({secret:"anything"}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/setting', setting);
app.use('/user', user);

app.set('views', path.join(__dirname)) ;
app.set('view engine', 'hbs') ;

function loggedIn(req, res, next){
  if(req.user){
    next();
  }else{
    res.redirect('/');
  }
}
/**
 * If there are settings to get information from the database and display it in the html file using the hbs package.
 */
app.get('/get', loggedIn, function(req,res){
  
  let q = 'SELECT DISTINCT _ID,DATE_Modify,typeValue,serialNO,manufactureAddress,SoftwareVersion,\
              framewareVersion,selfCheck,AUTHENTICATION_TYPE,OPERATIN_MODE,internetConnection,SSID,\
              PASSWORD,maxCurrent,maxVoltage,costValue,OCPPValue_1,OCPPValue_2,OCPPValue_3 FROM SETTING';
     db_connection.get(q,[],(error, row)=>{
       //console.log(row)
      if(row !=undefined)
      {
        var check_rfid="",
            check_qr="",
            disable="",
            opmode_disable="",
            connection_disable="",
            button_disable="";
        if(row.AUTHENTICATION_TYPE!=null)
        {
          if(row.AUTHENTICATION_TYPE==1)
          {
            check_qr="checked";
            disable="disabled";
          }
          else if(row.AUTHENTICATION_TYPE==2)
          {
            check_rfid="checked";
          }
        }
        var check_wifi="",
            check_gsm="",
            check_lan="";
        if(row.OPERATIN_MODE!=null)
        {
          if(row.OPERATIN_MODE==1)
            check_wifi="checked";
          else if(row.OPERATIN_MODE==2)
          {
            check_gsm="checked";
            opmode_disable="disabled";
            connection_disable="disabled";
            button_disable="disabled";
          }
          else if(row.OPERATIN_MODE==3)
          {
            check_lan="checked";
            opmode_disable="disabled";
            connection_disable="disabled";
            button_disable="disabled";
          }
        }
        var check_server="",
            check_client="";
        if(row.internetConnection!=null)
        {
          if(row.internetConnection==1)
            check_server="checked";
          else if(row.internetConnection==2)
          {
            check_client="checked";
            connection_disable="disabled";
            button_disable="disabled";
          }
        }
        
        var today = new Date();
        
        var time = ('0'+today.getHours()).slice(-2) + ":" + ('0'+today.getMinutes()).slice(-2) + ":" + ('0'+today.getSeconds()).slice(-2);
        var date = ('0'+today.getFullYear()).slice(-4)+'-'+('0'+(today.getMonth()+1)).slice(-2)+'-'+('0'+today.getDate()).slice(-2);
        // var date = today.toLocaleDateString("nl",{ // you can skip the first argument
        //   year: "numeric",
        //   month: "2-digit",
        //   day: "2-digit",
        // });
        
        //console.log(today.toLocaleDateString('fa-IR'));
        
        res.render('panel',
          {
            setting_id:row._ID,
            check_qr:check_qr,
            check_rfid:check_rfid,
            disable:disable,
            check_wifi:check_wifi,
            check_gsm:check_gsm,
            check_lan:check_lan,
            opmode_disable:opmode_disable,
            button_disable:button_disable,
            connection_disable:connection_disable,
            check_server:check_server,
            check_client:check_client,
            max_current:row.maxCurrent,
            max_voltage:row.maxVoltage,
            cost_kwh:row.costValue,
            center_system:row.OCPPValue_1,
            charging_p_add:row.OCPPValue_2,
            charging_p_port:row.OCPPValue_3,
            current_date: date,
            curent_time : time
          });
      }
      else
      {
        res.render('panel',
        {
          setting_id:0,
          dis_name:true,
          dis_id:true,
        });
      }
     });
});
app.get('/', (req,res) => {
  let err_str = "";
  let errors = req.flash("error");
  errors.map(err => {
    err_str += err;
    err_str += " \n ";
  });
  
  if(err_str.length <= 0){
    res.sendFile(__dirname + '/static/login.html');
  }else{
    res.status(401).send(err_str).end();
  }
  
});

app.use(express.static('static'));

/**
 * 'netsh wlan show profiles' - windows, get all available wifi ssids
 * 'sudo iwlist wlan0 scan | grep ESSID' - Linux, get all available wifi ssids
 * 'date -s "2 OCT 2006 18:00:00"' - Linux, set new data to 2 Oct 2006 18:00:00, type the following command as root user
 * 
 * #! /bin/bash - Linux, create a bash file to config wifi setting
 * ifconfig wlan0
 * iwconfig wlan0 essid NETWORK_NAME key WIRELESS_KEY
 * dhclient wlan0
 * 
 * ping [option] hostname or IP address
 */


/**
 * Listen to server-ip on port 5000
 * The ip of the server which code is running on, is found by "ip module".
 * The ip module can be installed by "npm i ip".
 * The address() function returns IpV4.
 */
const port = process.env.PORT || 5001;
const ip = ip_setting.address();
console.log(ip);
server.listen(port, ip, () => console.log(`Server running on port ${port} and Ip address ${ip}`));