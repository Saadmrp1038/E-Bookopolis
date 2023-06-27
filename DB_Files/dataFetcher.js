const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function getAllBooks(){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BOOKS ORDER BY ISBN')
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

//Get Info On A Book
async function getBook(ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BOOKS WHERE ISBN = :var1',{
            var1:ISBN
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

//Get Book Quantity
async function getAmount(ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT Hard_copy_quantity FROM BOOKS WHERE ISBN = :var1',{
            var1:ISBN
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
    getAllBooks: getAllBooks,
    getBook : getBook,
    getAmount: getAmount
}