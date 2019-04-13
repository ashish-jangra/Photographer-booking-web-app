const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql')
const cookieParser = require('cookie-parser');
const session = require('express-session');

const dbconn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'hello@world',
    database:'pooja'
}); 

dbconn.connect(function(err){
    if (err){
        console.log(err);
        throw err;
    }
    else{
        console.log("Connected to database");
    }
});

const app=express();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

const server=app.listen(4000,function(){
	console.log("Listening to request on port 4000");
});

app.get("/",function(req,res){
    if(req.session.user.type == "user")
        sql = "select * from users where username = '" + req.session.user.username + "' and password = '" + req.session.user.password + "';";
    else
    sql = "select * from photographers where username = '" + req.session.user.username + "' and password = '" + req.session.user.password + "';";
    dbconn.query(sql,function(err,result){
        console.log("/ request",result);
        if(result){
            res.redirect("/dashboard");
        }
        else{
            res.sendFile(__dirname+"/index.html");
        }
    });
});

app.get("/dashboard",function(req,res){
    console.log("dashbard request",req.session.user);
    if(req.session.user && req.cookies.user_sid && req.session.user.type == "user"){
        res.render("user",req.session.user);
    }
    else if(req.session.user && req.cookies.user_sid && req.session.user.type == "photographer"){
        res.render("photographer",req.session.user);
    }
    else{
        res.redirect("/");
    }
});

app.get("/signup_user",function(req,res){
    res.sendFile(__dirname+"/public/signup.html");
});

app.get("/signup_photographer",function(req,res){
    res.sendFile(__dirname+"/public/register_photographer.html");
});

app.post("/register_user",function(req,res){
    let sql = "select * from users where username = '" + req.body.username + "';";
    dbconn.query(sql,function(err,result){
        if(err){
            console.log(err);
            throw err;
            res.redirect('/');
        }
        else{
            if(result.length>0){
                console.log("user already exists");
                res.redirect('/');
            }
            else{
                req.session.user = {username: req.body.username, password: req.body.password};
                sql = "insert into users values('" + req.body.username + "','" + req.body.name + "','" + req.body.email + "','" + req.body.password + "');";
                dbconn.query(sql,function(err,result){
                    if(err){
                        throw err;
                        res.redirect("/signup_user");
                    }
                    else{
                        console.log("successfully signed up " + req.body.username);
                    }
                });
                res.redirect('/dashboard');
            }
        }
    });
});

app.post("/register_photographer",function(req,res){
    let sql = "select * from photographers where username = '" + req.body.username + "';";
    dbconn.query(sql,function(err,result){
        if(err){
            console.log(err);
            throw err;
            res.redirect('/');
        }
        else{
            if(result.length>0){
                console.log("photographer already exists");
                res.redirect('/');
            }
            else{
                sql = "insert into photographers values('" + req.body.username + "','" + req.body.name + "','" + req.body.email + "','" + req.body.password + "','" + req.body.phone + "','" + req.body.address + "','" + req.body.city +"','" + req.body.profile + "');";
                req.session.user = {username: req.body.username, password: req.body.password};
                dbconn.query(sql,function(err,result){
                    if(err){
                        throw err;
                        res.redirect("/signup_photographer");
                    }
                    else{
                        console.log("registered photographer "+req.body.username);
                    }
                });
                res.redirect("/dashboard");
            }
        }
    });
});

app.post("/login",function(req,res){
    sql = "select * from users where username = '" + req.body.username + "' and password = '" + req.body.password + "';";
    console.log("login query: "+sql);
    dbconn.query(sql,function(err,result){
        if(result){
            console.log(result[0]);
            console.log("logged in");
            req.session.user = {username: req.body.username, password: req.body.password, type: "user"};
            res.redirect("/dashboard");        
        }
        else{
            console.log("wrong username or password");
            res.redirect("/");
        }
    });
});

app.post("/login_photographer",function(req,res){
    sql = "select * from photographers where username = '" + req.body.username + "' and password = '" + req.body.password + "';";
    dbconn.query(sql,function(err,result){
        if(result){
            req.session.user = {username: req.body.username, password: req.body.password, type: "photographer"};
            sql = "select * from bookings where photographer = '" + req.body.photographer + "';";
            dbconn.query(sql,function(err,result){
                if(err){
                    res.redirect("/");
                }
                else{
                    res.render("photographer",{bookings: result});
                }
            })
        }
        else{
            res.redirect("/");
        }
    });
});

app.get("/contact",function(req,res){
    data = {username:req.session.user.username, password:req.session.user.password};
    console.log('contact from ',data);
    if(req.session.user && req.cookies.user_sid)
        res.render("contact",req.session.user);
    else
        res.redirect("/");
});

app.get("/book_photographer",function(req,res){
    res.render("book",req.query);
});

app.get("/search_results",function(req,res){
    console.log(req.query);
    if(!req.session.user || !req.cookies.user_sid)
        res.redirect("/");
    sql = "select * from photographers where profile = '" + req.query.profile + "' and city = '" + req.query.city + "';";
    dbconn.query(sql,function(err,result){
        if(err){
            res.redirect("/");
        }
        else{
            res.render("search",{result: result});
        }
    });
});

app.get("/profile",function(req,res){
    res.send(req.query.username);
});

app.get("/logout",function(req,res){
    if(req.session.user && req.cookies.user_sid){
        req.session.destroy();
        res.clearCookie('user_sid');
    }
    res.redirect("/");
});