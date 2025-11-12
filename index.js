const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
let port = 8080;
const path = require("path");
const { v4: uuidv4 } = require("uuid");  
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'DELTA_APP',
  password: 'Shiv@2000'
});


let getRandomUser = ()=> {
  return [
    faker.string.uuid(),
     faker.internet.username(),
    faker.internet.email(),
     faker.internet.password(),
  ];
};

//home 
app.get("/",(req,res)=>{
  let q =`SELECT count(*) FROM user`;
  try{
  conn.query(q,(err,result)=>{
  if(err) throw err;
  let count = result[0]["count(*)"];
  res.render("home.ejs",{count});
  });
  }catch(err){
  console.log(err);
  res.send("error");
  }
  });


//show user
app.get("/user",(req,res)=>{
  let q = `SELECT * FROM user`;
  try{
  conn.query(q,(err,users)=>{
  if(err) throw err;
  res.render("showuser.ejs",{users});
  });
  }catch(err){
  console.log(err);
  res.send("error");
  }
  });

//edit
app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let q =  `SELECT * FROM user WHERE id ='${id}'`;
   try{
    conn.query(q,(err,results)=>{
    if(err) throw err;
    let user = results[0];
    console.log(results);
    res.render("editform.ejs",{user});
  });
  }catch(err){
  res.send("error");
  }
});

//update
app.patch("/user/:id",(req,res)=>{
   let {id} = req.params;
   let {password:formPass,username:newUsername} = req.body;
   let q =  `SELECT * FROM user WHERE id ='${id}'`;
  try{
    conn.query(q,(err,results)=>{
    if(err) throw err;
    let user = results[0];
    if(formPass !=user.password){
      res.send("Wrong password!Please try again");
    }else{
      let q2 = `UPDATE user SET username = '${newUsername}' WHERE id ='${id}'`;
       conn.query(q2,(err,result)=>{
        if(err) throw err;
        res.redirect("/user");
       });
    }
     
  });
  }catch(err){
  res.send("error");
  }
});

//create form for new post
app.get("/user/new",(req,res)=>{
    res.render("new.ejs");
});
//add
app.post("/user",(req,res)=>{
    let { username, email, password } = req.body;
    let id = uuidv4();
    let user = {id, username, email, password};
    let q = "INSERT INTO user ?";
    conn.query(q, user,(err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error inserting user");
        }
        res.redirect("/user");
    });
});

//delete
app.get("/user/delete", (req, res) => {
    res.render("delete.ejs");
});


app.post("/user/delete", (req, res) => {
    const { id, password } = req.body;

    const q = "SELECT * FROM user WHERE id = ?";
    conn.query(q, [id], (err, results) => {
        if (err) throw err;

        if (results.length === 0) return res.send("User not found");

        const user = results[0];
        if (password !== user.password) return res.send("Wrong password!");

        const deleteQuery = "DELETE FROM user WHERE id = ?";
        conn.query(deleteQuery, [id], (err, result) => {
            if (err) throw err;
            res.redirect("/user");
        });
    });
});



app.listen(port,()=>{
  console.log("Server is listening to port 8080");
});










