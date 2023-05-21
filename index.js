const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3bglkkp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("toyDB");
    const toyCollection = database.collection("toys");

    app.get('/toys', async(req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result)
    })

    app.get('/toys/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.findOne(query);
      res.send(result)
    })

    app.get('/categoryToys/:category', async(req, res) => {
      const category = req.params.category;
      const query = {toyCategory: category}
      const result = await toyCollection.find(query).limit(2).toArray();
      res.send(result);
    })

    app.get('/myToys', async(req, res) => {
      console.log(req.query.email);
      let query = {};
      if(req.query?.email) {
        query = {sellerEmail: req.query.email}
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result)
    })
    
    app.post('/toys', async(req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result)
    })

    app.delete('/myToy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('toy marketplace server is running');
})

app.listen(port, () => {
    console.log(`toy marketplace server is running on ${port}`);
})
