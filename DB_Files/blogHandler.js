const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function getAllBlogs(){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BLOG ORDER BY BLOGID')
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

//Get Info On A Blog
async function getBlog(BlogID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BLOG WHERE BlogID = :var1',{
            var1:BlogID
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

//Get Blog Comment
async function getComment(BlogID){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BLOGCOMMENT WHERE BlogID = :var1 ORDER BY POSTDATE',{
            var1:BlogID
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

//Submit Blog
async function submitBlog(userID,username,title,text){
    let connection
    let result
    try{       
        connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'INSERT INTO BLOG (UserID,Username,Title,Text,PostDate) VALUES (:var1,:var2,:var3,:var4,SYSDATE)',
          {
            var1: userID,
            var2: username,
            var3: title,
            var4: text,
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

//Submit Comment
async function submitComment(blogID,userID,username,text){
    let connection
    let result
    try{       
        connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute(
          'INSERT INTO BLOGCOMMENT (BlogID,UserID,Username,PostDate,Text) VALUES (:var1,:var2,:var3,SYSDATE,:var4)',
          {
            var1: blogID,
            var2: userID,
            var3: username,
            var4: text,
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
module.exports = {
    getAllBlogs: getAllBlogs,
    getBlog : getBlog,
    submitBlog: submitBlog,
    submitComment: submitComment,
    getComment: getComment
}