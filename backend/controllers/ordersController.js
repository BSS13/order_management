
const async = require('async');

//Controller to get all the orders
const getOrders = (req,res,next)=>{
    // console.log("Function called");
    let mongoose = require("mongoose");
    mongoose.connect(' mongodb://127.0.0.1:27017/ordertest', { useNewUrlParser: true });
    
    var connection = mongoose.connection;
    var torders =[];
    
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', function () {
    
      let orders = '';
      
    
        connection.db.collection("orders", function(err, collection){
            collection.find({}).toArray(function(err, data){
              orders = data;
            //   console.log(orders);
       
        let total_orders = 0;
        let order_count = 0;
        
    
        connection.db.collection("order_items", function(err, collection){
          collection.find({}).toArray(function(err, data){
             total_orders = data.length;
          
        
        console.log(total_orders);
        let finalResult = [];

        //Iterate through each of the orders listed in the order.csv file
        for(let i=0;i<orders.length;i++){
        
        let order_details = {};
        let customer_id = orders[i].customer_id;
        let company_id = '';
        let customer_name = '';
        let customer_company = '';
        let order_date = orders[i].created_at;
        let order_id = orders[i].id;
        let order_name = orders[i].order_name;
        order_details.order_date = order_date;
        let user_orders='';
        let ttorders = [];
        
        //Using async series to handle asynchronous responses
        async.series(
            [
              //Fetch the customer name for the order by seaching the customer_names based on 
              function (cb) {
                connection.db.collection("customer_names", function(err, collection){
                    collection.find({"user_id":customer_id}).toArray(function(err, data){
                      company_id = data[0].company_id;
                      customer_name = data[0].name;
                      order_details.customer_name=customer_name;
                      cb(null,customer_name);
                    })
                });
                  
              },
              //Collect the order_date
              function (cb) {
                cb(null,order_date);
               },
              
               //Collect the order_name
               function (cb) {
                cb(null,order_name);
               },
              
              function (cb) {
                //Fetch the customer_company name from customer_companies.csv using company ID fetched
                connection.db.collection("customer_companies", function(err, collection){
                    collection.find({"company_id":company_id}).toArray(function(err, data){
                      customer_company = data[0].company_name;
                      order_details.customer_company=customer_company;
                      cb(null,customer_company);
                    })
                });
                  
              },
              function (cb) {
                //Find the orders in order_items for each order id
                connection.db.collection("order_items", function(err, collection){
                    collection.find({"order_id":order_id}).toArray(function(err, data){
                      user_orders = data;
                      cb(null,'');
                    })
                });
               
              
              },
             
              function (cb) {
                    let ttorder= [];
                    //Iterate through each item matched in order-items for a specific order id
                   for(let k=0;k<user_orders.length;k++){
                    let orderId=user_orders[k].id;
                    let price=user_orders[k].price_per_unit;
                    let quantity = user_orders[k].quantity;
                    let oname=user_orders[k].product;
                    let total_amount=0;
                    let total_delivery_record=[];
                    let flag = false;
                    let number_of_deliveries=0;
                    let delivered_amount=0;
                    let ol = user_orders.length;
                    
                    async.series(
                      [ 
                        function(cb){
                          total_amount=0;
                          if(price == ''){
                            total_amount = '-';
                          }else{
                            total_amount = price*quantity;
                          }
    
                          cb(null,total_amount)
                        },
                        function(cb){
                           cb(null,oname);
                        },
                        function (cb) {
                          //Count total deliveries for each item for a specific order_item in order_item corresponding to order_item in deliveries
                          connection.db.collection("deliveries", function(err, collection){
                             collection.find({"order_item_id":orderId}).toArray(function(err, data){
                               total_delivery_record = data;
                               
                                if(total_delivery_record.length === 0){
                                    flag = true;
                                }
                                else{
                                   for(let j=0;j<total_delivery_record.length;j++){
                                   number_of_deliveries = number_of_deliveries+parseInt(total_delivery_record[j].delivered_quantity);
                                  }
           
                               }
         
                               if(flag == true){
                                   
                                    delivered_amount = 0;
                                    cb(null,delivered_amount);
                               }else{
                                  delivered_amount = number_of_deliveries*price;
                                  cb(null,delivered_amount);
                               
                           } 
                             })
                         }); 
                            
                        }],
                        function(err,results){
                          if(!err){
    
                            let recordDetails = {};
                            
                            recordDetails.total_amount = results[0];
                            recordDetails.product_name = results[1];
                            recordDetails.delivered_amount = results[2];
                            // order_details.total_amount = results[0];
                            // order_details.product_name = results[1];
                            // order_details.delivered_amount = results[2];
                            // // orderDetails.push(order_details);
                            // console.log(order_details);
                            // torders.push(order_details);
    
                            ttorder.push(recordDetails);
                          
    
                             if(ttorder.length == ol){
                              
                              // console.log(torders);
                              cb(null,ttorder);
                            }
                            
                            
     
                          }
                          else{
                            console.log("Error");
                          }
                        });
    
                        
                  }
                  
                }
        
               
        
            ],
            function (err, result) {
              if (!err)
                {
                
                let customer_name = result[0];
                let order_date = result[1];
                let  order_id = result[2];
                let company_name = result[3];
                let od = result[5];
              
    
                for(let l=0;l<od.length;l++){
                  let finalEntry = {};
                  let total_amount = od[l].total_amount;
                  let delivered_amount = od[l].delivered_amount;
                  let product_name = od[l].product_name;
    
                  // finalEntry.order_name = order_id+ ' '+ product_name;
                  // finalEntry.customer_name = customer_name;
                  // finalEntry.order_date = order_date;
                  // finalEntry.company_name = company_name;
                  // finalEntry.total_amount = total_amount;
                  // finalEntry.delivered_amount = delivered_amount;
                  // finalEntry.product_name = product_name;
    
                  finalEntry.order_name = order_id+ ' '+ product_name;
                  finalEntry.customer_company = company_name;
                  finalEntry.customer_name = customer_name;
                  finalEntry.order_date = order_date;
                  finalEntry.delivered_amount = "$ "+delivered_amount;
                  finalEntry.total_amount = total_amount;
                  
                  finalResult.push(finalEntry);
                  
                }
    
                if(finalResult.length == total_orders){
                  // console.log(finalResult);
                  res.status(200).json({'msg':finalResult});
                }
    
                               
                }
              else {
                console.log(err);
                console.log("Error in Operations");
              }
            }
            
          );
        }
      });
      });
     });
    
    })
    });
}

