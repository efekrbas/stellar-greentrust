import React, { useState } from 'react';
import { donateToProject } from '../services/soroban';

export const DonateSection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(100); // Default to 100

    const handleDonate = async () => {
        setLoading(true);
        setTxHash(null); // Clear previous hashes
        
        try {
            // Call the function we created above
            const hash = await donateToProject(amount);
            setTxHash(hash);
            alert("Donation successful!");
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="donate-container" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
            <h3>Support this project</h3>
            <div style={{ marginBottom: '10px' }}>
                <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
            </div>
            <button 
                onClick={handleDonate} 
                disabled={loading}
                style={{ 
                    padding: '10px 15px', 
                    backgroundColor: loading ? '#ccc' : '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%'
                }}
            >
                {loading ? "Awaiting Signature..." : "Donate with Freighter"}
            </button>

            {/* Display the transaction hash if successful */}
            {txHash && (
                <div className="success-message" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>Success! Your Transaction Hash is:</p>
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#1565c0', wordBreak: 'break-all' }}
                    >
                        {txHash}
                    </a>
                </div>
            )}
        </div>
    );
};
