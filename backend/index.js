const express = require('express');
const { Horizon, SorobanRpc, Contract, nativeToScVal, scValToNative, TransactionBuilder, Networks } = require('stellar-sdk');

const app = express();
const port = process.env.PORT || 3001;

// React frontend'in bu API'ye erişebilmesi için CORS ayarları eklendi
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// --- API CONNECTIONS ---
// 1. Horizon API (For standard Stellar Accounts starting with 'G')
const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

// 2. Soroban RPC (For Smart Contracts starting with 'C')
const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

// Admin and Contract IDs
const ADMIN_ACCOUNT_ID = 'GDXT2BHMR7NF3URL45BZBLHNXBDJM64STCWBQOBWFUKC27DTK7PZ3GAF'; 
const CONTRACT_ID = 'CCQCXA3GYJRUBKFOD6HQZQOEJUF7HNHFQDXXCBPOR6NU3EGOBEZRWYBA';

// Mock Database of Milestones
const milestonesDB = [
  {
    id: "1",
    title: "Plant 100 Trees",
    description: "Reforestation of the northern valley region to restore local habitats.",
    targetAmount: 5000,
    fundedAmount: 5000, // 100% funded
  },
  {
    id: "2",
    title: "Clean 1km Beach",
    description: "Remove plastic waste and debris from the western coastline.",
    targetAmount: 2000,
    fundedAmount: 1200,
  }
];

app.get('/api/milestones', async (req, res) => {
  try {
    let contractTotalDonated = 0;

    // Use Soroban RPC to simulate reading the 'TotalDonated' state
    try {
      const contract = new Contract(CONTRACT_ID);
      const operation = contract.call("get_total_donated");
      
      // To simulate, we need a sequence number from the admin account
      const adminAccount = await horizonServer.loadAccount(ADMIN_ACCOUNT_ID);
      
      const tx = new TransactionBuilder(adminAccount, { 
          fee: "100", 
          networkPassphrase: Networks.TESTNET 
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

      const response = await sorobanServer.simulateTransaction(tx);
      
      if (SorobanRpc.Api.isSimulationSuccess(response)) {
        // Handle both older v11 (result) and newer v12 (results) formats
        const resultObj = response.results ? response.results[0] : (response).result;
        if (resultObj && resultObj.retval) {
          const val = scValToNative(resultObj.retval);
          // Convert from stroops to XLM
          contractTotalDonated = Number(val) / 10000000;
        }
      }
    } catch (sorobanError) {
      console.error("Soroban read error:", sorobanError);
    }

    res.json({
      success: true,
      escrowAccountBalance: contractTotalDonated.toString(),
      milestones: milestonesDB
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`🌱 GreenTrust Backend listening on port ${port}`);
  console.log(`Check API at http://localhost:${port}/api/milestones`);
});