const getOrdersByKey = (req,res,next)=>{
    // console.log("Function called");
    let mongoose = require("mongoose");
    mongoose.connect(' mongodb://127.0.0.1:27017/ordertest', { useNewUrlParser: true });
    
    var connection = mongoose.connection;
    var torders =[];
    var searchKey = req.body.searchKey;
    
    
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', function () {
    
      let orders = '';
      
    
        connection.db.collection("orders", function(err, collection){
            collection.find({"order_name":{$regex : ".*"+searchKey+".*"}}).toArray(function(err, data){
              orders = data;
            //   console.log(orders);
       
        let total_orders = 0;
        let order_count = 0;
        
    
        for(let i=0;i<orders.length;i++){
          let order_Id = orders[i].id;
        connection.db.collection("order_items", function(err, collection){
          collection.find({"order_id":order_Id}).toArray(function(err, data){
             total_orders = total_orders+data.length;
          })
        });
      }
  
      
        let finalResult = [];
        for(let i=0;i<orders.length;i++){
        
        let order_details = {};
        let customer_id = orders[i].customer_id;
        let company_id = '';
        let customer_name = '';
        let customer_company = '';
        let order_date = orders[i].created_at;
        let order_id = orders[i].id;
        let order_name = orders[i].order_name;
        order_details.order_date = order_date;
        let user_orders='';
        let ttorders = [];
        
        async.series(
            [
              function (cb) {
                connection.db.collection("customer_names", function(err, collection){
                    collection.find({"user_id":customer_id}).toArray(function(err, data){
                      company_id = data[0].company_id;
                      customer_name = data[0].name;
                      order_details.customer_name=customer_name;
                      cb(null,customer_name);
                    })
                });
                  
              },
              function (cb) {
                cb(null,order_date);
               },
              
               function (cb) {
                cb(null,order_name);
               },
              
              function (cb) {
                
                connection.db.collection("customer_companies", function(err, collection){
                    collection.find({"company_id":company_id}).toArray(function(err, data){
                      customer_company = data[0].company_name;
                      order_details.customer_company=customer_company;
                      cb(null,customer_company);
                    })
                });
                  
              },
              function (cb) {
                
                connection.db.collection("order_items", function(err, collection){
                    collection.find({"order_id":order_id}).toArray(function(err, data){
                      user_orders = data;
                      cb(null,'');
                    })
                });
               
              
              },
             
              function (cb) {
                    let ttorder= [];
                   for(let k=0;k<user_orders.length;k++){
                    let orderId=user_orders[k].id;
                    let price=user_orders[k].price_per_unit;
                    let quantity = user_orders[k].quantity;
                    let oname=user_orders[k].product;
                    let total_amount=0;
                    let total_delivery_record=[];
                    let flag = false;
                    let number_of_deliveries=0;
                    let delivered_amount=0;
                    let ol = user_orders.length;
                    
                    async.series(
                      [ 
                        function(cb){
                          total_amount=0;
                          if(price == ''){
                            total_amount = '-';
                          }else{
                            total_amount = price*quantity;
                          }
    
                          cb(null,total_amount)
                        },
                        function(cb){
                           cb(null,oname);
                        },
                        function (cb) {
                          
                          connection.db.collection("deliveries", function(err, collection){
                             collection.find({"order_item_id":orderId}).toArray(function(err, data){
                               total_delivery_record = data;
                               
                                if(total_delivery_record.length === 0){
                                    flag = true;
                                }
                                else{
                                   for(let j=0;j<total_delivery_record.length;j++){
                                   number_of_deliveries = number_of_deliveries+parseInt(total_delivery_record[j].delivered_quantity);
                                  }
           
                               }
         
                               if(flag == true){
                                   
                                    delivered_amount = 0;
                                    cb(null,delivered_amount);
                               }else{
                                  delivered_amount = number_of_deliveries*price;
                                  cb(null,delivered_amount);
                               
                           } 
                             })
                         }); 
                            
                        }],
                        function(err,results){
                          if(!err){
    
                            let recordDetails = {};
                            
                            recordDetails.total_amount = results[0];
                            recordDetails.product_name = results[1];
                            recordDetails.delivered_amount = results[2];
                            // order_details.total_amount = results[0];
                            // order_details.product_name = results[1];
                            // order_details.delivered_amount = results[2];
                            // // orderDetails.push(order_details);
                            // console.log(order_details);
                            // torders.push(order_details);
    
                            ttorder.push(recordDetails);
                          
    
                             if(ttorder.length == ol){
                              
                              // console.log(torders);
                              cb(null,ttorder);
                            }
                            
                            
     
                          }
                          else{
                            console.log("Error");
                          }
                        });
    
                        
                  }
                  
                }
        
               
        
            ],
            function (err, result) {
              if (!err)
                {
                
                let customer_name = result[0];
                let order_date = result[1];
                let  order_id = result[2];
                let company_name = result[3];
                let od = result[5];
              
    
                for(let l=0;l<od.length;l++){
                  let finalEntry = {};
                  let total_amount = od[l].total_amount;
                  let delivered_amount = od[l].delivered_amount;
                  let product_name = od[l].product_name;
    
                  // finalEntry.order_name = order_id+ ' '+ product_name;
                  // finalEntry.customer_name = customer_name;
                  // finalEntry.order_date = order_date;
                  // finalEntry.company_name = company_name;
                  // finalEntry.total_amount = total_amount;
                  // finalEntry.delivered_amount = delivered_amount;
                  // finalEntry.product_name = product_name;
    
                  finalEntry.order_name = order_id+ ' '+ product_name;
                  finalEntry.customer_company = company_name;
                  finalEntry.customer_name = customer_name;
                  finalEntry.order_date = order_date;
                  finalEntry.delivered_amount = "$ "+delivered_amount;
                  finalEntry.total_amount = total_amount;
                  
                  finalResult.push(finalEntry);
                  
                }
    
                if(finalResult.length == total_orders){
                  // console.log(finalResult);
                  // console.log(total_orders+ "Total orders as per search");
                  res.status(200).json({'msg':finalResult});
                }
    
                               
                }
              else {
                console.log(err);
                console.log("Error in Operations");
              }
            }
            
          );
        }
      });
      });
     });
}  

