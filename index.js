const express = require("express");
const cors = require("cors")
const { connection } = require("./config/db");
const { UserModel } = require("./Models/UserModel");
const bcrypt = require("bcrypt");
const { authentication } = require("./Middleware/auth");
const { TodoModel } = require("./Models/TodoModel");
require("dotenv").config();

const app = express();

app.use(cors())

app.use(express.json())

const PORT = process.env.PORT || 5000

app.get("/" , (req,res) => {
    res.send("Hello")
})

app.post("/signup" , async (res, req) => {
    const {name, email, password} = req.body

    const isUser = await UserModel.findOne({email})
    if(isUser){
        res.send( {"msg" :"User already exists, try logging in"})
    }
    else{
    bcrypt.hash(password, 4, async function(err, hash) {
        if(err){
            res.send( {"msg" :"Somthing went wrong, Please try agian later"})
        }
        else{
             
            const new_user = new UserModel({
                name,
                email,
                password : hash
            })
             try{
                await new_user.save()
                res.send( {"msg" :"Sign up successfull"})
             }
             catch(err){
                res.send({ "msg" :"Somthing went wrong"})
             }
           
        }

     
    });
    
  }
})

app.post("/login", async (req, res) => {
     const {email, password} = req.body
     const user = await UserModel.findOne({email})
     const hashed_password = user.password;
     const user_id = user._id;
     bcrypt.compare(password, hashed_password, function(err, result) {
        if(err){
            res.send({"msg" :"Somthing went wrong, try agian later"})
        }
        const token = jwt.sign({ user_id }, process.env.SECRET_KEY);
        if(result){
            res.send({message : "Login succesfully", token})
        }else{
            res.send( {"msg" : "Login Failed"})
        }
    });
})

app.get("/getProfile",authentication, async (req, res) => {
      const {user_id} = req.body

      const user = await UserModel.findOne({_id : user_id})
      const {name, email} = user
      res.send({name,email})
})

app.post("/todos",authentication, async (req,res) => {
    try{
        const new_todo = new TodoModel({
            taskname : req.body.taskname,
            status : req.body.status,
            tag : req.body.tag
        })
        
        const todo_save = await new_todo.save()

        res.send({"msg" : "Submited Successfully", todo_save})
      }
      catch(err){
          res.send({"msg" : "Error"})
          res.send(err)
      }
})



app.get("/todos", async(req, res) => {

     try{
        const todos = await TodoModel.find({});
        
        res.send({"msg" : "Data successfully get"})

     }
     catch(err){
        res.send(err)
     }
})


app.put("/update" ,authentication, async(req,res) => {
       
     try{
        const updateTodo = TodoModel.findByIdAndUpdate(req.params.id, {$set: req.body});

        res.send({"msg" : "Todo Update successfully"})
     }
     catch(err){
        res.send(err)
     }
})

app.delete("/delete/:id",authentication, async(req,res) => {
      try{
         const deleteItem = await TodoModel.findByIdAndDelete(req.params.id)

         res.send({"msg":"Todo Deleted successfully"})
      }
      catch(err){
        res.send(err)
      }

})

app.listen(PORT, async () => {
      
    try{
         await connection
         console.log("Connection to DB successfully")
    }
    catch(err){
          console.log("Error connection to DB")
          console.log(err)
    }
    console.log("Listening on PORT 8000")
})