const express = require('express')
const app = express()
var bodyParser = require('body-parser');
var zip = require('express-easy-zip');
var homeRoute = require('./routes/home');


// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
app.use(zip());
app.use(express.static(__dirname + '/public'))

var path = require ('path');
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));


app.use('/',homeRoute);


app.listen(process.env.PORT || 3000);