const oracledb = require('oracledb')
require('dotenv').config()

const Oracle_User = process.env.Oracle_User
const Oracle_Password = process.env.Oracle_Password
const Oracle_Connect = process.env.Oracle_Connect

//See All Rows of Database
async function searchBooks(Title,Author,Publisher,category1,category2){
    let connection
    let result
    try{
         connection = await oracledb.getConnection({
            user: Oracle_User,
            password: Oracle_Password,
            connectString: Oracle_Connect
        })
        result = await connection.execute('SELECT * FROM BOOKS WHERE '+
        'LOWER(Title) Like LOWER(:var1) AND '+
        'LOWER(Author) Like LOWER(:var2) AND '+
        'LOWER(Publisher) Like LOWER(:var3) AND '+
        'BOOKS.ISBN IN ( '+
        'SELECT DISTINCT ISBN '+
        'FROM BookCategory '+
        'WHERE LOWER(Category) = LOWER(:var4) OR :var4 IS NULL '+
        'INTERSECT '+
        'SELECT DISTINCT ISBN '+
        'FROM BookCategory '+
        'WHERE LOWER(Category) = LOWER(:var5) OR :var5 IS NULL '+
        ') '+
        'ORDER BY ISBN ',
        {
            var1:'%'+Title+'%',
            var2:'%'+Author+'%', 
            var3:'%'+Publisher+'%',
            var4:category1,
            var5:category2 
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
    searchBooks: searchBooks
}