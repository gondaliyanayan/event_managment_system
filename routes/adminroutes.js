const express = require("express");
const router = express.Router();
const adminUser = require("../models/event");
const bcrypt = require("bcryptjs");
const { auth, restrict } = require("../middleware/auth")
const app = express()
const cookieParser = require("cookie-parser");
app.use(cookieParser());

router.get("/userInfo",auth,restrict("admin"),async(req,res)=>{
    try {
        const user = req.user;
        res.send(user)
    } catch (error) {
        res.status(400).send("User Not found",error)
    }
})



router.post("/adminlogin", async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password;
        const isMail = await adminUser.findOne({ email: email });
        // if (isMail.role !== "admin") {
        //     console.log("Wrong Credentials");
        //     return res.status(404).json({
        //         status: false,
        //         msg: "Wrong Credentials"
        //     })
        // }
        if (!isMail) {
            return res.status(404).json({
                status: false,
                msg: "User not Found"
            })
        }
        const isPass = await bcrypt.compare(password, isMail.password);
        if (!isPass) {
            return res.status(404).json({
                status: false,
                msg: "Please Enter Correct Password"
            })
        }
        const Token = await isMail.genToken();
        console.log(Token);

        res.cookie("cookie", Token, {
            expires: new Date(Date.now() + 20000),
            httpOnly: true
        })

        res.status(200).send("User login successfull")
        console.log("user login succesfull");



    } catch (error) {
        res.status(400).send(error);
        console.log("pls insert correct detail", error);
    }
})



module.exports = router;