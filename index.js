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
    let sql = null;
    if(req.session.user && req.session.user.type == "user")
        sql = "select * from users where username = '" + req.session.user.username + "' and password = '" + req.session.user.password + "';";
    else if(req.session.user && req.session.user.type == "photographer")
        sql = "select * from photographers where username = '" + req.session.user.username + "' and password = '" + req.session.user.password + "';";
    console.log("serving home page");
    if(!sql){
        res.sendFile(__dirname+"/public/index1.html");
    }
    else{
        dbconn.query(sql,function(err,result){
            console.log("serving home page",result);
            if(result){
                if(req.session.user.type == "user")
                    res.redirect("/dashboard");
                else
                    res.redirect("/photographer/home");
            }
            else{
                res.sendFile(__dirname+"/public/index1.html");
            }
        });
    }
});

app.get("/photographer",function(req,res){
    console.log("opened photographer portal");
    res.sendFile(__dirname+"/public/photographer.html")
});

app.get("/dashboard",function(req,res){
    console.log("dashbard request",req.session.user);
    if(req.session.user && req.cookies.user_sid && req.session.user.type == "user"){
        res.render("user",req.session.user);
    }
    else if(req.session.user && req.cookies.user_sid && req.session.user.type == "photographer"){
        res.redirect("/photographer/home");
    }
    else{
        res.redirect("/");
    }
});

app.get("/photographer/home",function(req,res){
    console.log("home page photographer");
    if(req.session.user && req.session.user.type == "photographer"){
        let sql = "select * from bookings where photographer = '" + req.session.user.username + "' order by date;";
        dbconn.query(sql,function(err,result){
            if(err){
                console.log("error for query",sql);
                res.send("Error");
            }
            else{
                res.render("photographer",{bookings: result});
            }
        });
    }
    else{
        res.redirect("/");
    }
});

app.get("/signup_user",function(req,res){
    res.sendFile(__dirname+"/public/signup.html");
});

app.get("/photographer/signup",function(req,res){
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
                let sql = "insert into users values('" + req.body.username + "','" + req.body.name + "','" + req.body.email + "','" + req.body.password + "');";
                dbconn.query(sql,function(err,result){
                    if(err){
                        console.log("Error for signing up user ",sql);
                        res.redirect("/signup_user");
                    }
                    else{
                        console.log("successfully signed up " + req.body.username);
                        req.session.user = {username: req.body.username, password: req.body.password, type: "user"};
                        console.log(req.session.user);
                        res.redirect('/dashboard');
                    }
                });
            }
        }
    });
});

app.post("/register_photographer",function(req,res){
    console.log("got signup request from photographer");
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
                sql = "insert into photographers values('" + req.body.username + "','" + req.body.name + "','" + req.body.email + "','" + req.body.password + "','" + req.body.phone + "','" + req.body.address + "','" + req.body.city +"','" + req.body.profile + "'," + req.body.photo_charges + "," + req.body.video_charges +");";
                console.log("photographer signup query",sql);
                dbconn.query(sql,function(err,result){
                    if(err){
                        throw err;
                        res.redirect("/signup_photographer");
                    }
                    else{
                        console.log("registered photographer "+req.body.username);
                        req.session.user = {username: req.body.username, password: req.body.password, type: "photographer"};
                        res.redirect("/dashboard");
                    }
                });
            }
        }
    });
});

app.post("/login",function(req,res){
    let sql = "select * from users where username = '" + req.body.username + "' and password = '" + req.body.password + "';";
    console.log("login query: "+sql);
    dbconn.query(sql,function(err,result){
        if(result.length){
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

app.post("/photographer/login",function(req,res){
    console.log("logging in photographer");
    let sql = "select * from photographers where username = '" + req.body.username + "' and password = '" + req.body.password + "';";
    dbconn.query(sql,function(err,result){
        if(result.length){
            req.session.user = {username: req.body.username, password: req.body.password, type: "photographer"};
            res.redirect("/photographer/home");
        }
        else{
            res.redirect("/photographer");
        }
    });
});

app.get("/contact",function(req,res){
    if(req.session.user && req.cookies.user_sid){
        let sql = null;
        if(req.session.user.type == "user"){
            sql = "select * from users where username = '" + req.session.user.username + "' and password = '" + req.session.user.password +"';";
            console.log("contact from user");
        }
        else{
            sql = "select * from photographers where username = '" + req.session.user.username + "' and password = '" + req.session.user.password +"';";
            console.log("contact from photographer");
        }
        if(!sql)
            res.redirect("/");
        else{
            dbconn.query(sql,function(err,result){
                console.log("contact query",sql);
                if(result.length)
                    res.render("contact",result[0]);
                else
                    res.redirect("/");
            });
        }
    }
    else
        res.redirect("/");
});

app.get("/book_photographer",function(req,res){
    res.render("book",req.query);
});

app.get("/user/bookings",function(req,res){
    if(req.session.user && req.session.user.type == "user"){
        let sql = "select * from bookings where user='"+req.session.user.username+"' order by date;";
        dbconn.query(sql,function(err,result){
            if(err){
                res.redirect("/dashboard");
            }
            else{
                res.render("user_bookings",{bookings:result});
            }
        });
    }
});

app.get("/search_results",function(req,res){
    console.log(req.query);
    if(!req.session.user || !req.cookies.user_sid)
        res.redirect("/");
    let sql = "select * from photographers where profile = '" + req.query.profile + "' and city = '" + req.query.city + "';";
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
    if(req.session.user && req.cookies.user_sid){
        let sql = "select username, name, email, city, profile, video_charges, photo_charges from photographers where username = '" + req.query.username + "';";
        dbconn.query(sql,function(err,result){
            if(err){
                console.log(sql);
                res.send("ERROR OCCURRED");
            }
            else{
                res.render("profile",result[0]);
            }
        });
    }
    else{
        res.redirect("/");
    }
});

app.get("/book",function(req,res){
    if(req.session.user && req.cookies.user_sid){
        res.render("make_booking",{user: req.session.user.username, photographer: req.query.username});
    }
    else
        res.redirect("/");
});

app.post("/make_booking",function(req,res){
    let sql = "insert into bookings values('" + req.body.photographer + "','" + req.body.user + "','" + req.body.function_type + "','" + req.body.album_type + "','" + req.body.album_theme + "','" + req.body.date + "','" + req.body.time + "','" + req.body.venue1 + "','" + req.body.venue2 + "','" + req.body.venue3 + "','pending');";
    dbconn.query(sql,function(err,result){
        console.log(sql);
        if(err){
            res.redirect("/");
        }
        else{
            res.send("Confirmed booking");
        }
    });
});

app.get("/photographer/confirm_booking",function(req,res){
    if(req.session.user && req.session.user.type == "photographer"){
        let user = req.query.user;
        let function_type = req.query.function_type;
        let sql = "update bookings set status = 'confirmed' where user='" + user + "' and photographer='" + req.session.user.username + "' and function_type='" + function_type + "';";
        console.log("status update query");
        console.log(sql);
        dbconn.query(sql,function(err,result){
            if(err){
                res.redirect("photographer/home");
            }
            else{
                res.send("confirmed booking");
            }
        });
    }
    else{
        res.redirect("/photographer");
    }
});

app.get("/logout",function(req,res){
    if(req.session.user && req.cookies.user_sid){
        req.session.destroy();
        res.clearCookie('user_sid');
    }
    res.redirect("/");
});