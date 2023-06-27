const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function getAllPublishers(){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM PUBLISHER')
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

//Get Publisher Info
async function getPublisherInfo(PublisherID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM PUBLISHER WHERE PublisherID = :var1',
        {
            var1: PublisherID
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

//Get Book By This Publisher
async function getPublisherBooks(PublisherName){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute("SELECT * FROM BOOKS WHERE PUBLISHER LIKE :var1 ",
        {
            var1: '%'+PublisherName+'%'
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

//Get Publisher ID
async function getID(PublisherName){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute("SELECT PublisherID FROM PUBLISHER WHERE NAME LIKE :var1 ",
        {
            var1: '%'+PublisherName+'%'
        })
        //console.log(result)
    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){     
            await connection.close()
            return result.rows[0][0]
        }
    }
}
 
module.exports = {
    getAllPublishers:getAllPublishers,
    getPublisherInfo:getPublisherInfo,
    getPublisherBooks:getPublisherBooks,
    getID: getID
}