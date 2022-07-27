/**
 * Use serialport modules
 */
var serialPort = require('serialport');
module.exports = {
  mongoURI:
    //"mongodb://mapevir_user:7j0cRn2kY4@46.4.170.146:27017/mapevir_db",
    // "mongodb://mapevir_user:dsoewe_43r@mapnacar.ir:27017/mapevir_db",
    "mongodb://10.19.1.14:27017/dashboard_db",
  secretOrKey: "secret", //todo
    //open the serial port
    //The port on the Linux is /dev/ttyAMA0
    //baudRate is the transmission speed for sending and receiving bits
  /*RFIDPortConfiguration : new serialPort('/dev/ttyAMA0', {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    flowControl: false
  })*/
};