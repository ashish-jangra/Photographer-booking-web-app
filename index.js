const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql')

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

const server=app.listen(4000,function(){
	console.log("Listening to request on port 4000");
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
                sql = "insert into users values('" + req.body.username + "','" + req.body.name + "','" + req.body.email + "','" + req.body.password + "');";
                dbconn.query(sql,function(err,result){
                    if(err){
                        throw err;
                    }
                    else{
                        console.log(result);
                    }
                });
                res.render('/user',req.body);
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
                sql = "insert into photographers values('" + req.body.username + "','" + req.body.name + "','" + req.body.email + "','" + req.body.password + "','" + req.body.phone + "','" + req.body.address + "','" + req.body.city + "');";
                dbconn.query(sql,function(err,result){
                    if(err){
                        throw err;
                    }
                    else{
                        console.log(result);
                    }
                });
                res.render('/photographer',req.body);
            }
        }
    });
});

app.post("/login",function(req,res){
    let sql = "select * from users where username = '" + req.body.username + "' and password = '" + req.body.password + "';";
    dbconn.query(sql,function(err,result){
        if(err){
            console.log(err);
            throw err;
            res.redirect('/');
        }
        else{
            if(result.length == 0){
                console.log("wrong username or password");
                res.redirect('/');
            }
            else{
                console.log("successfully logged in");
                res.render("user",req.body);
            }
        }
    });
});

app.get("/contact",function(req,res){
    res.render("contact.ejs",req.query);
});

app.post("/book_profile",function(req,res){
    sql = "select * from "
});