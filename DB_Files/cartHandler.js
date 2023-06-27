const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function sendToCart(userID,ISBN,amount,price){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'begin carthandler1(:var1, :var2 , :var3, :var4); end;',
          {
            var1: userID,
            var2: ISBN,
            var3: amount,
            var4: price
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
// async function isInCart(userID,ISBN){
//     let connection
//     let result
//     try{
//          connection = await oracledb.getConnection({
//             user: Oracle_User,
//             password: Oracle_Password,
//             connectString: Oracle_Connect
//         })
//         result = await connection.execute(
//           'select count(*) from cart where USERID = :var1 and ISBN = :var2 ',
//           {
//             var1: userID,
//             var2: ISBN
//           }
//         )
//         //console.log(result)
//     }
//     catch(e){
//         console.log('exception',e)
//     }
//     finally{
//         if(connection){     
//             await connection.close()
//             if(result.rows[0][0]===0) return false
//             else return true
//         }
//     }
// }

async function isInCart(userID,ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        const query='begin :RET := carthandler2(:userID,:ISBN); end;'

        const binds={userID,ISBN,RET:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}
        options = {
            outFormat: oracledb.OBJECT   // query result format
        };
        result = await connection.execute(query,binds,options)
           
        console.log(result)
        //console.log(result)
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

// Get User Cart Infromation
async function getCartInfo(userID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'SELECT B.ISBN,B.Title,B.Author,B.Description,B.Rating,B.Number_Of_Ratings,B.Hard_Copy_Price,B.Soft_Copy_Price,B.Publish_Date,B.Language,B.Edition,B.Pages,B.Hard_Copy_Quantity,B.Publisher,C.Amount FROM BOOKS B JOIN CART C ON(C.ISBN=B.ISBN) WHERE C.userID = :var1 ORDER BY ISBN',
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

//Increase Cart Book Amount
async function increaseAmount(userID,ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'begin carthandler4(:var1, :var2); end;',
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

//Increase Cart Book Amount
async function decreaseAmount(userID,ISBN){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'begin carthandler5(:var1, :var2); end;',
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

//Remove Book From Cart
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
          'begin carthandler6(:var1, :var2); end;',
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

//Get Book Amount In Cart For User
async function getBookCount(userID){
    let connection
    let result
    try{
        connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })

        const query='begin :RET := carthandler7(:userID); end;'

        const binds={userID,RET:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}
        options = {
            outFormat: oracledb.OBJECT   // query result format
        };
        result = await connection.execute(query,binds,options)
           
        console.log(result.outBinds.RET)
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
    sendToCart: sendToCart,
    isInCart  : isInCart,
    getCartInfo: getCartInfo,
    increaseAmount: increaseAmount,
    decreaseAmount: decreaseAmount,
    removeBook: removeBook,
    getBookCount: getBookCount
}