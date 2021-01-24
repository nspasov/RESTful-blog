var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override"); // converts html POST requests to PUT requests
var expressSanitizer = require("express-sanitizer"); // removes potential malicious script tags from user inputs

mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true, useUnifiedTopology: true }); // configuring mongo
app.set("view engine", "ejs"); // setting views to be .ejs
app.use(express.static("public")); //serves custom css from 'public' directory
app.use(bodyParser.urlencoded({extended: true})); // sets up body-parser, which parses data from POST requests
app.use(expressSanitizer()); // MUST BE after body-parser
app.use(methodOverride("_method")); // shows what the app should look for overriding


var blogSchema = new mongoose.Schema({ // creates mongo schema for blog 'table'
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now } // sets the default date to when blog is created, instead of user manually typing it
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTful Routes GET

app.get("/", function(req,res){
	res.redirect("/blogs");
});

// Index Route GET
app.get("/blogs", function(req,res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		}else
		{
			res.render("index.ejs", {blogs: blogs});
		}
	});
	
});

// New Route GET
app.get("/blogs/new", function(req,res){
	res.render("new.ejs");
});

// Create Route POST
app.post("/blogs", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body); // express-sanitizer removes <script> tags
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new.ejs");
		}else{
			res.redirect("/blogs");
		}
	});
});

// Show route GET

app.get("/blogs/:id", function(req,res){
	var blog = Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show.ejs", {blog: foundBlog});
		}
	});
});

// Edit route GET

app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit.ejs", {blog: foundBlog});
		}
	});	
});

// Update route PUT

app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){ // params: id, coming data (called blog in html form), callback function
		if(err){
			red.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// Delete route DELETE

app.delete("/blogs/:id", function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("blogs");
		}
	});
});




app.listen(3000, process.env.IP, function(){
	console.log("Server is running!");
});