const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const fs=require('fs');
const path = require('path');
const async = require('async');

const app=express();

//Middleware to parse the incoming Request Body
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE');

    next();
})

//Middleware to connect the Specific routes to associated things
 app.get('/api/getOrders' ,(req,res,next)=>{
console.log("Function called");
var orderDetails = [];
let orders = '';
let mongoose = require("mongoose");
mongoose.connect(' mongodb://127.0.0.1:27017/customers', { useNewUrlParser: true });

var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {

    connection.db.collection("orders", function(err, collection){
        collection.find({}).toArray(function(err, data){
          orders = data;
        //   console.log(orders);
        

    console.log(orders.length);
    let total_orders = orders.length;
    let order_count = 0;

    for(let i=0;i<orders.length;i++){
    
    let customer_id = orders[i].customer_id;
    let company_id = '';
    let customer_name = '';
    let customer_company = '';
    let order_date = orders[i].created_at;
    let order_id = orders[i].id;
    let order_details = {};
    order_details.order_name = orders[i].order_name;
    order_details.order_date = order_date;
    let user_orders='';
    
    async.series(
        [
          function (cb) {
            connection.db.collection("customer_names", function(err, collection){
                collection.find({"user_id":customer_id}).toArray(function(err, data){
                  company_id = data[0].company_id;
                  customer_name = data[0].name;
                  order_details.customer_name=customer_name;
                  cb();
                })
            });
              
          },
          function (cb) {
            
            connection.db.collection("customer_comapnies", function(err, collection){
                collection.find({"company_id":company_id}).toArray(function(err, data){
                  customer_company = data[0].company_name;
                  order_details.customer_company=customer_company;
                  cb();
                })
            });
              
          },
          function (cb) {
            
            connection.db.collection("order_items", function(err, collection){
                collection.find({"order_id":order_id}).toArray(function(err, data){
                  user_orders = data;
                  cb();
                })
            });
           
          
          },
         
          function (cb) {
              for(let i=0;i<user_orders.length;i++){
                let orderId=user_orders[i].id;
                let price=user_orders[i].price_per_unit;
                let quantity = user_orders[i].quantity;
                let total_amount=0;
                if(price == ''){
                  total_amount = '-';
                }else{
                  total_amount = price*quantity;
                }
                
                let number_of_deliveries=0;
                let flag= false;
                 connection.db.collection("deliveries", function(err, collection){
                    collection.find({"order_item_id":orderId}).toArray(function(err, data){
                      let delivered_amount = 0;
                      
                       if(data.length === 0){
                           flag = true;
                       }
                       else{
                        let total_deliveries = data;
                          for(let j=0;j<total_deliveries.length;j++){
                          number_of_deliveries = number_of_deliveries+parseInt(total_deliveries[j].delivered_quantity);
                         }
                    }

                      if(flag == true){
                           console.log("reaches here");
                           order_details.delivered_amount = 0;
                           order_details.total_amount = total_amount;
                           orderDetails.push(order_details);
                      }else{

                      order_details.delivered_amount = number_of_deliveries*price;
                      order_details.total_amount = total_amount;
                      orderDetails.push(order_details);
                      }
                      
                    })
                }); 
              }
             
              cb();
              
            
            },
    
           
    
        ],
        function (err, user) {
          if (!err)
            {
              
              order_count++;
              if(order_count == total_orders){
                console.log(orderDetails);
                res.status(200).json({"msg":orderDetails});
              }
            }
          else {
            console.log(err);
            console.log("Error in Operations");
          }
        }
        
      );
    }
    console.log(orderDetails);
  
 });

})
});
});





