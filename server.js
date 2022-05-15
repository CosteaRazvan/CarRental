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

let session = null;

app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
    res.render("index", {user:session});
});


app.get('/rent', function (req, res) {
    res.render("rent", {warning:"", user:session});
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.post('/rent', (req, res) => {
    if(session){
        let rent = {
            description: req.body.description,
            make: req.body.make,
            model: req.body.model,
            fuel: req.body.fuel,
            transmission: req.body.transmission,
            location: req.body.location,
            start: req.body.start,
            end: req.body.end
        }

        res.render("finish", {user:session, rent:rent});
    }
    else{
        res.render("rent", {warning:"Please log in", user:session});
    }
});

app.get('/cars', (req, res) => {
    let rawData = fs.readFileSync(__dirname + '/database/cars_1000.json');
    let data = JSON.parse(rawData);
    res.end(JSON.stringify(data));
});

app.get('/login', function (req, res) {
    res.render("login", {warning:"", user:session});
});

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.post('/login', function (req, res) {
    const body = req.body;
    if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.userEmail)){
        res.render("login", {warning: "Email is not valid"});
        return;
    }

    const usersDir = fs.readdirSync('database/users');
    const users = usersDir.map(userID => {
        const user = fs.readFileSync(path.join('database/users', userID));
        return JSON.parse(user);
    })

    let found = 0;
    users.forEach(user => {
        if(user.email == body.userEmail && user.pass == body.userPass){
            session = user;
            res.render("index", {user: session});
            found = 1;
            return;
        }
    });

    if(found == 0){
        res.render("login", {warning: "User does not exist"});
    }
});

app.get('/register', function (req, res) {
    res.render("register", {warning:"", user:session});
});

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.post('/register', function (req, res) {
    const body = req.body;
    
    if(body.pass != body.confPass){
        res.render("register", {warning: "Passwords do not match"});
        return;
    }

    if(!/^[a-zA-Z ]+$/.test(body.fname)){
        res.render("register", {warning: "First name is not valid"});
        return;
    }

    if(!/^[a-zA-Z ]+$/.test(body.lname)){
        res.render("register", {warning: "Last name is not valid"});
        return;
    }

    if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.email)){
        res.render("register", {warning: "Email is not valid"});
        return;
    }

    if(parseInt(body.age) < 18){
        res.render("register", {warning: "You are under 18"});
        return;
    }

    let newUser = {
        fname: body.fname,
        lname: body.lname,
        email: body.email,
        pass: body.pass,
        age: body.age
    };

    fs.writeFileSync('database/users/' + uuid.v1() + '.json', JSON.stringify(newUser));
    res.render('index');
});

app.get('/how_it_works', function (req, res) {
    res.render("how", {user:session});
});

app.get('/logout', function (req, res) {
    session = null;
    res.render("index", {user:session});
});

app.listen(process.env.PORT || 3000);