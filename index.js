const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
// app.use(cors());
app.use(express.json());

const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
  app.use(cors(corsConfig))
  app.options("", cors(corsConfig))

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

    const database = client.db("toyDB");
    const toyCollection = database.collection("toys");

    app.get('/toys', async(req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result)
    })


    app.get('/toys/:text', async (req, res) => {
      const searchText = req.params.text;
      console.log(searchText)
      const result = await toyCollection.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } }
        ],
      })
        .toArray()
      res.send(result)
    })

    app.get('/single-toy-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })


    app.get('/categoryToys/:category', async(req, res) => {
      const category = req.params.category;
      const query = {toyCategory: category}
      const result = await toyCollection.find(query).limit(2).toArray();
      res.send(result);
    })

    app.get('/myToys', async(req, res) => {
      console.log(req.query.email);
      const email = req.query?.email;
      const sort = req.query?.priceSort;
      let query = {};
      if(email) {
        query = {sellerEmail: email}
      }
      if(sort == 'ascending') {
        const result = await toyCollection.find(query).sort({price: 1}).toArray();
        res.send(result)
      }
      else if (sort == 'descending') {
        const result = await toyCollection.find(query).sort({price: -1}).toArray();
        res.send(result)
      }
      else {
        const result = await toyCollection.find(query).toArray();
        res.send(result)
      }
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

    app.put('/myToy/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedMyToy = req.body;
      const toy = {
        $set: {
          quantity: updatedMyToy.quantity,
          price: updatedMyToy.price,
          description: updatedMyToy.description
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options);
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
