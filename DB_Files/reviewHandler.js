const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect


//Save User Review
async function saveReview(ISBN,USERID,USERNAME,RATING,REVIEW){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
        'begin reviewhandler1(:var1, :var2, :var3, :var4, :var5); end;',
         {
            var1: ISBN,
            var2: USERID,
            var3: USERNAME,
            var4: RATING,
            var5: REVIEW,
         },{autoCommit: true}    
        )
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

//Get All Review For A Book
async function getBookReviews(ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BOOKREVIEW WHERE ISBN = :var1 '+
            'ORDER BY POSTDATE DESC',
        {
            var1: ISBN,
        })
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
    saveReview: saveReview,
    getBookReviews : getBookReviews
}