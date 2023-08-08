import express from 'express';
import process from 'node:process';
import bodyParser from 'body-parser';
import { connect } from 'mongoose';
import Transaction from './models/addTransaction.js';
import User from './models/User.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import helmet from 'helmet'

const app = express();
const PORT = process.env.PORT || 3000;
app.set('port', PORT);
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
// DB Connection
await connect('mongodb://127.0.0.1:27017/Pitaka');



app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello World!',
  });
});

// View all Transactions
app.get("/transactions", async (req, res) => {

  const allTransaction = await Transaction.find();

  res.send({ data: allTransaction })

})

// Add Transaction
app.post('/transactions', async (req, res) => {
  try {
    const { user, title, amount, date, category } = req.body;



    const newTransaction = new Transaction({
      user: user,
      title: title,
      amount: amount,
      date: date,
      category: category
    });

    await newTransaction.save();

    res.status(201).json({
      message: 'New Transaction Added',
      data: newTransaction
    });
  }
  catch (error) {
    res.status(500).send('Error in adding new transaction')
  }

});

// Update User
app.put("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, name } = req.body;


  const updatedData = await User.findByIdAndUpdate(id, { username, password, name })


  res.status(201).json({
    message: "Data Updated!",
    data: updatedData
  })
})

// Delete Transaction
app.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.deleteOne({ _id: id });

    res.send({
      message: 'Delete Successful',
      data: deletedTransaction,
    });
  } catch (error) {
    console.error('Error deleting Transaction', error)
  }
});

// Get Category Data 
app.get('/transactions/:category/:user', (req, res) => {
  const filterCategory = req.params;


  Transaction.find(filterCategory)
    .then((filteredData) => {
      const totalAmount = filteredData.reduce((accumulator, dataItem) => accumulator + dataItem.amount, 0);
      res.send({ totalAmount });

    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error calculating total amount');
    });
});


// Registration
app.post('/registration', async (req, res) => {
  try {
    const { username, password, name } = req.body;

    const newUser = new User({
      username: username,
      password: password,
      name: name
    });

    await newUser.save();

    res.status(201).json({
      message: 'New User Added',
      data: newUser
    });
  }
  catch (error) {
    res.status(500).send('Error in adding new User')
  }

});

//Login with JWT
const secretKey = 'secret';

app.post('/login', async (req, res) => {
  // JWT Token
  // Add the payload to the token

  const { username, password } = req.body;
  // Find the user with the given username
  const user = await User.findOne({ username: username })

  // Check if the user exists
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.password != password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({
    userID: user._id,
    username: user.username,
    password: user.password,
    name: user.name
  }, secretKey);


  res.status(201).json({
    token,
  });
});

app.get('/protected', async (req, res) => {
  const authorization = req.headers.authorization;

  // To check value of Authorization
  if (!authorization) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const [, token] = authorization.split(' ');
  const payload = jwt.verify(token, secretKey);


  res.status(200).json(
    payload.userID
  );
});

// Get the User Name
app.get("/users", async (req, res) => {

  const name = await User.find();


  res.send({ data: name })

})

// CHECK Username
app.get('/CheckUsername', async (req, res) => {
  const username = req.query.username;

  try {
    const user = await User.findOne({ username });

    if (user) {
      // Username is taken
      res.json({ isTaken: true });
    } else {
      // Username is available
      res.json({ isTaken: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(PORT, () => {
  console.log(`App is listening to port ${PORT}`);
});
