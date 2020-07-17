const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const fs=require('fs');
const path = require('path');
const async = require('async');
const orderRoutes = require('./routes/orderRoutes');

const app=express();

//Middleware to parse the incoming Request Body
app.use(bodyParser.json());


//Middleware to handle CORS issues
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE');
    next();
});

//Middleware that connects to various associated routes
app.use('/api',orderRoutes);

//Middleware to handle any unspecified routes 
app.use((req,res,next)=>{
  console.log("Unspecified Route encoutered");
})


//Middleware to handle error in execution
app.use((error,req,res,next)=>{
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message:error.message || 'An Unknown Error Occured!!!!!!'});
});


//Setting up port and loading of csv files on start of server
const PORT = 5000 || process.env.PORT;
 app.listen(PORT,()=>{
  // let exec = require('child_process').exec
  // let command = 'mongoimport --db ordertest --collection customer_names --type csv --file customers.csv --headerline'+
  //               '&& mongoimport --db ordertest --collection orders --type csv --file orders.csv --headerline'+
  //               '&& mongoimport --db ordertest --collection order_items --type csv --file order_items.csv --headerline'+
  //               '&& mongoimport --db ordertest --collection customer_companies --type csv --file customer_companies.csv --headerline'+
  //               '&& mongoimport --db ordertest --collection deliveries --type csv --file deliveries.csv --headerline'
  // exec(command, (err, stdout, stderr) => {
  // // check for errors or if it was succesfuly

  // if(!err){
  //   console.log("Success");
  // }
  // else{
  //   console.log(err);
  // }
  
  // }) 
   
  console.log(`Server Started on Port ${PORT}`);
 }); 

