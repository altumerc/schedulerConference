const express = require('express');

const mySql = require('mysql');

const bodyParser = require('body-parser');

const path = require('path');

const cors = require('cors');
const { DATETIME } = require('mysql/lib/protocol/constants/types');
const { start } = require('repl');

const app = express();

const port = process.env.PORT || 7000;

const result = []
var actualstart = []
var actualend= []
var startarr = []
var endarr = [] 
var responseArray = []
var events = []
var test = []

const connection = mySql.createConnection({
    host:"localhost",
    user:"root",
    password:"Altmash@16",
    database:"scheduleRoom"
});

connection.connect(function(err) {
    if(err) throw err
    console.log("DB connected")
});

app
    .use(express.static('public'))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(cors())


    .get('/data/start',function(req,response){    
           
        connection.query("select * from meeting", function(err,res,body){
            if(err) throw err
            res.forEach(function(element) {
                var da = element.date;
                var jsDate = new Date(da);
                const nextDay = jsDate.getDate()+1
                jsDate.setDate(nextDay)
                const newDate = jsDate.toJSON()
                var s = element.start_time
                var e = element.end_time
                var dt = {}
                 dt.title = 'Meeting Already Booked'
                 dt.start = newDate.slice(0,11).concat(s)
                 dt.end = newDate.slice(0,11).concat(e)
                 dt.display = 'background'
                 events.push(dt) 
        })
        
            responseArray = [...events]
            response.send(responseArray)
    })
})
    .post('/postData',function (req,response) {
            
            var dateMeet=  req.body.dateMeeting;
            var startTime= req.body.startTime;
            var endTime= req.body.endTime;
    
            var sqlQuery = `SELECT * FROM meeting WHERE ? < end_time AND ? > start_time AND date =?`;
        connection.query(sqlQuery,[startTime,endTime,dateMeet],function(err,res){
            if(err) throw err
            if(res.length > 0)
            {
                var obj ={}
                obj.message = "Slot not available"
                response.send(obj)
            } 
            else{
                var sql = "INSERT INTO meeting (date, start_time, end_time) VALUES (?,?,?)";
        connection.query(sql,[dateMeet,startTime,endTime], function(err,res){
            if(err) throw err
            var obj ={}
            obj.message = "Meeting Scheduled"
            response.send(obj)
        })
    }
        })
    })
    .listen(port, () => console.log(`Server running on ${port}`));