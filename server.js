const authUtil = require('./DB_Files/checkAuth.js')
const dataUtil = require('./DB_Files/dataFetcher.js')
const cartUtil = require('./DB_Files/cartHandler.js')
const orderUtil = require('./DB_Files/orderHandler.js')
const authorUtil = require('./DB_Files/authorHandler.js')
const publisherUtil = require('./DB_Files/publisherHandler.js')
const userUtil = require('./DB_Files/userHandler.js')
const wishlistUtil = require('./DB_Files/wishlistHandler.js')
const reviewUtil = require('./DB_Files/reviewHandler.js')
const adminUtil = require('./DB_Files/adminHandler.js')
const searchUtil = require('./DB_Files/searchHandler.js')
const blogUtil = require('./DB_Files/blogHandler.js')
const session = require('express-session')
const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const swal = require('sweetalert');
const pjax = require('express-pjax');
const port = 9000
const app = express()
 
app.use(bodyParser.json()); //Handles JSON requests
app.use(bodyParser.urlencoded({ extended: false })); //Handles normal post requests

app.use(cors());

app.use(session({resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', cookie: { maxAge: 1000*60*60*24 }}));
app.use(function(req,res,next){
	res.set('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0')
	next()
})
app.use(express.static(__dirname + '/views'));
app.set("view engine","ejs")

// alertType=0  No alert
// alertType=1 Login Failed
// alertType=2 Login Successful	
// alertType=3 SignUp Failed
// alertType=4 SignUp Sucessful
// alertType=101 ISBN Invalid
// alertType=102 ISBN Valid,Add Book Successful
// alertType=103 AuthorID Invalid
// alertType=104 AuthorID Valid,Add Author Successful
// alertType=105 PublisherID Invalid
// alertType=106 PublisherID Valid,Add Publisher Successful
// alertType=51 User Profile Change Successful
// alertType=52 User Profile Change UnSuccessful(Name Already Exists)

app.get("/",async function(req,res){
	return res.redirect("/auth/login")
})
 
//Login Page
app.all("/auth/login",async function(req,res){
	if(req.session.alertType){
		let alertType = req.session.alertType
		req.session.alertType=0;
		res.render("auth/login_page",{alert:alertType})
	}
	else{
		res.render("auth/login_page",{alert:0})
	}
})

//Verify Login 
app.post('/auth/verify',async function(req,res){
	const usernameLogin = req.body.usernameLogin
	const passwordLogin = req.body.passwordLogin

	const isAdmin = await adminUtil.loginVerification(usernameLogin,passwordLogin)
	if(isAdmin!==0){
		req.session.alertType=2
		req.session.userID=isAdmin.rows[0][0]
		req.session.username=isAdmin.rows[0][1]
		return res.redirect("/admin/home")
	}

	authUtil.loginVerification(usernameLogin,passwordLogin).then(result=>{

		//console.log(usernameLogin,passwordLogin,result)
		if(result!==0){
			req.session.alertType=2
			req.session.userID=result.rows[0][0]
			req.session.username=result.rows[0][1]
			req.session.userdata=result
			return res.redirect("/user/home")
		}
		else{		
			  req.session.alertType=1;
			  return res.redirect("/auth/login")			  
		}
 
	})
	//res.render("home",{data:true})
}) 

//User Home
app.all("/user/home",async function(req,res){
	let alertType = req.session.alertType
	req.session.alertType=0;
	req.session.page="home"

	//Only For Testing
	// req.session.userID=1;
	// req.session.username=0;
	 
	//console.log(req.session.userID,req.session.username)
	const wishlistData = await wishlistUtil.getWishlistInfo(req.session.userID)
	const cartData = await cartUtil.getCartInfo(req.session.userID)


	req.session.cartAmount = await cartUtil.getBookCount(req.session.userID);
	req.session.wishlistAmount = await wishlistUtil.getBookCount(req.session.userID);

	dataUtil.getAllBooks().then(result=>{ 
		//console.log(result.rows[0][1])	 	
		res.render("user/home_page",{alert: alertType,data: result,wishlistAmount:req.session.wishlistAmount,username:req.session.username,cartAmount: req.session.cartAmount,wishlistData: wishlistData,cartData: cartData})
	})
	
}) 
 
//Signup
app.all("/auth/signup",async function(req,res){
	let alertType = req.session.alertType
	req.session.alertType=0;
	res.render("auth/signup_page",{alert: alertType})
})

//Opening New Account
app.post("/auth/new_account", async function(req,res){
	const usernameSignUp = req.body.usernameSignUp
	const passwordSignUp = req.body.passwordSignUp
	const emailSignUp = req.body.emailSignUp
	const genderSignUp = req.body.genderSignUp
	const mobileSignUp = req.body.mobileSignUp
	const addressSignUp = req.body.addressSignUp

	authUtil.checkUser(usernameSignUp).then(result=>{
		if(result===false){
			req.session.alertType=4
				authUtil.getUserCount().then(result=>{	
					authUtil.registerUser(usernameSignUp,passwordSignUp,emailSignUp,genderSignUp,mobileSignUp,addressSignUp)	
					return res.redirect("/auth/login")
			})	
		}
		else{
			req.session.alertType=3
			return res.redirect("/auth/signup")
		}
	})

})

//User Cart
app.all("/user/cart",async function(req,res){
	req.session.page="cart"
	cartUtil.getCartInfo(req.session.userID).then(result=>{
		res.render("user/cart",{username: req.session.username,data: result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
	})
})
 
//Add Item To Cart From
app.post("/user/cart/details_addBook",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID
	const price = req.body.price
	const amount = 1

    const result = await cartUtil.sendToCart(userID,ISBN,amount,price)
    const Amount = await dataUtil.getAmount(ISBN)
	req.session.cartAmount++;

	if(req.session.page==="home"){
		return res.redirect("/user/home")
	}
	else if(req.session.page==="cart"){
		return res.redirect("/user/cart")
	}
	else if(req.session.page==="wishlist"){
		return res.redirect("/user/wishlist")
	}
	else if(req.session.page==="book_details"){
		return res.redirect("/user/book_details")
	}
	
})

//Remove Book From Cart
app.all("/user/cart/removeBook",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID

	cartUtil.removeBook(userID,ISBN).then(result=>{
		req.session.cartAmount--;

		if(req.session.page==="home"){
			return res.redirect("/user/home")
		}
		else if(req.session.page==="cart"){
			return res.redirect("/user/cart")
		}
		else if(req.session.page==="wishlist"){
			return res.redirect("/user/wishlist")
		}
		else if(req.session.page==="book_details"){
			return res.redirect("/user/book_details")
		}
	})
})

//Add Item To Cart From Home
app.post("/user/cart/addBook",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID
	const price = req.body.price
	const amount = 1


	cartUtil.sendToCart(userID,ISBN,amount,price).then(result=>{
		req.session.cartAmount++;

		if(req.session.page==="home"){
			return res.redirect("/user/home")
		}
		else if(req.session.page==="cart"){
			return res.redirect("/user/cart")
		}
		else if(req.session.page==="wishlist"){
			return res.redirect("/user/wishlist")
		}
		else if(req.session.page==="book_details"){
			return res.redirect("/user/book_details")
		}
	})	
	
})

//Increase Amount
app.post("/user/cart/increase_amount",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID

	cartUtil.increaseAmount(userID,ISBN).then(result=>{
		cartUtil.getCartInfo(req.session.userID).then(result=>{
			return res.redirect("/user/cart")
		}) 
	})
})

//Decrease Amount
app.post("/user/cart/decrease_amount",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID

	cartUtil.decreaseAmount(userID,ISBN).then(result=>{
		cartUtil.getCartInfo(req.session.userID).then(result=>{
			return res.redirect("/user/cart")
		}) 
	})
})