app.post('/api/searchOrders' ,(req,res,next)=>{
  console.log("Function called");
  var orderDetails = [];
  var searchKey = req.body.searchKey;
  console.log("Search Key"+searchKey);
  let orders = '';
  let mongoose = require("mongoose");
  mongoose.connect(' mongodb://127.0.0.1:27017/customers', { useNewUrlParser: true });
  
  var connection = mongoose.connection;
  
  connection.on('error', console.error.bind(console, 'connection error:'));
  connection.once('open', function () {
  
      connection.db.collection("orders", function(err, collection){
          collection.find({"order_name":{$regex : ".*"+searchKey+".*"}}).toArray(function(err, data){
            orders = data;
          //   console.log(orders);
          
  
      console.log(orders.length);
      let total_orders = orders.length;
      let order_count = 0;
  
      for(let i=0;i<orders.length;i++){
      
      let customer_id = orders[i].customer_id;
      let company_id = '';
      let customer_name = '';
      let customer_company = '';
      let order_date = orders[i].created_at;
      let order_id = orders[i].id;
      let order_details = {};
      order_details.order_name = orders[i].order_name;
      order_details.order_date = order_date;
      let user_orders='';
      
      async.series(
          [
            function (cb) {
              connection.db.collection("customer_names", function(err, collection){
                  collection.find({"user_id":customer_id}).toArray(function(err, data){
                    company_id = data[0].company_id;
                    customer_name = data[0].name;
                    order_details.customer_name=customer_name;
                    cb();
                  })
              });
                
            },
            function (cb) {
              
              connection.db.collection("customer_comapnies", function(err, collection){
                  collection.find({"company_id":company_id}).toArray(function(err, data){
                    customer_company = data[0].company_name;
                    order_details.customer_company=customer_company;
                    cb();
                  })
              });
                
            },
            function (cb) {
              
              connection.db.collection("order_items", function(err, collection){
                  collection.find({"order_id":order_id}).toArray(function(err, data){
                    user_orders = data;
                    cb();
                  })
              });
             
            
            },
           
            function (cb) {
                for(let i=0;i<user_orders.length;i++){
                  let orderId=user_orders[i].id;
                  let price=user_orders[i].price_per_unit;
                  let quantity = user_orders[i].quantity;
                  let total_amount = price*quantity;
                  let number_of_deliveries=0;
                  let delivered_amount = 0;
                   connection.db.collection("deliveries", function(err, collection){
                      collection.find({"order_item_id":orderId}).toArray(function(err, data){
                         if(data == undefined){
                             number_of_deliveries = 0;
                         }
                         else{
                          let total_deliveries = data;
                        for(let j=0;j<total_deliveries.length;j++){
                            number_of_deliveries = number_of_deliveries+parseInt(total_deliveries[j].delivered_quantity);
                        }
                       }
                      })
                  });
  
                  if(number_of_deliveries ==0){
                      delivered_amount = 0;
                  }
                  else{
                      delivered_amount = number_of_deliveries*price;
                  }
  
                  order_details.delivered_amount = delivered_amount;
                  order_details.total_amount = total_amount;
                  // console.log(order_details);
                  
                }
               
                cb();
                
              
              },
      
             
      
          ],
          function (err, user) {
            if (!err)
              {
                orderDetails.push(order_details);
                order_count++;
               if(order_count == total_orders){
                  res.status(200).json({"msg":orderDetails});
                }
              }
            else {
              console.log(err);
              console.log("Error in Operations");
            }
          }
          
        );
      }
      console.log(orderDetails);
    
   });
  
  })
  });
  });


  //Filter Orders
  app.post('/api/filterOrders' ,(req,res,next)=>{
    console.log("Function called");
    var orderDetails = [];
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    console.log("Start Date:"+startDate);
    console.log("End Date:"+endDate);
    let orders = '';
    let mongoose = require("mongoose");
    mongoose.connect(' mongodb://127.0.0.1:27017/customers', { useNewUrlParser: true });
    
    var connection = mongoose.connection;
    
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', function () {
    
        connection.db.collection("orders", function(err, collection){
            collection.find({"created_at": {
              $gte:startDate,
              $lt: endDate
          }}).toArray(function(err, data){
              orders = data;
            //   console.log(orders);
            
    
        console.log(orders.length);
        let total_orders = orders.length;
        let order_count = 0;
    
        for(let i=0;i<orders.length;i++){
        
        let customer_id = orders[i].customer_id;
        let company_id = '';
        let customer_name = '';
        let customer_company = '';
        let order_date = orders[i].created_at;
        let order_id = orders[i].id;
        let order_details = {};
        order_details.order_name = orders[i].order_name;
        order_details.order_date = order_date;
        let user_orders='';
        
        async.series(
            [
              function (cb) {
                connection.db.collection("customer_names", function(err, collection){
                    collection.find({"user_id":customer_id}).toArray(function(err, data){
                      company_id = data[0].company_id;
                      customer_name = data[0].name;
                      order_details.customer_name=customer_name;
                      cb();
                    })
                });
                  
              },
              function (cb) {
                
                connection.db.collection("customer_comapnies", function(err, collection){
                    collection.find({"company_id":company_id}).toArray(function(err, data){
                      customer_company = data[0].company_name;
                      order_details.customer_company=customer_company;
                      cb();
                    })
                });
                  
              },
              function (cb) {
                
                connection.db.collection("order_items", function(err, collection){
                    collection.find({"order_id":order_id}).toArray(function(err, data){
                      user_orders = data;
                      cb();
                    })
                });
               
              
              },
             
              function (cb) {
                  for(let i=0;i<user_orders.length;i++){
                    let orderId=user_orders[i].id;
                    let price=user_orders[i].price_per_unit;
                    let quantity = user_orders[i].quantity;
                    let total_amount = price*quantity;
                    let number_of_deliveries=0;
                    let delivered_amount = 0;
                     connection.db.collection("deliveries", function(err, collection){
                        collection.find({"order_item_id":orderId}).toArray(function(err, data){
                           if(data == undefined){
                               number_of_deliveries = 0;
                           }
                           else{
                            let total_deliveries = data;
                          for(let j=0;j<total_deliveries.length;j++){
                              number_of_deliveries = number_of_deliveries+parseInt(total_deliveries[j].delivered_quantity);
                          }
                         }
                        })
                    });
    
                    if(number_of_deliveries ==0){
                        delivered_amount = 0;
                    }
                    else{
                        delivered_amount = number_of_deliveries*price;
                    }
    
                    order_details.delivered_amount = delivered_amount;
                    order_details.total_amount = total_amount;
                    // console.log(order_details);
                    
                  }
                 
                  cb();
                  
                
                },
        
               
        
            ],
            function (err, user) {
              if (!err)
                {
                  orderDetails.push(order_details);
                  order_count++;
                 if(order_count == total_orders){
                    res.status(200).json({"msg":orderDetails});
                  }
                }
              else {
                console.log(err);
                console.log("Error in Operations");
              }
            }
            
          );
        }
        console.log(orderDetails);
      
     });
    
    })
    });
    });


app.use((error,req,res,next)=>{
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message:error.message || 'An Unknown Error Occured!!!!!!'});
});

mongoose.connect(' mongodb://127.0.0.1:27017/customers', { useNewUrlParser: true })
.then(() => {app.listen(5000); console.log("Server Started");})
.catch(err => console.log(err));


