const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function placeOrder(OrderID,ISBN,UserID,BookType,TransactionId,Amount,DelivaryAddress,Price,PaymentMethod,OrderStatus,Title){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute( 'INSERT INTO ORDERS (OrderID,ISBN,UserId,BookType,TransactionId,Amount,DelivaryAddress,Price,PaymentMethod,OrderStatus,PurchaseDate,Title)'+ 
            'VALUES (:var1,:var2,:var3,:var4,:var5,:var6,:var7,:var8,:var9,:var10,sysdate,:var11)',
          {
            var1: OrderID,
            var2: ISBN,
            var3: UserID,
            var4: BookType,
            var5: TransactionId,
            var6: Amount,
            var7: DelivaryAddress,
            var8: Price,
            var9: PaymentMethod,
            var10: OrderStatus,
            var11: Title
          },{autoCommit: true})
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

//Get Unique Order Count
async function getUniqueOrderCount(){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT COUNT (DISTINCT OrderID) FROM ORDERS')
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

//Get User Order Info
async function getOrderInfo(userID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
        'SELECT OrderID,ISBN,UserId,BookType,TransactionId,Amount,DelivaryAddress,Price,PaymentMethod,OrderStatus,PurchaseDate,Title '+
        'FROM ORDERS WHERE UserID = :var1 '+
        'ORDER BY OrderID',
         {
            var1: userID,
         }    
        )
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

//Get Specific User Order Info
async function getSpecificOrderInfo(userID,orderID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
        'SELECT OrderID,ISBN,UserId,BookType,TransactionId,Amount,DelivaryAddress,Price,PaymentMethod,OrderStatus,PurchaseDate,Title '+
        'FROM ORDERS WHERE UserID = :var1 AND OrderID = :var2 '+
        'ORDER BY OrderID',
         {
            var1: userID,
            var2: orderID
         }    
        )
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
    placeOrder:placeOrder,
    getUniqueOrderCount:getUniqueOrderCount,
    getOrderInfo:getOrderInfo,
    getSpecificOrderInfo:getSpecificOrderInfo
}