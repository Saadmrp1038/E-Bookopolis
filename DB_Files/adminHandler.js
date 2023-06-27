const oracledb = require('oracledb')
const bcrypt = require('bcrypt');
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//Check If Admin Credentials Are Valid (1)
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
          'SELECT * FROM ADMINDATA WHERE USERNAME = :var1 AND PASSWORD = :var2',
          {
            var1: usernameLogin,
            var2: passwordLogin
          }
        )
        //ok=await bcrypt.compare(passwordLogin,result.rows[0][3])
        //console.log(usernameLogin,passwordLogin,result.rows[0][0],ok)

    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            if(result.rows.length===1) return result
            else return 0
            
        }
    }
}

//Check ISBN Validity (2)
async function isISBNValid(ISBN){
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
          'SELECT * FROM BOOKS WHERE ISBN = :var1',
          {
            var1: ISBN
          }
        )
        //ok=await bcrypt.compare(passwordLogin,result.rows[0][3])
        //console.log(usernameLogin,passwordLogin,result.rows[0][0],ok)

    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            if(result.rows.length===1) return false
            else return true
            
        }
    }
}
 
//Check AuthorID Validity (3)
async function isAuthorIDValid(AuthorID){
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
          'SELECT * FROM AUTHOR WHERE AuthorID = :var1',
          {
            var1: AuthorID
          }
        )
        //ok=await bcrypt.compare(passwordLogin,result.rows[0][3])
        //console.log(usernameLogin,passwordLogin,result.rows[0][0],ok)

    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            if(result.rows.length===1) return false
            else return true
            
        }
    }
}

//Check PublisherID Validity (4)
async function isPublisherIDValid(PublisherID){
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
          'SELECT * FROM PUBLISHER WHERE PublisherID = :var1',
          {
            var1: PublisherID
          }
        )
        //ok=await bcrypt.compare(passwordLogin,result.rows[0][3])
        //console.log(usernameLogin,passwordLogin,result.rows[0][0],ok)

    }
    catch(e){
        console.log('exception',e)
    }
    finally{
        if(connection){
            await connection.close()
            if(result.rows.length===1) return false
            else return true
            
        }
    }
}

//Add Book (5)
async function addBook(ISBN,Title,Author,Publisher,Description,PublishDate,Language,Edition,Price,Page,Rating,NoR,Quantity){
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
          'begin adminhandler5(:var1,:var2,:var3,:var4,:var5,:var6,:var7,:var8,:var9,:var10,:var11,:var12,:var13,:var14); end;',
          {
            var1: ISBN,
            var2: Title,
            var3: Author,
            var4: Description,
            var5: Rating,
            var6: NoR,
            var7: Price,
            var8: Price,
            var9: PublishDate,
            var10: Language,
            var11: Edition,
            var12: Page,
            var13: Quantity,
            var14: Publisher,
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

//Add Author (6)
async function addAuthor(AuthorID,Name,BDay,Summary,Country){
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
          'begin adminhandler6(:var1,:var2,:var3,:var4,:var5); end;',
          {
            var1: AuthorID,
            var2: Name,
            var3: BDay,
            var4: Summary,
            var5: Country,
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

//Add Publisher (7)
async function addPublisher(PublisherID,Name,Summary){
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
          'begin adminhandler7(:var1,:var2,:var3); end;',
          {
            var1: PublisherID,
            var2: Name,
            var3: Summary,
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

//Remove Book (8)
async function removeBook(ISBN){
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
          'begin adminhandler8(:var1); end;',
          {
            var1: ISBN,
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

//Remove Author (9)
async function removeAuthor(AuthorID){
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
          'begin adminhandler9(:var1); end;',
          {
            var1: AuthorID,
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

//Remove Publisher (10)
async function removePublisher(PublisherID){
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
          'begin adminhandler10(:var1); end;',
          {
            var1: PublisherID,
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

module.exports = {
    loginVerification: loginVerification,
    addBook: addBook,
    addAuthor: addAuthor,
    addPublisher: addPublisher,
    isISBNValid: isISBNValid,
    isAuthorIDValid: isAuthorIDValid,
    isPublisherIDValid: isPublisherIDValid,
    removeBook: removeBook,
    removeAuthor: removeAuthor,
    removePublisher: removePublisher
}