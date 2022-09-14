const express = require('express');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { email, name, password, confirmPassword } = req.body;
    if (!email || !name || !password || !confirmPassword) {
        return res.status(400).send("All Fields Are Required"); 
    }
    if (password !== confirmPassword) {
        return res.status(400).send("Password doesnot Match")
    }
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser !== null) {
        return res.status(400).send("Email Already Exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(hash);
    const newUser = new userModel({
        name: name,
        email: email,
        password: hash
    })
    try {
        const savedUser = await newUser.save();
        res.status(200).send("User created with id:" + savedUser.id);
        return;
    }
    catch (e) {
        console.log(e);
        res.status(501).send(e.message);
        return;
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("All fields are required");
    }
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser === null) {
        return res.status(400).send("Email doesnot exists");
    }
    if (!bcrypt.compareSync(password, existingUser.password)) {
        return res.status(400).send("Incorrect Password");
    }
    else {
        const payload = {
            id: existingUser.id,
            email: existingUser.email
        }
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' });

        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
})

router.post('/token',async(req,res)=>{
    const token = req.body.token;
    if(!token){
        return res.status(400).send("Please provide Refresh Token");
    }
    try{
        const payload = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        delete payload.exp;
        console.log(payload);
        const accessToken = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"5m"});
        res.status(200).json({accessToken:accessToken});
    }
    catch(e){
        res.status(501).send(e.message);
    }
})
module.exports = router;