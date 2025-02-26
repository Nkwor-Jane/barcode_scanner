const express = require('express')
const mongoose = require('mongoose')
const JsBarcode = require("jsbarcode")
const {createCanvas, loadImaage} = require("@napi-rs/canvas")
const {v4: uuidv4} = require("uuid")

const app = express();
app.use(express.json())

mongoose.connect("mongodb://localhost:27017/barcodeDB")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MonogoDB Connection Error:", err))

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    barcode: String,
});

const user = mongoose.model("User", userSchema)

app.post("/generate-barcode", async (req, res) =>{
    const {name, email} = req.body;
    const uniqueCode = uuidv4().replace(/-/g, "").substring(0, 12);

    const canvas = createCanvas();
    JsBarcode(canvas, uniqueCode, {format: "CODE128"});
    const barcodeDataURL = canvas.toDataURL();

    const newUser = new User({name, email, barcode: uniqueCode});
    await newUser.save();

    res.json({success:true, barcode: barcodeDataURL, userId: uniqueCode})
})

app.get("/get-user/:barcode", async(req, res)=>{
    const user = await User.findOne({barcode: req.params.barcode});
    if (!user) return res.status(404).json({error: "User not found"})
    
    res.json(user)
})

app.listen(5000, () => console.log("Server running on port 5000"))