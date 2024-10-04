const express = require("express");
const router = express.Router();
const eventUser = require("../models/event");
const bcrypt = require("bcryptjs");
const {auth,restrict} = require("../middleware/auth")
const app = express()
const cookieParser = require("cookie-parser");
app.use(cookieParser());



router.post("/signup", async (req, res) => {
    try {
        const body = req.body;
        if (body.password === body.confirm_password) {
            const Data = new eventUser({
                firstname: body.firstname,
                lastname: body.lastname,
                username: body.username,
                email: body.email,
                phone: body.phone,
                password: body.password,
                confirm_password: body.confirm_password,
                role:body.role
                
            })
            const Token = await Data.genToken();
            res.cookie("cookie", Token, {
                expires: new Date(Date.now() + 50000),
                httpOnly: true
            })
            const Fdata = await Data.save()
            console.log(Fdata);
            res.status(200).send("SIGNUP Successfull")
        } else {
            res.send("pls check the password")
            console.log("pls check the password");
        }
    } catch (error) {
        res.status(400).send(error.message, { Status: false })
    }
})


router.post("/userlogin", async (req, res) => {
    try {
        const user = req.body.email || req.body.username;
        const password = req.body.password;
        const isMail = await eventUser.findOne({ $or: [{ email: user }, { username: user }] });
        if (isMail.role !== "user") {
            console.log("You can't access");
            return res.status(404).json({
                status: false,
                msg: "You can't access"
            })
        }
        if (!isMail) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }
        const isPass = await bcrypt.compare(password, isMail.password);
        console.log(isPass);
        if (!isPass) {
            return res.status(404).json({
                status: false,
                message: 'Please Insert Correct Password',
            });
        }
        const Token = await isMail.genToken();
        console.log(Token);

        res.cookie("cookie", Token, {
            expires: new Date(Date.now() + 50000),
            httpOnly: true
        })

        res.status(200).send("User login successfull")
        console.log("user login succesfull");
    }

    catch (error) {
        res.status(400).send(error);
        console.log("pls insert correct detail", error);
    }

})


router.patch("/updates/:userid", auth, async (req, res) => {
    try {
        const _id = req.params.userid;
        const userdata = { ...req.body }
        if (userdata.password && userdata.confirm_password) {
            if (userdata.password !== userdata.confirm_password) {
                return res.status(400).json({ message: "Password and Confirm Password do not match." });
            }
            const hasedpassword = await bcrypt.hash(userdata.password, 10);
            const hasedconfirmpassword = await bcrypt.hash(userdata.confirm_password, 10);
            userdata.password = hasedpassword;
            userdata.confirm_password = hasedconfirmpassword
        }

        console.log(userdata);
        const updatedata = await eventUser.findByIdAndUpdate(_id, userdata, { new: true })
        res.status(200).send({ msg: "User Detail update succesfully", data: updatedata.firstname })
        console.log("User Detail update succesfully");
    } catch (err) {
        res.status(400).send(err)
    }
})

router.patch("/change-password", auth, async (req, res) => {
    const { oldpassword, newpassword } = req.body;
    try {
        const user = await eventUser.findById(req.user._id)
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }
        const passwordmatch = await bcrypt.compare(oldpassword, user.password)
        console.log(passwordmatch);
        if (passwordmatch) {
            user.password = newpassword;
            await user.save();
            console.log("password change successfully");

        } else {
            return res.status(400).json({
                status: false,
                message: 'Invalid old password',
            });
        }

        res.json({
            status: true,
            message: 'Password updated successfully',
            data: {
                _id: user._id,
                username: user.firstname,
            },
        });
    } catch (error) {
        res.status(500).send("Incorrect Credential", error)
    }
})

module.exports = router;