//See Book Details
app.all("/user/book_details",async function(req,res){

	var ISBN = req.body.ISBN
	console.log(ISBN)
	req.session.page="book_details"
	if(typeof ISBN==='undefined'){
		ISBN = req.session.ISBN
	}
	else{
		req.session.ISBN = ISBN
	}
	const userID = req.session.userID

	const isWishlisted = await wishlistUtil.isInWishlist(req.session.userID,ISBN)
	const isCarted = await cartUtil.isInCart(req.session.userID,ISBN)

	const reviewData = await reviewUtil.getBookReviews(ISBN)
	const result = await dataUtil.getBook(ISBN)
	const publisherID = await publisherUtil.getID(result.rows[0][13])
	const authorID = await authorUtil.getID(result.rows[0][2])

	res.render("user/book_details",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,reviewData: reviewData,isWishlisted: isWishlisted,isCarted: isCarted,publisherID:publisherID,authorID:authorID})

})
 
//Write Review
app.all("/user/review",async function(req,res){
	req.session.page="review"
	const ISBN = req.session.ISBN
	const userID = req.session.userID
	
	dataUtil.getBook(ISBN).then(result=>{
		res.render("user/review",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
	})
})

//Submit Review
app.all("/user/review/submit",async function(req,res){
	const ISBN = req.session.ISBN
	const userID = req.session.userID
	const username = req.session.username
	var rating = req.body.stars
	const review = req.body.reviewText

   	if(typeof rating==='undefined') rating=0;

	await reviewUtil.saveReview(ISBN,userID,username,rating,review)

	//console.log(req.body.stars,req.body.reviewText)
	return res.redirect("/user/book_details")
})

//Order Page
app.all("/user/order",async function(req,res){
	const userID = req.session.userID
	req.session.page="order"

	cartUtil.getCartInfo(userID).then(result=>{
		if(result.rows.length!==0){
			res.render("user/order",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,userdata:req.session.userdata})
		}
		else{
			return res.redirect("/user/cart")
		}
	})
})

