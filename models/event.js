const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const eventConnect = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname:{
        type:String
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type:Number,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    confirm_password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum:['user','admin'],
        default: 'user'
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    Tokens: [{
        Token: {
            type: String,
            required: true
        }
    }],
})

eventConnect.pre("save", function (next) {
    this.updatedAt = new Date()
    next()
})
eventConnect.methods.genToken = async function () {
    try {
        const Token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.Tokens = this.Tokens.concat({Token:Token});
        await this.save();
        return Token;

    } catch (error) {
        console.log("this err in token gen",error);
    }
}

eventConnect.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        this.confirm_password = await bcrypt.hash(this.confirm_password, 10)
    }
    next()

})


const eventUser = new mongoose.model("eventUser", eventConnect);

module.exports = eventUser;