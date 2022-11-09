const User = require("../models/user");
const fetchUserDetails = async (req, res, next) => {
  const { email } = req.body;
  //email id not provided
  if (!email) res.status(400).send({ errors: [{ msg: "email is required" }] });

  const userDetails = await User.findOne({ email });

  //user not found
  if (!userDetails) res.status(500).send({ msg: "user not found" });

  //wallet address or private key is missing
  if (!userDetails.walletAddress || !userDetails.privateKey)
    res.status(500).send({ msg: "Users details are imcomplete" });

  //setting the details to the request object
  req.walletAddress = userDetails.walletAddress;
  req.privateKey = userDetails.privateKey;

  next();
};

module.exports = fetchUserDetails;
