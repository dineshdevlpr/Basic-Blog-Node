const express = require('express')
const cors = require("cors");
require("dotenv").config();

// auth route
const authRoute = require("./authRoutes")

// blog route
const blogRoute = require("./blogRoutes")

const app = express()
app.use(express.json())

const port = process.env.PORT || 4000;
const dbUrl = process.env.DB_URL;

app.use(cors({
    origin : "*",
    credentials : true
}));

app.use("/auth", authRoute)
app.use("/blog", blogRoute)



app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`)
})