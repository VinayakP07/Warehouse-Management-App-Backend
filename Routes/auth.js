const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/userInfo');


const shhh = "This will be my first independent project";

// Route 1 : Creating a User

router.post('/createUser',[
    body('email','Enter valid email').isEmail(),
    body('username','Enter valid username').isLength({min : 3}),
    body('password','Enter valid password').isLength({min : 8})
] ,async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.json({success,error : result.array()});
    }

    try {
        let finding = await User.findOne({email : req.body.email});
        if(finding){
        let success = false;
            return res.json({success,error : "Email already exist"});
        }
        
        // opening account for new user
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        let newUser = await User.create({
            email : req.body.email,
            username : req.body.username,
            password : secPass
        })

        const data = newUser.id

        const authToken = jwt.sign(data , shhh);
        let success = true;
        res.json({success,authToken});
    } catch (error) {
        res.status(400).json({ message: "Some Error Occured" });
    }
});

    // Route : 2 : Logging in the user
    router.post('/login',[
        body('email','Enter valid email').isEmail(),
        body('password','Enter valid password').isLength({min : 8})],async (req,res)=>{

        const result = validationResult(req);
        if (!result.isEmpty()) {
        let success = false;
            return res.json({success,error : result.array()});
        }
        
        const {email , password} = req.body;

        try{
    
            // checking email
            let findingUser = await User.findOne({email : email});
            if(!findingUser){
        let success = false;
                return res.json({success,error : "Enter valid credentials to login"});
            }
            
            // checking password
            const check = await bcrypt.compare(password , findingUser.password);
            if(!check){
        let success = false;
                return res.json({success,error : "Enter valid credentials to login"});
            }

            const data = findingUser.id;
    
            const authToken = jwt.sign(data , shhh);
        let success = true;
            res.json({success,authtoken : authToken});
        } 
        catch (e){
            console.log(e);
            res.send("Some Error Occured");
        }
        });

        // Route 3 : Fetching user details
        router.post('/fetchUser', fetchuser ,async (req,res)=>{
            try {
                let userId = await req.user;
                const userInfo = await User.findById(userId).select('-password');
                res.send(userInfo);
            } catch (e) {
                console.log(e);
                res.json({error : "Some Error Occured"});
            }
        });

module.exports = router;
