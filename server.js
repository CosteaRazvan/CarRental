const path = require('path');
const express = require('express')
const app = express();
const fs = require('fs');
const alert = require('alert');
const uuid = require('uuid');

app.set('view engine', 'ejs');
app.set('views', 'pages');


const bodyParser = require('body-parser');
const req = require('express/lib/request');

let users = []

app.use(express.static(__dirname + "/public"));

app.get('/home', function (req, res) {
    res.render("index");
});


app.get('/rent', function (req, res) {
    res.render("rent");
});

app.use(bodyParser.json());

app.post('/rent', (req, res) => {
    
});

app.get('/cars', (req, res) => {
    let rawData = fs.readFileSync(__dirname + '/database/cars_1000.json');
    let data = JSON.parse(rawData);
    res.end(JSON.stringify(data));
});

app.get('/login', function (req, res) {
    res.render("login", {warning:""});
});

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.post('/login', function (req, res) {
    const body = req.body;
    if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.userEmail)){
        res.render("login", {warning: "Email is not valid"});
    }

    //let users = JSON.parse(fs.readFileSync(__dirname + '/database/users.json'));

    users.forEach(user => {
        if(user.email == body.userEmail && user.pass == body.userPass){
            res.render("login", {warning: "User " + user.fname + " " + user.lname + " is logged in"});
            return;
        }
    });

    res.render("login", {warning: "User does not exist"});
});

app.get('/register', function (req, res) {
    res.render("register", {warning:""});
});

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.post('/register', function (req, res) {
    const body = req.body;
    
    if(body.pass != body.confPass){
        res.render("register", {warning: "Passwords do not match"});
    }

    if(!/^[a-zA-Z ]+$/.test(body.fname)){
        res.render("register", {warning: "First name is not valid"});
    }

    if(!/^[a-zA-Z ]+$/.test(body.lname)){
        res.render("register", {warning: "Last name is not valid"});
    }

    if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.email)){
        res.render("register", {warning: "Email is not valid"});
    }

    if(parseInt(body.age) < 18){
        res.render("register", {warning: "You are under 18"});
    }


    // // TODO: append new users to users.json correctly
    // if(fs.statSync('database/users.json').size == 0){
    //     fs.writeFileSync('database/users.json', '{users:{}');
    // }

    // let newUser = body;
    // newUser.id = uuid.v1();
    // fs.appendFileSync('database/users.json', JSON.stringify(newUser) + ',]');

    users.push(body);
    res.render('index');
});

app.get('/how_it_works', function (req, res) {
    res.render("how");
});

app.listen(process.env.PORT || 3000);