require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("ShopHub is open now!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x65kkeb.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		// Databse and Collection
		const database = client.db("shophub_db");
		const productsCollection = database.collection("products");

		// Products Related API's
		app.get("/products", async (req, res) => {
			const query = {};
			const { email } = req.query;
			if (email) {
				query.email = email;
			}
			const cursor = productsCollection
				.find(query)
				.sort({ created_at: -1 });
			const result = await cursor.toArray();
			res.status(200).send(result);
		});

		app.get("/products/latest", async (req, res) => {
			const cursor = productsCollection
				.find()
				.sort({ created_at: -1 })
				.limit(3);
			const result = await cursor.toArray();
			res.status(200).send(result);
		});

		app.get("/products/:id", async (req, res) => {
			const { id } = req.params;
			const query = { _id: new ObjectId(id) };
			const result = await productsCollection.findOne(query);
			res.status(200).send(result);
		});

		app.post("/products", async (req, res) => {
			const product = req.body;
			product.created_at = new Date();
			const result = await productsCollection.insertOne(product);
			res.status(201).send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
