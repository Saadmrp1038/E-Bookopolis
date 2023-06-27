const oracledb = require('oracledb')
const bcrypt = require('bcrypt');
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//Update User Data
async function updateUserData(oldusername,username,email,mobile,address){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('begin userhandler1(:var1, :var2, :var3, :var4, :var5); end;',
        {
            var1: username,
            var2: email,
            var3: mobile,
            var4: address,
            var5: oldusername
         },{autoCommit: true}
        )
        //console.log(result)
    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
        }
    }
}

//Get User Data
async function getUserData(username){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        }) 
        result = await connection.execute('SELECT * FROM USERDATA WHERE USERNAME= :var1',
        {
            var1: username
        })
        //console.log(result)
    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            return result
        }
    }
}

module.exports = {
    updateUserData : updateUserData,
    getUserData: getUserData
}