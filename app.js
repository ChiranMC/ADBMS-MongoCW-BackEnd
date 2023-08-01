const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(express.json());
app.use(cors());
const bcrypt=require("bcryptjs");


const jwt =require("jsonwebtoken");

const JWT_SECRET = "hvdddnfdvnn4vmkmkmkmk90?dmksmfkmsfsfmskdf[]ssfss12@zxcc";

const mongoUrl = "mongodb+srv://pasindusamarasinghe4:A0712789171@cluster0.263wlnk.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to database");
}).catch((error) => {
  console.error("Error connecting to database:", error);
  process.exit(1); // Exit the application if the database connection fails
});

require("./userDetails");
const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
  const { fname, lname, email, password,userType } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email }); // Add await here

    if (oldUser) {
     return res.send({ error: "User Exists" }); // Corrected "User Exits" to "User Exists"
    } else {
      await User.create({
        fname,
        lname,
        email,
        password: encryptedPassword,
        userType,
      });
      res.send({ status: "ok" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.send({ status: "error" });
  }
});








app.post("/login-user",async(req,res)=>{
    const { email, password } = req.body;
    const user =await User.findOne({ email });
    
    if(!user){
        return res.json({ error:"User Not found"});
    }
    if(await bcrypt.compare(password,user.password)){
        const token=jwt.sign({email:user.email}, JWT_SECRET);

        if(res.status(201)){
            return res.json({status: "ok", data:token });
        }else{
            return res.json({error: "error"});
        }
    }
            res.json({ status: "error", error:"Invalid Password"});
});







app.post("/userData",async(req,res)=>{
    const {token} =req.body;
    try{
        const user=jwt.verify(token,JWT_SECRET);
        console.log(user);
        const useremail = user.email;

        User.findOne({email:useremail}).then((data) =>{
          res.send({status:"ok", data:data });
        })
        .catch((error) =>{
             res.send({ status: "error",data:error});
        });
    }
    catch(error){

    }
});


app.get("/getAllUser", async (req, res) => {
  try {
    const allUser = await User.find({}); 
    res.send({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});  


app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  try {
    // Perform the deletion operation here, for example:
    await User.deleteOne({ _id: userid });
    res.send({ status: "ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

//Last modified one
app.post("/updateUser", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    // Create an object with the fields that you want to update
    //{Chiran}Note for others -> Guys i created a js object to pass values rather than directly sending it like in other methods
    const updatedData = {};
    if (fname) updatedData.fname = fname;
    if (lname) updatedData.lname = lname;
    //if (email) updatedData.email = email;
    if (password) {
      const encryptedPassword = await bcrypt.hash(password, 10);
      updatedData.password = encryptedPassword;
    }
    //if (userType) updatedData.userType = userType;

    // Perform the update operation
    await User.updateOne({ email: email }, updatedData);

    res.send({ status: "ok", data: "Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

































const port = 8000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