const getOrdersByFilter = (req,res,next)=>{
    // console.log("Function called");
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    // console.log("Start date"+startDate);
    // console.log("End date"+endDate);
    let mongoose = require("mongoose");
    mongoose.connect(' mongodb://127.0.0.1:27017/ordertest', { useNewUrlParser: true });
    
    var connection = mongoose.connection;
    
    
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', function () {
    
      let orders = '';
      
    
        connection.db.collection("orders", function(err, collection){
            collection.find({"created_at": {
              $gte:startDate,
              $lt: endDate
          }}).toArray(function(err, data){
              orders = data;
            //   console.log(orders);
       
        let total_orders = 0;
        let order_count = 0;
        
    
        for(let i=0;i<orders.length;i++){
          let order_Id = orders[i].id;
        connection.db.collection("order_items", function(err, collection){
          collection.find({"order_id":order_Id}).toArray(function(err, data){
             total_orders = total_orders+data.length;
          })
        });
      }
  
      
        let finalResult = [];
        for(let i=0;i<orders.length;i++){
        
        let order_details = {};
        let customer_id = orders[i].customer_id;
        let company_id = '';
        let customer_name = '';
        let customer_company = '';
        let order_date = orders[i].created_at;
        let order_id = orders[i].id;
        let order_name = orders[i].order_name;
        order_details.order_date = order_date;
        let user_orders='';
        let ttorders = [];
        
        async.series(
            [
              function (cb) {
                connection.db.collection("customer_names", function(err, collection){
                    collection.find({"user_id":customer_id}).toArray(function(err, data){
                      company_id = data[0].company_id;
                      customer_name = data[0].name;
                      order_details.customer_name=customer_name;
                      cb(null,customer_name);
                    })
                });
                  
              },
              function (cb) {
                cb(null,order_date);
               },
              
               function (cb) {
                cb(null,order_name);
               },
              
              function (cb) {
                
                connection.db.collection("customer_companies", function(err, collection){
                    collection.find({"company_id":company_id}).toArray(function(err, data){
                      customer_company = data[0].company_name;
                      order_details.customer_company=customer_company;
                      cb(null,customer_company);
                    })
                });
                  
              },
              function (cb) {
                
                connection.db.collection("order_items", function(err, collection){
                    collection.find({"order_id":order_id}).toArray(function(err, data){
                      user_orders = data;
                      cb(null,'');
                    })
                });
               
              
              },
             
              function (cb) {
                    let ttorder= [];
                   for(let k=0;k<user_orders.length;k++){
                    let orderId=user_orders[k].id;
                    let price=user_orders[k].price_per_unit;
                    let quantity = user_orders[k].quantity;
                    let oname=user_orders[k].product;
                    let total_amount=0;
                    let total_delivery_record=[];
                    let flag = false;
                    let number_of_deliveries=0;
                    let delivered_amount=0;
                    let ol = user_orders.length;
                    
                    async.series(
                      [ 
                        function(cb){
                          total_amount=0;
                          if(price == ''){
                            total_amount = '-';
                          }else{
                            total_amount = price*quantity;
                          }
    
                          cb(null,total_amount)
                        },
                        function(cb){
                           cb(null,oname);
                        },
                        function (cb) {
                          
                          connection.db.collection("deliveries", function(err, collection){
                             collection.find({"order_item_id":orderId}).toArray(function(err, data){
                               total_delivery_record = data;
                               
                                if(total_delivery_record.length === 0){
                                    flag = true;
                                }
                                else{
                                   for(let j=0;j<total_delivery_record.length;j++){
                                   number_of_deliveries = number_of_deliveries+parseInt(total_delivery_record[j].delivered_quantity);
                                  }
           
                               }
         
                               if(flag == true){
                                   
                                    delivered_amount = 0;
                                    cb(null,delivered_amount);
                               }else{
                                  delivered_amount = number_of_deliveries*price;
                                  cb(null,delivered_amount);
                               
                           } 
                             })
                         }); 
                            
                        }],
                        function(err,results){
                          if(!err){
    
                            let recordDetails = {};
                            
                            recordDetails.total_amount = results[0];
                            recordDetails.product_name = results[1];
                            recordDetails.delivered_amount = results[2];
                            // order_details.total_amount = results[0];
                            // order_details.product_name = results[1];
                            // order_details.delivered_amount = results[2];
                            // // orderDetails.push(order_details);
                            // console.log(order_details);
                            // torders.push(order_details);
    
                            ttorder.push(recordDetails);
                          
    
                             if(ttorder.length == ol){
                              
                              // console.log(torders);
                              cb(null,ttorder);
                            }
                            
                            
     
                          }
                          else{
                            console.log("Error");
                          }
                        });
    
                        
                  }
                  
                }
        
               
        
            ],
            function (err, result) {
              if (!err)
                {
                
                let customer_name = result[0];
                let order_date = result[1];
                let  order_id = result[2];
                let company_name = result[3];
                let od = result[5];
              
    
                for(let l=0;l<od.length;l++){
                  let finalEntry = {};
                  let total_amount = od[l].total_amount;
                  let delivered_amount = od[l].delivered_amount;
                  let product_name = od[l].product_name;
    
                  // finalEntry.order_name = order_id+ ' '+ product_name;
                  // finalEntry.customer_name = customer_name;
                  // finalEntry.order_date = order_date;
                  // finalEntry.company_name = company_name;
                  // finalEntry.total_amount = total_amount;
                  // finalEntry.delivered_amount = delivered_amount;
                  // finalEntry.product_name = product_name;
    
                  finalEntry.order_name = order_id+ ' '+ product_name;
                  finalEntry.customer_company = company_name;
                  finalEntry.customer_name = customer_name;
                  finalEntry.order_date = order_date;
                  finalEntry.delivered_amount = "$ "+delivered_amount;
                  finalEntry.total_amount = total_amount;
                  
                  finalResult.push(finalEntry);
                  
                }
    
                if(finalResult.length == total_orders){
                  // console.log(finalResult);
                  // console.log(total_orders+ "Total orders as per search");
                  res.status(200).json({'msg':finalResult});
                }
    
                               
                }
              else {
                console.log(err);
                console.log("Error in Operations");
              }
            }
            
          );
        }
      });
      });
     });
}

exports.getOrders = getOrders;
exports.getOrdersByKey = getOrdersByKey;
exports.getOrdersByFilter = getOrdersByFilter;