const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;
require('dotenv').config()

// middlewears======
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]
}))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3jtn0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
	const userCollection = client.db('bistroDB').collection('users')
	const menuCollection = client.db('bistroDB').collection('menu')
	const reviewCollection = client.db('bistroDB').collection('reviews');
	const cartCollection = client.db('bistroDB').collection('carts');


    app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
        res.send({token})
    })



    // user related APIs=========

    app.get('/users', async(req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
    })
    app.post('/users', async(req, res) => {
        const user = req.body;
        const query = {email: user.email}
        const existingUser = await userCollection.findOne(query)
        if(existingUser){
            return res.send({message: "user already exist", insertedId: null}, )
        }
        const result = await userCollection.insertOne(user)
        res.send(result)
    })

    app.patch("/users/admin/:id", async (req, res) => {
        const id = req.params.id 
        const filter = { _id: new ObjectId(id)}
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await userCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })

    app.delete('/users/:id', async(req, res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await userCollection.deleteOne(query)
        res.send(result)
    })

	
// Menu related Api=============
	app.get('/menu', async(req,res) => {
// const menu = req.body
const result = await menuCollection.find().toArray()
		res.send(result)
		
	})

  app.get('/reviews', async(req,res) => {
    // const menu = req.body
    const result = await reviewCollection.find().toArray()
        res.send(result)})
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
app.get('/carts', async(req,res) => {
    const email = req.query.email;
    const query = {email: email}
    const result = await cartCollection.find(query).toArray()
    res.send(result)
})
    app.post('/carts', async(req,res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem)
      res.send(result)
    })

    app.delete('/carts/:id',async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query);
        res.send(result)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
	res.send('bistro boss is running')
})

app.listen(port, () => {
	console.log(`boss is running on port ${port}`)
})