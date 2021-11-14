const express = require('express')
const router = require("express").Router();
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer  = require('multer')
require("dotenv").config();
const isAuthorized = require("./isAuthorized-middleware");


const dbUrl = process.env.DB_URL;
const app = express()
app.use(express.json())

app.use(cors({
    origin : "*",
    credentials : true
}));

//handle image upload using multer
const storage = multer.diskStorage({  
    destination:(req, file, cb)=>{  
        cb(null,'./imageuploads');  
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
      }
  });  
  
  const upload = multer({storage:storage});


// create blog

router.post('/createblog', upload.single('image') , isAuthorized, async (req, res) => {

    try {
        let client = await MongoClient.connect(dbUrl);
        let db = client.db("Blog-Basic");
        let blogID = await db.collection("blogs").findOne({ blogID : req.body.blogID })
        if (!blogID) {
            let blog = await db.collection("blogs").insertOne({ blogID : req.body.blogID, author : req.body.author , category : req.body.category , title : req.body.title , image: req.file.path , description : req.body.description , date : new Date().toLocaleDateString()});

            res.status("200").json({ message: "Blog Created successfully" })
        } else {
            res.status("401").json({ message: "Blog ID Already Exists" })
        }
        client.close();
    } catch (error) {
        console.log(error)
        res.status(500)
    }
})

// view blogs

router.get('/viewblogs', isAuthorized, async (req, res) => {
    try {
        let client = await MongoClient.connect(dbUrl);
        let db = client.db("Blog-Basic");
        let data = await db.collection("blogs").find().toArray();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: "No Data Found" })
        }
        client.close();
    } catch (error) {
        console.log(error)
        res.status(500)
    }

})

// view particular blog with id

router.get('/viewblog/:id', isAuthorized, async (req, res) => {
    try {
        let id = req.params.id;
        let client = await MongoClient.connect(dbUrl);
        let db = client.db("Blog-Basic");
        let data = await db.collection("blogs").findOne({_id : ObjectId(id)});
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: "No Data Found" })
        }
        client.close();
    } catch (error) {
        console.log(error)
        res.status(500)
    }

})

//view blogs by category using $regex

router.get('/viewblogs/:category', isAuthorized, async (req, res) => {
    try {
        let client = await MongoClient.connect(dbUrl);
        let db = client.db("Blog-Basic");
        let data = await db.collection("blogs").find({category:{$regex: req.params.category ,$options:"$i"}}).toArray();
        console.log(data)
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: "No Data Found" })
        }
        client.close();
    } catch (error) {
        console.log(error)
        res.status(500)
    }

})


// update particular blog
router.put('/updateblog/:id', upload.single('image') , isAuthorized, async (req, res) => {
    try {
        let id = req.params.id
        let client = await MongoClient.connect(dbUrl);
        let db = client.db("Blog-Basic");
        let update = await db.collection("blogs").updateOne({_id : ObjectId(id)},{ $set: { blogID : req.body.blogID, author : req.body.author , category : req.body.category , title : req.body.title , image: req.file.path , description : req.body.description , updatedDate : new Date().toLocaleDateString()}}, { upsert : true });
        if (update) {
            res.status(200).json(update);
        } else {
            res.status(404).json({ message: "No Data Found" })
        }
        client.close();
    } catch (error) {
        console.log(error)
        res.status(500)
    }
})

//delete particular blog
router.delete('/deleteblog/:id', isAuthorized, async (req, res) => {
    try {
        let id = req.params.id
        let client = await MongoClient.connect(dbUrl);
        let db = client.db("Blog-Basic");
        await db.collection("blogs").deleteOne({_id : ObjectId(id)});
        res.status(200).json({ message: "Successfully Deleted" })
        client.close();
    } catch (error) {
        console.log(error)
        res.status(500)
    }
})



module.exports = router;