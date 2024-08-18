"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amino_1 = require("@cosmjs/amino");
const ethers = require('ethers');
const bip39 = require('bip39');
const fs = require('fs');
const path = require('path');
const ed25519 = __importStar(require("ed25519-hd-key"));
const { Keypair } = require('@solana/web3.js');
const address_1 = require("@unisat/wallet-sdk/lib/address");
const keyring_1 = require("@unisat/wallet-sdk/lib/keyring");
const types_1 = require("@unisat/wallet-sdk/lib/types");
const network_1 = require("@unisat/wallet-sdk/lib/network");
const keyring_2 = __importDefault(require("@polkadot/keyring"));
// const TonWeb = require("tonweb");
// const nacl = require("tweetnacl");
function generateMnemonic() {
    const mnemonic = bip39.generateMnemonic();
    return mnemonic;
}
function generateCosmosAddress(mnemonic_1) {
    return __awaiter(this, arguments, void 0, function* (mnemonic, prefix = "celestia") {
        const wallet = yield amino_1.Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: prefix });
        const [{ address, pubkey }] = yield wallet.getAccounts();
        return address;
    });
}
// sub address m/44'/60'/0'/0/1 m/44'/60'/0'/0/2 m/44'/60'/0'/0/3 m/44'/60'/0'/0/4
function generateEVMAddress(mnemonic_1) {
    return __awaiter(this, arguments, void 0, function* (mnemonic, derivation_path = "m/44'/60'/0'/0/0") {
        const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", derivation_path);
        return hdWallet.address;
    });
}
// sub address m/44'/501'/1'/0 m/44'/501'/2'/0 m/44'/501'/3'/0
function generateSolanaAddress(mnemonic_1) {
    return __awaiter(this, arguments, void 0, function* (mnemonic, derivation_path = "m/44'/501'/0'/0'") {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        // Derive a seed from the given path
        const derivedSeed = ed25519.derivePath(derivation_path, seed).key;
        const derivedKeypair = yield Keypair.fromSeed(derivedSeed);
        return derivedKeypair.publicKey.toBase58();
    });
}
// different hdPath and different activeIndexes
function generateBitcoinAddress(mnemonic_1, addressType_1) {
    return __awaiter(this, arguments, void 0, function* (mnemonic, addressType, hdPath = "m/86'/0'/0'/0") {
        const keyring = new keyring_1.HdKeyring({
            mnemonic: mnemonic,
            activeIndexes: [0, 1],
            hdPath: hdPath, // Taproot
        });
        const account = (yield keyring.getAccounts())[0];
        const address = (0, address_1.publicKeyToAddress)(account, addressType, network_1.NetworkType.MAINNET);
        return address;
    });
}
function generatePolkadotAddress(mnemonic_1) {
    return __awaiter(this, arguments, void 0, function* (mnemonic, ss58Format = 0) {
        const kr = new keyring_2.default({
            type: 'sr25519',
            ss58Format: ss58Format // different format
        });
        const keyPair = kr.createFromUri(mnemonic);
        return keyPair.address;
    });
}
// TODO: support TON address
// async function generateTonAddress(mnemonic: string) {
//     const tonwebInstance = new TonWeb();
//     const seed = bip39.mnemonicToSeedSync(mnemonic);
//     const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0,32));
//     console.log(keyPair.secretKey);
//     // Create a wallet using the public key as Uint8Array
//     const publicKey = keyPair.publicKey;
//     const wallet = tonwebInstance.wallet.create({publicKey});
//     // Get the wallet address
//     const walletAddress = (await wallet.getAddress()).toString(true, false, false);
//     return walletAddress;
// }
const argv = require('yargs')
    .command('new', 'Generate new wallets')
    .command('regen', 'Regenerate addresses from existing mnemonics')
    .option('count', {
    alias: 'c',
    type: 'number',
    default: 100,
    describe: 'Number of wallets to generate',
})
    .argv;
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
}
function generateAddressesAndSave(mnemonic) {
    return __awaiter(this, void 0, void 0, function* () {
        const evmAddress = yield generateEVMAddress(mnemonic);
        const bitcoinTaprootAddress = yield generateBitcoinAddress(mnemonic, types_1.AddressType.P2TR);
        const bitcoinNativeAddress = yield generateBitcoinAddress(mnemonic, types_1.AddressType.P2WPKH, "m/84'/0'/0'/0");
        const RGBLNAddress = yield generateBitcoinAddress(mnemonic, types_1.AddressType.P2WPKH, "m/86/1/0/9/0");
        const celestiaAddress = yield generateCosmosAddress(mnemonic);
        const atomAddress = yield generateCosmosAddress(mnemonic, "cosmos");
        const solanaAddress = yield generateSolanaAddress(mnemonic);
        const polkadotAddress = yield generatePolkadotAddress(mnemonic);
        const data = {
            "mnemonic": mnemonic,
            "evm": evmAddress,
            "taproot": bitcoinTaprootAddress,
            "native": bitcoinNativeAddress,
            "celestia": celestiaAddress,
            "atom": atomAddress,
            "solana": solanaAddress,
            "dot": polkadotAddress,
            'rgb': RGBLNAddress
        };
        const fileName = `${evmAddress}.json`;
        const filePath = path.join(keysDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return filePath;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (argv._[0] === 'new') {
            for (let i = 0; i < argv.count; i++) {
                const mnemonic = generateMnemonic();
                const filePath = yield generateAddressesAndSave(mnemonic);
                console.log(`Wallet saved to ${filePath}`);
            }
        }
        else if (argv._[0] === 'regen') {
            const files = fs.readdirSync(keysDir);
            for (const file of files) {
                const filePath = path.join(keysDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const mnemonic = data["mnemonic"];
                const _ = yield generateAddressesAndSave(mnemonic);
                console.log(`Wallet update to ${filePath}`);
            }
        }
        else {
            console.error('Please use either "new" or "regen" command.');
        }
    });
}
main();
