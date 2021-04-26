const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const Category = require('./models/category')
require("dotenv").config();
let Parser = require('rss-parser');
const { default: axios } = require("axios");
let parser = new Parser();

// app
const app = express();

// port
const port = process.env.PORT || 8000;

// db
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`DB connection error - ${err}`));

// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cors());


const fetchNow = async (title, count) => (await axios.get(`https://gnews.io/api/v4/search?q=${title}&token=${process.env.TOKEN}&max=${count}`))


app.get('/search/:title/:count', (req, res) => {
  try {
    const { title, count } = req.params;
    fetchNow(title, count)
      .then(res1 => {
        const obj = {
          name: title,
          data: res1.data
        }
        res.json(obj)
      })
  } catch (error) {
    res.status(404).send(error.message)
  }

})

app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories)
  } catch (error) {
    res.status(404).send(error.message)
  }
})

app.post('/category/add', async (req, res) => {
  try {
    const { name } = req.body;
    const existCat = await Category.findOne({ name: name }).exec()
    if (existCat) {
      console.log(existCat)
      res.status(404).send("error.message")
      console.log('here')
    }
    else {
      const newCat =await new Category({ name }).save();
      console.log('sadkhdshajkdh')
      console.log(newCat)
      res.json(newCat)
    }
  } catch (error) {
    res.status(404).send("error.message")
  }
})

app.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCat = await Category.findByIdAndDelete(id).exec()
    res.json(deletedCat)
  } catch (error) {
    res.status(404).send(error.message)
  }
})

app.listen(port, () => console.log(`Running server on PORT ${port}`));
