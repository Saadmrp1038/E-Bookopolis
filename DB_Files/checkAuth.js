const oracledb = require('oracledb')
const bcrypt = require('bcrypt')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function selectValues(){
    let connection
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        const result = await connection.execute('SELECT * FROM USERDATA')
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

//Check If User Credentials Are Valid 
async function loginVerification(usernameLogin,passwordLogin){
    let connection
    let result
    let ok
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'SELECT * FROM USERDATA WHERE USERNAME = :var1',
          {
            var1: usernameLogin
          }
        )
        ok=await bcrypt.compare(passwordLogin,result.rows[0][3])
        //console.log(usernameLogin,passwordLogin,result.rows[0][0],ok)

    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            if(ok) return result
            else return 0
            
        }
    }
}


//Register New User 
async function registerUser(usernameSignUp,passwordSignUp,emailSignUp,genderSignUp,mobileSignUp,addressSignUp){
    let connection
    let result
    try{

        const salt =  await bcrypt.genSalt()
        const hashedPasswordSignUp = await bcrypt.hash(passwordSignUp,salt)   
        
        connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'INSERT INTO UserData (USERNAME,EMAIL,PASSWORD,GENDER,MOBILE,DELIVARYADDRESS) VALUES (:var1,:var2,:var3,:var4,:var5,:var6)',
          {
            var1: usernameSignUp,
            var2: emailSignUp,
            var3: hashedPasswordSignUp,
            var4: genderSignUp,
            var5: mobileSignUp,
            var6: addressSignUp
          },{autoCommit: true}
        )
        //console.log(usernameSignUp,passwordSignUp,emailSignUp)
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

//Check If Username Is Already IN USE
async function checkUser(usernameSignUp){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'SELECT USERNAME FROM USERDATA WHERE USERNAME = :var1 UNION ALL SELECT USERNAME FROM ADMINDATA WHERE USERNAME = :var1',
          {
            var1: usernameSignUp
          }
        )
        //console.log(usernameSignUp,result.data)
    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            if(result.rows.length===0) return false
            else return true
        }
    }
}

//Get User Count
async function getUserCount(){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT COUNT(*) FROM USERDATA')
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
    selectValues: selectValues,
    loginVerification:loginVerification,
    registerUser: registerUser,
    checkUser   : checkUser,
    getUserCount:getUserCount
}