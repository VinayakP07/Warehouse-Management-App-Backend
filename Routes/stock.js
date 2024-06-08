const express = require('express');
const fetchUser = require('../middleware/userInfo');
const router = express.Router();
const Stock = require('../models/Stock');
const { body, validationResult } = require('express-validator');

const ucase = (string) =>{
    const newString = string.toUpperCase();
    return newString;
}


// Route 1 : Fetching the stocks of the user
router.get('/fetchStock', fetchUser , async(req,res)=>{
    try {
        const stock = await Stock.find({user : req.user});
        res.json(stock);
    } catch (error) {
        res.json({error : "Some error occured"});
    }
})



// Route 2 : Adding stock of user
router.post('/addStock', fetchUser , [
    body('product','Enter valid Product'),
    body('quantity','Enter valid Quantity').isNumeric({min:0}),
    body('price','Enter valid Price').isNumeric({min:0})] ,async (req,res)=>{
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.json({error : result.array()});
    }

    const alreadyExist = await Stock.find({product : ucase(req.body.product), user : req.user});

    if(alreadyExist[0]){
        const {product, quantity, price} = req.body;
        const updateStock = {};
        updateStock.product = ucase(product);
        updateStock.quantity = alreadyExist[0].quantity + quantity;
        updateStock.price = alreadyExist[0].price - price;
        let stock = await Stock.findByIdAndUpdate(alreadyExist[0]._id, {$set : updateStock}, {new : true});
        res.json(stock);
    }
    else{
    try{

        let newStock = await Stock.create({
            product : ucase(req.body.product),
            quantity : req.body.quantity,
            price : -(req.body.price),
            user : req.user
        });
        const saveStock = await newStock.save();
        res.json(saveStock);
    } 
    catch (e){
        console.log(e);
        res.send("Some Error Occured");
    }
}
});



// Route 3 : To update the stock of the user logged in
    router.put('/updateStock/:id', fetchUser ,[
        body('product','Enter valid Product'),
        body('quantity','Enter valid Quantity'),
        body('price','Enter valid price')] ,async (req,res)=>{
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.json({error : "Enter data correclty"});
            }

        try {
            // creating an updated stock
            const {product, quantity, price} = req.body;
            const updateStock = {};
            if(product){updateStock.product = ucase(product);}
            if(quantity){updateStock.quantity = quantity;}
            if(price){updateStock.price = price;}
    
            // finding the note that is to be udated
            let stock = await Stock.findById(req.params.id);
            if(!stock){
                res.json({error : "Stock not found"});
            }
            if(stock.user.toString() !== req.user){
                res.send("Access Denied");
            }
    
            // Updating the stock
            stock = await Stock.findByIdAndUpdate(req.params.id, {$set : updateStock}, {new : true})
            res.json(stock);
            
        } 
        catch (error) {
            res.json({error : "Some Error Occured"});
        }

    });




    // Route 4 : To remove the stock of the user logged in

    router.delete('/deleteStock/:id', fetchUser, async(req,res)=>{
            try {
            let stock = await Stock.findById(req.params.id);
            if(!stock){
                res.json({error : "Stock not found"});
            }
            if(stock.user.toString()!== req.user){
                res.send("Access Denied");
            }
            await Stock.findByIdAndDelete(req.params.id);
            res.json({message : "Stock deleted successfully"});   
        }
        catch (error) {
            res.json({error : "Some Error Occured"});
        };
    })


    // Route 5 : To reduce the stock of the user

    router.post('/reduceStock', fetchUser , [
        body('product','Enter valid Product'),
        body('quantity','Enter valid Quantity').isNumeric({min:0}),
        body('price','Enter valid price').isNumeric({min:0})] ,async (req,res)=>{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({error : result.array()});
        }
    
        const alreadyExist = await Stock.find({product : ucase(req.body.product) , user : req.user});
    
        if(alreadyExist){
            const {product, quantity, price} = req.body;
            const updateStock = {};
            try {  
                if(alreadyExist[0].quantity >= quantity){
                    updateStock.quantity = alreadyExist[0].quantity - quantity;
                    updateStock.price = alreadyExist[0].price + price;
                    updateStock.product = ucase(product);
                    let stock = await Stock.findByIdAndUpdate(alreadyExist[0]._id, {$set : updateStock}, {new : true});
                    // const ans = {message : "Stock Updated Successfully",success:1}
                    res.json({stock,message : "Stock Updated Successfully",success:1});
                    // console.log(ans.message)
                    }
                else{
                //    const ans = {message : "Entered amount of quantity is not present in the stock",success:0}
                   res.json({message : "Entered amount of quantity is not present in the stock",success:0});
                //    console.log(ans.message);
                //    return ans.success
                }
        }catch (error) {
            res.json({message : "Error"})
        }
}
        else{
           return res.json({Message : "Product not found in the Stock"});
        }

    });


    // Route 6 : To get the net Amount of the user

    router.get('/fetchIncome', fetchUser , async(req,res)=>{
        try {
            const stock = await Stock.find({user : req.user});
            let income = 0;
            for(let i =0 ; i< stock.length ;i++){
                income = income + stock[i].price;
            }
            res.json({income : income});

        } catch (error) {
            res.json({error : "Some error occured",message : error.message});
        }
    });

module.exports = router;