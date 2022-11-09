const routes = require("express").Router();
const {
  createWallet,
  getProvider,
  getContractAddress,
  getContractABI,
} = require("../utils");
const User = require("../models/user");
const { ethers } = require("ethers");
const { body, validationResult } = require("express-validator");

const { fetchUserDetails } = require("../middlewares");

routes.post(
  "/sign-up",
  body("email").exists().isEmail(),
  body("password").exists().isLength({ min: 5 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) res.status(400).send({ errors: errors.array() });

      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("Email in use");
      }

      const walletDetails = createWallet();

      const newUser = new User({
        email,
        password,
        ...walletDetails,
      });

      await newUser.save();

      res.status(201).send(newUser);
    } catch (error) {
      res.status(500).send({ msg: error?.message });
    }
  }
);

routes.post(
  "/deposit",
  fetchUserDetails,
  body("amount").exists(),
  body("fromPrivateKey").exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) res.status(400).send({ errors: errors.array() });

      const { fromPrivateKey, amount } = req.body;

      //setting RPC provider
      const provider = new ethers.providers.JsonRpcProvider(getProvider());

      //account from
      const account_from = {
        privateKey: fromPrivateKey,
      };

      //  Create wallet
      const wallet = new ethers.Wallet(account_from.privateKey, provider);

      //fetching contract for transaction
      const BEP20 = new ethers.Contract(
        getContractAddress(),
        getContractABI(),
        wallet
      );

      // Sign and send tx and wait for receipt
      const createReceipt = await BEP20.transfer(
        req.walletAddress,
        ethers.utils.parseUnits(amount)
      );
      await createReceipt.wait();

      console.log(`Tx successful with hash: ${createReceipt.hash}`);

      res.status(200).send({ transactionHash: createReceipt.hash });
    } catch (error) {
      console.log(error?.message);
      res.status(500).send({ msg: error?.message });
    }
  }
);

routes.post(
  "/withdraw",
  fetchUserDetails,
  body("amount").exists(),
  body("toAddress").exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) res.status(400).send({ errors: errors.array() });

      const { amount, toAddress } = req.body;
      //setting RPC provider
      const provider = new ethers.providers.JsonRpcProvider(getProvider());
      //account from
      const account_from = {
        privateKey: req.privateKey,
      };
      //  Create wallet
      const wallet = new ethers.Wallet(account_from.privateKey, provider);

      //fetching contract for transaction
      const BEP20 = new ethers.Contract(
        getContractAddress(),
        getContractABI(),
        wallet
      );

      // Sign and send tx and wait for receipt
      const createReceipt = await BEP20.transfer(
        toAddress,
        ethers.utils.parseUnits(amount)
      );
      await createReceipt.wait();

      console.log(`Tx successful with hash: ${createReceipt.hash}`);

      res.status(200).send({ transactionHash: createReceipt.hash });
    } catch (error) {
      console.log(error?.message);
      res.status(500).send({ msg: error?.message });
    }
  }
);

module.exports = routes;
