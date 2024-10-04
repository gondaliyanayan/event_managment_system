const jwt = require("jsonwebtoken");
const eventUser = require("../models/event");


const auth = async (req, res, next) => {
    try {
        const Token = req.cookies.cookie;
        const verify = jwt.verify(Token,process.env.SECRET_KEY);
        const user = await eventUser.findOne({_id:verify._id})
        req.user = user;
        
        next()
    } catch (error) {
        res.status(404).send("Invalid Data please check at Auth mdlware")
    }
    
}

const restrict = (role)=>{
    return(req,res,next)=>{
        if (req.user.role !== role) {
            return res.status(403).json({
                status: false,
                message: 'You do not have permission',
            });
        }
        next()
    }
}


module.exports = {auth,restrict};