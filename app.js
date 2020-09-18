//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://SHARUQ:Password10@cluster007.aasol.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema={
  name:String,
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome To your To-do list"
});

const item2=new Item({
  name:"Hit the + button to add new elements"
});

const item3=new Item({
  name:"<-- Hit this to delete new elements"
});
const defaultItems=[item1,item2,item3];

const listSchema ={
  name:String,
  items: [itemsSchema]
}
const List = mongoose.model("List",listSchema);
app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)
        console.log(err);
        else
        console.log("Success");
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today", newListItems: foundItems});
    }
  });
});
app.get("/:customListName",function(req,res){
  const customeListName= _.capitalize(req.params.customListName);
  List.findOne({name:customeListName},function(err,foundlist){
    if(!err)
    {
      if(!foundlist){
        // create a new list
        const list =new List({
          name:customeListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customeListName);
      } else{
        //find an existing lists
        res.render("list", {listTitle:foundlist.name, newListItems: foundlist.items});
      }
    }

  });

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today")
{
item.save();
res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+listName);
  })
}
});

app.post("/delete",function(req,res){
const checkedItemId =req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){
Item.findByIdAndRemove(checkedItemId,function(err){
  if(err)
  console.log(err);
  else
  console.log("Success deleted checked");

});
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
});
}
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