//Place Order
app.all("/user/order/place_order",async function(req,res){
	const userID = req.session.userID
	const orderID = await orderUtil.getUniqueOrderCount()+1
	const result = await cartUtil.getCartInfo(userID)
	const delivaryAddress = req.body.DelivaryAddress

	//Not yet implemented fully
	//-----------------------------------------------//
	const bookType = "Hard Copy"
	const transactionID = userID;
	const paymentMethod = req.body.PaymentMethod	
	const orderStatus = "To Be Delivered"
	//-----------------------------------------------//
	console.log(paymentMethod)

	var ISBN,price,amount,title

	for(var i=0; i < result.rows.length; i++){
		ISBN=result.rows[i][0]
		price=result.rows[i][6]
		amount=result.rows[i][14]
		title=result.rows[i][1]

		orderUtil.placeOrder(orderID,ISBN,userID,bookType,transactionID,amount,delivaryAddress,price,paymentMethod,orderStatus,title)
	} 

	return res.redirect("/user/home")

})

//Author Page
app.all("/user/author",async function(req,res){
	req.session.page="author"
	const userID = req.session.userID
	const result = await authorUtil.getAllAuthors()
	res.render("user/author",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//Author Details
app.all("/user/author_details",async function(req,res){
	req.session.page="author_details"
	const userID = req.session.userID
	const AuthorID = req.body.AuthorID
	const AuthorName = req.body.AuthorName

	const authorInfo = await authorUtil.getAuthorInfo(AuthorID)
	const bookInfo = await authorUtil.getAuthorBooks(AuthorName)

	res.render("user/author_details",{username: req.session.username,data:authorInfo,bookInfo:bookInfo,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//Publisher Page
app.all("/user/publisher",async function(req,res){
	req.session.page="publisher"
	const userID = req.session.userID
	const result = await publisherUtil.getAllPublishers()
	
	res.render("user/publisher",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//Publisher Details
app.all("/user/publisher_details",async function(req,res){
	req.session.page="publisher_details"
	const userID = req.session.userID
	const PublisherID = req.body.PublisherID
	const PublisherName = req.body.PublisherName

	const publisherInfo = await publisherUtil.getPublisherInfo(PublisherID)
	const bookInfo = await publisherUtil.getPublisherBooks(PublisherName)
	//console.log(PublisherName,bookInfo)
	res.render("user/publisher_details",{username: req.session.username,data:publisherInfo,bookInfo:bookInfo,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//Order History Page 
app.all("/user/order_history",async function(req,res){
	req.session.page="order_history"
	const userID = req.session.userID
	const result = await orderUtil.getOrderInfo(userID)

	res.render("user/order_history",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//Order History DetailsPage
app.all("/user/order_history_details",async function(req,res){
	req.session.page="order_history_details"
	const userID = req.session.userID
	const orderID = req.body.orderID
	const result = await orderUtil.getSpecificOrderInfo(userID,orderID)	
	res.render("user/order_history_details",{username: req.session.username,data:result,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//User Profile
app.all("/user/user_profile",async function(req,res){
	req.session.page="user_profile"
	const alertType=req.session.alertType
	req.session.alertType=0;

	res.render("user/user_profile",{alert:alertType,username: req.session.username,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,userdata:req.session.userdata})
})

//User Profile Save Changes
app.all("/user/user_profile/save_changes",async function(req,res){
	const oldusername = req.session.username
	const username = req.body.username
	const email = req.body.email
	const mobile = req.body.mobile
	const address = req.body.address

	const bool = await authUtil.checkUser(username)

	if(bool==0){
		await userUtil.updateUserData(oldusername,username,email,mobile,address)
		const result = await userUtil.getUserData(username)

		req.session.username=result.rows[0][1]
		req.session.userdata=result
		req.session.alertType=51
	}
	else{
		req.session.alertType=52
	}
	return res.redirect("/user/user_profile")
})

//Wishlist
app.all("/user/wishlist",async function(req,res){
	req.session.page="wishlist"
	const wishlistData = await wishlistUtil.getWishlistInfo(req.session.userID)
	const cartData = await cartUtil.getCartInfo(req.session.userID)

	//console.log(cartData)

	res.render("user/wishlist",{username: req.session.username,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,data:wishlistData,cartData: cartData})
})

//Add Book To Wishlist
app.post("/user/wishlist/addBook",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID
 
	console.log(userID,ISBN)
	wishlistUtil.sendToWishlist(userID,ISBN).then(result=>{
		req.session.wishlistAmount++;

		if(req.session.page==="home"){
			return res.redirect("/user/home")
		}
		else if(req.session.page==="cart"){
			return res.redirect("/user/cart")
		}
		else if(req.session.page==="wishlist"){
			return res.redirect("/user/wishlist")
		}
		else if(req.session.page==="book_details"){
			return res.redirect("/user/book_details")
		}
	})		
})

//Remove Book From Wishlist
app.all("/user/wishlist/removeBook",async function(req,res){
	const ISBN = req.body.ISBN
	const userID = req.session.userID

	wishlistUtil.removeBook(userID,ISBN).then(result=>{
		req.session.wishlistAmount--;
		if(req.session.page==="home"){
			return res.redirect("/user/home")
		}
		else if(req.session.page==="cart"){
			return res.redirect("/user/cart")
		}
		else if(req.session.page==="wishlist"){
			return res.redirect("/user/wishlist")
		}
		else if(req.session.page==="book_details"){
			return res.redirect("/user/book_details")
		}
	})
})

//Blog
app.all("/user/blog",async function(req,res){
	req.session.page="/user/blog"
	const blogData = await blogUtil.getAllBlogs()
	res.render("user/blog",{username: req.session.username,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,blogData: blogData})
})


//Write Blog
app.all("/user/write_blog",async function(req,res){
	req.session.page="/user/write_blog"
	res.render("user/write_blog",{username: req.session.username,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount})
})

//Submit Blog
app.all("/user/write_blog/submit",async function(req,res){
	req.session.page="/user/write_blog/submit"

	const blogTitle = req.body.blogTitle
	const blogText  = req.body.blogText
	const userID    = req.session.userID
	const username  = req.session.username

	await blogUtil.submitBlog(userID,username,blogTitle,blogText)

	return res.redirect("/user/blog")
})

//Blog Details
app.all("/user/blog_details",async function(req,res){
	req.session.page="/user/blog_details"
	var blogID = req.body.blogID

	if(typeof blogID==='undefined'){
		blogID = req.session.blogID
	}
	else{
		req.session.blogID = blogID
	}
	
	console.log(req.session.blogID)

	const blogData = await blogUtil.getBlog(blogID)
	const blogComment =await blogUtil.getComment(blogID)

	res.render("user/blog_details",{username: req.session.username,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,blogData:blogData,blogComment:blogComment})
})

//Comment Submit
app.all("/user/blog_comment/submit",async function(req,res){
	const blogID = req.body.blogID
	const userID = req.session.userID
	const username = req.session.username
	const commentText = req.body.commentText

	console.log(blogID,userID,username,commentText)

	await blogUtil.submitComment(blogID,userID,username,commentText)

	return res.redirect("/user/blog_details")
})

//Search Page
app.all("/user/search_page",async function(req,res){

	req.session.page="/user/search_page"
	var Title = req.body.Title 
	var Author = req.body.Author
	var Publisher = req.body.Publisher
	var category1 = req.body.category1
	var category2 = req.body.category2

	if(typeof Title==='undefined') Title="";
	if(typeof Author==='undefined') Author="";
	if(typeof Publisher==='undefined') Publisher="";
	if(typeof category1==='undefined') category1="";
	if(typeof category2==='undefined') category2="";


	console.log(Title,Author,Publisher,category1,category2);

	var result = await searchUtil.searchBooks(Title,Author,Publisher,category1,category2)

	const wishlistData = await wishlistUtil.getWishlistInfo(req.session.userID)
	const cartData = await cartUtil.getCartInfo(req.session.userID)
	console.log(result);

	res.render('user/search',{username: req.session.username,cartAmount: req.session.cartAmount,wishlistAmount:req.session.wishlistAmount,data:result,wishlistData: wishlistData,cartData: cartData})
})

//Admin Home
app.all("/admin/home",async function(req,res){
	let alertType = req.session.alertType
	req.session.alertType=0;
	req.session.page="/admin/home"

	dataUtil.getAllBooks().then(result=>{ 	 	
		res.render("admin/admin_home_page",{alert: alertType,data: result,username:req.session.username})
	})
})

//Admin Book Details
app.all("/admin/book_details",async function(req,res){
	var ISBN = req.body.ISBN
	req.session.page="/admin/book_details"
	if(typeof ISBN==='undefined'){
		ISBN = req.session.ISBN
	}
	else{
		req.session.ISBN = ISBN
	}
	const userID = req.session.userID

	const reviewData = await reviewUtil.getBookReviews(ISBN)
	dataUtil.getBook(ISBN).then(result=>{
		//console.log(result.rows[0][1])
		res.render("admin/admin_book_details",{username: req.session.username,data:result,reviewData: reviewData})
	})
})

//Admin Author Page
app.all("/admin/author",async function(req,res){
	req.session.page="/admin/author"
	const userID = req.session.userID
	const result = await authorUtil.getAllAuthors()
	res.render("admin/admin_author",{username: req.session.username,data:result})
})

//Admin Author Details
app.all("/admin/author_details",async function(req,res){
	req.session.page="/admin/author_details"
	const userID = req.session.userID
	const AuthorID = req.body.AuthorID
	const AuthorName = req.body.AuthorName

	const authorInfo = await authorUtil.getAuthorInfo(AuthorID)
	const bookInfo = await authorUtil.getAuthorBooks(AuthorName)

	res.render("admin/admin_author_details",{username: req.session.username,data:authorInfo,bookInfo:bookInfo})
})

//Admin Publisher Page
app.all("/admin/publisher",async function(req,res){
	req.session.page="/admin/publisher"
	const userID = req.session.userID
	const result = await publisherUtil.getAllPublishers()
	
	res.render("admin/admin_publisher",{username: req.session.username,data:result})
})

//Admin Publisher Details
app.all("/admin/publisher_details",async function(req,res){
	req.session.page="/admin/publisher_details"
	const userID = req.session.userID
	const PublisherID = req.body.PublisherID
	const PublisherName = req.body.PublisherName

	const publisherInfo = await publisherUtil.getPublisherInfo(PublisherID)
	const bookInfo = await publisherUtil.getPublisherBooks(PublisherName)
	//console.log(PublisherName,bookInfo)
	res.render("admin/admin_publisher_details",{username: req.session.username,data:publisherInfo,bookInfo:bookInfo})
})

//Admin Add Book Page
app.all("/admin/addBook_page",async function(req,res){
	req.session.page="/admin/addBook_page"
	const userID = req.session.userID
	let alertType = req.session.alertType
	req.session.alertType=0;

	res.render("admin/admin_addBook_page",{alert: alertType,username: req.session.username})
})

//Admin Add Author Page
app.all("/admin/addAuthor_page",async function(req,res){
	req.session.page="/admin/addAuthor_page"
	const userID = req.session.userID
	let alertType = req.session.alertType
	req.session.alertType=0;

	res.render("admin/admin_addAuthor_page",{alert: alertType,username: req.session.username})
})

//Admin Add Publisher Page
app.all("/admin/addPublisher_page",async function(req,res){
	req.session.page="/admin/addPublisher_page"
	const userID = req.session.userID
	let alertType = req.session.alertType
	req.session.alertType=0;

	res.render("admin/admin_addPublisher_page",{alert: alertType,username: req.session.username})
})

//Admin Add Book
app.all("/admin/addBook",async function(req,res){
	const userID = req.session.userID
	const ISBN = req.body.ISBN
	const Title = req.body.Title
	const Author = req.body.Author
	const Publisher = req.body.Publisher
	const Description = req.body.Description
	const PublishDate = new Date(req.body.PublishDate)
	const Language = req.body.Language
	const Edition = req.body.Edition
	const Price = req.body.Price
	const Page = req.body.Page

	const Rating = 0
	const NoR = 0 
	const Quantity=req.body.quantity
	//console.log(PublishDate)
	const ok = await adminUtil.isISBNValid(ISBN)
	if(ok===false){
		req.session.alertType=101
	}
	else{
		await adminUtil.addBook(ISBN,Title,Author,Publisher,Description,PublishDate,Language,Edition,Price,Page,Rating,NoR,Quantity)
		req.session.alertType=102
	}

	return res.redirect("/admin/addBook_page")
})

//Admin Add Author
app.all("/admin/addAuthor",async function(req,res){
	const userID = req.session.userID
	const AuthorID = req.body.AuthorID
	const Name = req.body.Name
	const BDay = new Date(req.body.BDay)
	const Summary = req.body.Summary
	const Country = req.body.Country

	const ok = await adminUtil.isAuthorIDValid(AuthorID)
	if(ok===false){
		req.session.alertType=103
	}
	else{
		await adminUtil.addAuthor(AuthorID,Name,BDay,Summary,Country)
		req.session.alertType=104
	}

	return res.redirect("/admin/addAuthor_page")

})

//Admin Add Publisher
app.all("/admin/addPublisher",async function(req,res){
	const userID = req.session.userID
	const PublisherID = req.body.PublisherID
	const Name = req.body.Name
	const Summary = req.body.Summary

	const ok = await adminUtil.isPublisherIDValid(PublisherID)
	if(ok===false){
		req.session.alertType=105
	}
	else{
		await adminUtil.addPublisher(PublisherID,Name,Summary)
		req.session.alertType=106
	}

	return res.redirect("/admin/addPublisher_page")
})

//Admin Remove Book
app.all("/admin/removeBook",async function(req,res){
	const ISBN = req.body.ISBN

	await adminUtil.removeBook(ISBN)

	return res.redirect(req.session.page)
})

//Admin Remove Author
app.all("/admin/removeAuthor",async function(req,res){
	const AuthorID = req.body.AuthorID

	await adminUtil.removeAuthor(AuthorID)

	return res.redirect(req.session.page)
})

//Admin Remove Publisher
app.all("/admin/removePublisher",async function(req,res){
	const PublisherID = req.body.PublisherID

	await adminUtil.removePublisher(PublisherID)

	return res.redirect(req.session.page)
})

//Logout 
app.all("/user/logout",async function(req,res){
	req.session.destroy()
	return res.redirect("/")
})



app.listen(port,()=>{
	console.log('Server is up at port 9000')
})
