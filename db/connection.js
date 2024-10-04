const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true}
)
.then(()=>{console.log("Db connection Successfully");})
.catch((err)=>{console.log(err);})