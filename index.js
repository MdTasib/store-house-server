const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
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

		// user is login, then generate a jwt token
		app.post("/login", async (req, res) => {
			const email = req.body;
			console.log(email);
			const token = jwt.sign(email, process.env.JWT_TOKEN);
			res.send({ token });
		});

		// post data
		app.post("/addItem", async (req, res) => {
			const item = req.body;
			const result = await itemCollection.insertOne(item);
			res.send(result);
		});

		// post data
		// app.post("/addItem", async (req, res) => {
		// 	const item = req.body;
		// 	const tokenInfo = req.headers.authorization;
		// 	const [email, accessToken] = tokenInfo.split(" ");

		// 	const decoded = verifyToken(accessToken);
		// 	console.log(email, decoded?.email);

		// 	if (email === decoded.email) {
		// 		const result = await itemCollection.insertOne(item);
		// 		res.send({ success: "Product uploaded successfully" });
		// 	} else {
		// 		res.send({ success: "UnAuthoraized Access" });
		// 	}
		// });
	} finally {
	}
}

run().catch(console.dir);

app.listen(port, console.log("server running"));

// verify token function
function verifyToken(token) {
	let email;
	jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
		if (err) {
			email = "Invalid email";
		}
		if (decoded) {
			console.log(decoded);
			email = decoded;
		}
	});
	return email;
}
