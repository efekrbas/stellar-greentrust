import { isConnected, setAllowed, getPublicKey, signTransaction } from '@stellar/freighter-api';
import { SorobanRpc, TransactionBuilder, Networks, Contract, nativeToScVal, Transaction } from 'stellar-sdk';

const rpcUrl = "https://soroban-testnet.stellar.org";
const server = new SorobanRpc.Server(rpcUrl);
const networkPassphrase = Networks.TESTNET;

// Your Real Stellar GreenTrust Contract on Testnet
const CONTRACT_ID = "CCQCXA3GYJRUBKFOD6HQZQOEJUF7HNHFQDXXCBPOR6NU3EGOBEZRWYBA"; 
const TOKEN_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // Native XLM Token Contract ID on Testnet

export const donateToProject = async (amount: number): Promise<string> => {
    // 1. Connect to Freighter Wallet
    const connected = await isConnected();
    if (!connected) throw new Error("Freighter wallet is not installed.");

    await setAllowed(); // Request permission
    const publicKey = await getPublicKey(); // Get the address
    if (!publicKey) throw new Error("User denied access to wallet.");

    // 2. Fetch the user's account sequence number
    const account = await server.getAccount(publicKey);

    // 3. Build the Contract Operation
    const contract = new Contract(CONTRACT_ID);
    // Convert amount to stroops (7 decimals) and pass as BigInt for i128
    const stroopsAmount = BigInt(amount * 10000000);
    const operation = contract.call(
        "donate", // The exact name of your rust function
        nativeToScVal(publicKey, { type: "address" }),
        nativeToScVal(TOKEN_ADDRESS, { type: "address" }),
        nativeToScVal(stroopsAmount, { type: "i128" })
    );

    // 4. Build the Initial Transaction
    const tx = new TransactionBuilder(account, {
        fee: "100", // Base fee, will be updated during simulation
        networkPassphrase,
    })
    .addOperation(operation)
    .setTimeout(30)
    .build();

    // 5. Simulate Transaction (Crucial Soroban Step to calculate storage footprint)
    const simulatedTx = await server.simulateTransaction(tx);
    
    // Hack for stellar-sdk v11 vs RPC v21 compatibility:
    // The new RPC returns 'results' (array), but older assembleTransaction might look for 'result' (singular)
    if (simulatedTx.results && simulatedTx.results.length > 0 && !(simulatedTx as any).result) {
        (simulatedTx as any).result = simulatedTx.results[0];
    }

    // Assemble the transaction with the simulation results
    const assembledTx = SorobanRpc.assembleTransaction(tx, simulatedTx).build();

    // 6. Sign the Transaction with Freighter
    // This will pop up the Freighter extension asking the user to approve
    const signedXdr = await signTransaction(assembledTx.toXDR(), {
        networkPassphrase,
    });
    
    // Parse the returned string back to a transaction object
    const signedTx = new Transaction(signedXdr, networkPassphrase);

    // 7. Submit to the Stellar Network
    const sendResponse = await server.sendTransaction(signedTx);
    
    if (sendResponse.status === "ERROR") {
        throw new Error("Transaction failed to submit to the network.");
    }

    // Return the Transaction Hash
    return sendResponse.hash;
};
