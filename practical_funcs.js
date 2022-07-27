let util = require('util');
const exec_ = require('child_process').exec;
let exec = util.promisify(exec_)

runCommand = async function(command){
    try{
        return { stdout, stderr} = await exec(command)/*, (error,stdout,stderr)=>{
           
            //console.log(`stdout: ${stdout}`);
            return {"error":error, "stderr":stderr,"stdout":stdout, "status":error == null ? 200 : 401};
          });*/
    }
    catch(err){
        return err;
    }
  
  }
  
validValue = function(values){
   let valid = true;

    values.map(value=>{
      if(value == "undefined" || value == null || value == "" || value == '' || value.length <= 0)
        {
          valid = false;
          return;
        }
    });
    
    return valid;
  }

module.exports.runCommand = runCommand;
module.exports.validValue = validValue;