const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello world");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.do24a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const itemCollection = client.db("storeHouse").collection("items");

		// get all data
		app.get("/products", async (req, res) => {
			const products = await itemCollection.find({}).toArray();
			res.send(products);
		});

		// get all data
		app.get("/productByEmail", async (req, res) => {
			const email = req.query.email;
			const filter = { email: email };
			const products = await itemCollection.find(filter).toArray();
			res.send(products);
		});

		// post data
		app.post("/addItem", async (req, res) => {
			const item = req.body;
			const result = await itemCollection.insertOne(item);
			res.send(result);
		});

		// update single product
		app.put("/product/:id", async (req, res) => {
			const id = req.params.id;
			const product = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };

			const updateData = {
				$set: {
					quantity: product.quantity,
				},
			};

			const result = await itemCollection.updateOne(
				filter,
				updateData,
				options
			);
			res.send(result);
		});

		// delete single data useing id
		app.delete("/product/:id", async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const result = await itemCollection.deleteOne(filter);
			res.send(result);
		});
	} finally {
	}
}

run().catch(console.dir);

app.listen(port, console.log("server running"));
