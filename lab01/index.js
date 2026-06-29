const express = require('express');
const cors = require('cors');

let app = express();
app.use(cors());

// add routes here
app.get('/', function(req,res){
    res.json({
       "message":"hello world"
    });
})

app.get('/hello/:name', (req,res)=>{
  let name = req.params.name;
  res.send("Hi, " + name);
})

app.get('/echo', (req, res) => {
    // Get all query parameters
    const queryParams = req.query;

    // Create a response object
    const response = {
        message: "Here are the query parameters you sent:",
        firstName: queryParams.firstName,
        lastName: queryParams.lastName
    };

    // Send the response as JSON
    res.json(response);
});

app.get('/difference/:n1/:n2', (req, res) => {
    // Get all query parameters
    const n1 = Number(req.params.n1);
    const n2 = Number(req.params.n2);
    const answer = n1 - n2;

    // Create a response object
    const response = {
        difference: answer
    };

    // Send the response as JSON
    res.json(response);
});

app.get('/scream', (req, res) => {
    // Get all query parameters
    const message = req.query.message;
    const recipient = req.query.recipient;

    // 2. Combine them with a space and make it upper case
    const response = `${message} ${recipient}`.toUpperCase();
    
    // Create a response object
   

    // Send the response as JSON
    res.json(response);
});

app.listen(3000, ()=>{
    console.log("Server started")
})
