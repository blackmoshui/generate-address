import { Secp256k1HdWallet } from "@cosmjs/amino";
const ethers = require('ethers');
const bip39 = require('bip39');
const fs = require('fs');
const path = require('path');
import * as ed25519 from 'ed25519-hd-key';
const {
    Keypair
  } = require('@solana/web3.js');
import { publicKeyToAddress } from '@unisat/wallet-sdk/lib/address';
import { HdKeyring } from '@unisat/wallet-sdk/lib/keyring';
import { AddressType } from '@unisat/wallet-sdk/lib/types';
import { NetworkType } from '@unisat/wallet-sdk/lib/network';
import Keyring from '@polkadot/keyring';
// const TonWeb = require("tonweb");
// const nacl = require("tweetnacl");

function generateMnemonic(){
    const mnemonic = bip39.generateMnemonic();
    return mnemonic;
}

async function generateCosmosAddress(mnemonic: string, prefix: string = "celestia") {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {prefix: prefix});
    const [{ address, pubkey }] = await wallet.getAccounts();

    return address;
}

// sub address m/44'/60'/0'/0/1 m/44'/60'/0'/0/2 m/44'/60'/0'/0/3 m/44'/60'/0'/0/4
async function generateEVMAddress(mnemonic: string, derivation_path : string = "m/44'/60'/0'/0/0"){
    const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", derivation_path);
    return [hdWallet.privateKey, hdWallet.address];
}

// sub address m/44'/501'/1'/0 m/44'/501'/2'/0 m/44'/501'/3'/0
async function generateSolanaAddress(mnemonic: string, derivation_path : string = "m/44'/501'/0'/0'") {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // Derive a seed from the given path
    const derivedSeed = ed25519.derivePath(derivation_path, seed).key;
    const derivedKeypair = await Keypair.fromSeed(derivedSeed);
    return derivedKeypair.publicKey.toBase58();

}

// different hdPath and different activeIndexes
async function generateBitcoinAddress(mnemonic: string, addressType: any, hdPath: string = "m/86'/0'/0'/0") {
    const keyring = new HdKeyring({
        mnemonic: mnemonic,
        activeIndexes: [0,1],
        hdPath: hdPath, // Taproot
      });
    const account = (await keyring.getAccounts())[0];
    const address = publicKeyToAddress(account, addressType, NetworkType.MAINNET);
    return address;
}

async function generatePolkadotAddress(mnemonic:string, ss58Format: number = 0) {
    const kr = new Keyring({
      type: 'sr25519',
      ss58Format: ss58Format // different format
    });

    const keyPair = kr.createFromUri(mnemonic);
    return keyPair.address;
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

async function generateAddressesAndSave(mnemonic:string, name:string=""){
    const [evmPrivateKey, evmAddress] = await generateEVMAddress(mnemonic);
    const bitcoinTaprootAddress = await generateBitcoinAddress(mnemonic, AddressType.P2TR);
    const bitcoinNativeAddress = await generateBitcoinAddress(mnemonic, AddressType.P2WPKH, "m/84'/0'/0'/0");
    const RGBLNAddress = await generateBitcoinAddress(mnemonic, AddressType.P2WPKH, "m/86/1/0/9/0");
    const celestiaAddress = await generateCosmosAddress(mnemonic);
    const atomAddress = await generateCosmosAddress(mnemonic, "cosmos");
    const solanaAddress = await generateSolanaAddress(mnemonic);
    const polkadotAddress = await generatePolkadotAddress(mnemonic);

    const data = {
      "mnemonic": mnemonic,
      "evm": 
      {
        "privateKey": evmPrivateKey,
        "address": evmAddress,
      },
      "taproot": bitcoinTaprootAddress,
      "native": bitcoinNativeAddress,
      "celestia": celestiaAddress,
      "atom": atomAddress,
      "solana": solanaAddress,
      "dot": polkadotAddress,
      'rgb-ln': RGBLNAddress
    };

    const fileName = `${name}.json`;
    const filePath = path.join(keysDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filePath
}

async function main() {
    if (argv._[0] === 'new') {
      for (let i = 1; i < argv.count; i++) {
        const mnemonic = generateMnemonic();
        const name = `${i}`
        const filePath = await generateAddressesAndSave(mnemonic, name);
        console.log(`Wallet saved to ${filePath}`);
      }
    } else if (argv._[0] === 'regen') {
      const files = fs.readdirSync(keysDir);
      for (const file of files) {
        const filePath = path.join(keysDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const mnemonic = data["mnemonic"];
        const _ = await generateAddressesAndSave(mnemonic);
        console.log(`Wallet update to ${filePath}`);
      }
    } else {
      console.error('Please use either "new" or "regen" command.');
    }
  }

main()