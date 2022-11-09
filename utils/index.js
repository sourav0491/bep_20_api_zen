const ethers = require("ethers");
const { scrypt, randomBytes } = require("crypto");
const { promisify } = require("util");
const {
  CONTRACT_ABI_MAINNET_BSC,
  CONTRACT_ABI_TESTNET_BSC,
} = require("../constants");

const createWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  const walletAddress = wallet.address;
  const mnemonic = wallet.mnemonic.phrase;
  const privateKey = wallet.privateKey;
  return { walletAddress, mnemonic, privateKey };
};

const scryptAsync = promisify(scrypt);

const toHash = async (password) => {
  const salt = randomBytes(8).toString("hex");
  const buf = await scryptAsync(password, salt, 64);

  return `${buf.toString("hex")}.${salt}`;
};

const compare = async (storedPassword, suppliedPassword) => {
  const [hashedPassword, salt] = storedPassword.split(".");
  const buf = await scryptAsync(suppliedPassword, salt, 64);

  return buf.toString("hex") === hashedPassword;
};

const getProvider = () => {
  if (process.env.NODE_ENV?.trim() === "dev")
    return process.env.QUICKNODE_BSC_TESTNET_PROVIDER;
  else return process.env.QUICKNODE_BSC_MAINNET_PROVIDER;
};

const getContractAddress = () => {
  if (process.env.NODE_ENV?.trim() === "dev")
    return process.env.CONTRACT_ADDRESS_TESTNET_BSC;
  else return process.env.CONTRACT_ADDRESS_MAINNET_BSC;
};

const getContractABI = () => {
  if (process.env.NODE_ENV?.trim() === "dev") return CONTRACT_ABI_TESTNET_BSC;
  else return CONTRACT_ABI_MAINNET_BSC;
};

module.exports = {
  createWallet,
  toHash,
  compare,
  getProvider,
  getContractAddress,
  getContractABI,
};
