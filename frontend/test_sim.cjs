const { SorobanRpc, TransactionBuilder, Networks, Contract, nativeToScVal } = require('stellar-sdk');

async function main() {
    const rpcUrl = "https://soroban-testnet.stellar.org";
    const server = new SorobanRpc.Server(rpcUrl);
    const networkPassphrase = Networks.TESTNET;

    const CONTRACT_ID = "CCQCXA3GYJRUBKFOD6HQZQOEJUF7HNHFQDXXCBPOR6NU3EGOBEZRWYBA"; 
    const TOKEN_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

    const publicKey = "GDXT2BHMR7NF3URL45BZBLHNXBDJM64STCWBQOBWFUKC27DTK7PZ3GAF"; 

    try {
        const account = await server.getAccount(publicKey);
        const contract = new Contract(CONTRACT_ID);
        const stroopsAmount = BigInt(100 * 10000000);
        const operation = contract.call(
            "donate", 
            nativeToScVal(publicKey, { type: "address" }),
            nativeToScVal(TOKEN_ADDRESS, { type: "address" }),
            nativeToScVal(stroopsAmount, { type: "i128" })
        );

        const tx = new TransactionBuilder(account, {
            fee: "100", 
            networkPassphrase,
        })
        .addOperation(operation)
        .setTimeout(30)
        .build();

        const simulatedTx = await server.simulateTransaction(tx);
        console.log(JSON.stringify(simulatedTx, null, 2));
    } catch (e) {
        console.error(e);
    }
}
main();
