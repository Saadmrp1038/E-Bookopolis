const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function sendToWishlist(userID,ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'begin wishlisthandler1(:var1, :var2); end;',
          {
            var1: userID,
            var2: ISBN,
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

//Check If Book Is Already In Cart
async function isInWishlist(userID,ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        const query='begin :RET := wishlisthandler2(:userID,:ISBN); end;'

        const binds={userID,ISBN,RET:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}
        options = {
            outFormat: oracledb.OBJECT   // query result format
        };
        result = await connection.execute(query,binds,options)
           
        console.log(result)
    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){     
            await connection.close()
            if(result.outBinds.RET===0) return false
            else return true
        }
    }
}

// Get User Wishlist Infromation
async function getWishlistInfo(userID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'SELECT B.ISBN,B.Title,B.Author,B.Description,B.Rating,B.Number_Of_Ratings,B.Hard_Copy_Price,B.Soft_Copy_Price,B.Publish_Date,B.Language,B.Edition,B.Pages,B.Hard_Copy_Quantity,B.Publisher FROM BOOKS B JOIN WISHLIST W ON(W.ISBN=B.ISBN) WHERE W.userID = :var1 ORDER BY ISBN',
          {
            var1: userID,
          }
        )
        //console.log(result.rows[0])
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

//Remove Book From Wishlist
async function removeBook(userID,ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'begin wishlisthandler4(:var1, :var2); end;',
          {
            var1: userID,
            var2: ISBN
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

//Get Book Amount In Wishlist For User
async function getBookCount(userID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        const query='begin :RET := wishlisthandler5(:userID); end;'

        const binds={userID,RET:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}
        options = {
            outFormat: oracledb.OBJECT   // query result format
        };
        result = await connection.execute(query,binds,options)
           
        console.log("wishlist",result)
        //console.log(result)
    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){     
            await connection.close()
            return result.outBinds.RET
        }
    }
}
 
//Remove Book From Cart For A User After Order Is Placed

module.exports = {
    sendToWishlist: sendToWishlist,
    isInWishlist  : isInWishlist,
    getWishlistInfo: getWishlistInfo,
    removeBook: removeBook,
    getBookCount: getBookCount
}