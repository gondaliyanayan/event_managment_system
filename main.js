require("dotenv").config({ path: "./.env" })
require("./db/connection")
const express = require("express");
const app = express();
const adminrouter = require("./routes/adminroutes");
const eventrouter = require("./routes/eventroutes");
const port = process.env.PORT || 3000;
const cookieparser= require("cookie-parser");

app.use(cookieparser());
app.use(express.json());
app.use("/api",adminrouter);
app.use("/api",eventrouter)

app.listen(port,()=>{
    console.log(`server is listing on local ${port} no.`);
})
