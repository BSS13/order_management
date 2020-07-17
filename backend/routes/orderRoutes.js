const express=require('express');
const router=express.Router();
const ordersController = require('../controllers/ordersController');


//ROute for fetching all the orders
router.get("/getOrders",ordersController.getOrders);

//ROute for getting orders by key
router.post("/searchOrders",ordersController.getOrdersByKey);

//Route for getting orders by filtering based on date
router.post("/filterOrders",ordersController.getOrdersByFilter);


module.exports=router;