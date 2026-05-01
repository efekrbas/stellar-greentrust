import React, { useState, useEffect } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  fundedAmount: number;
}

export const MilestoneDashboard: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [escrowBalance, setEscrowBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data from our Node.js Backend API
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/milestones');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          setMilestones(data.milestones);
          setEscrowBalance(data.escrowAccountBalance);
        } else {
          throw new Error("API returned success: false");
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
        setError("Failed to load project data. Backend çalışmıyor olabilir mi?");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Projeler Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Project Milestones</h2>
        <p className="text-gray-600 mt-2">Track the funding progress and verification of environmental goals.</p>
        
        {/* Dynamic Balance from Horizon API */}
        <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium shadow-sm">
          Escrow Balance: {escrowBalance} XLM
        </div>
      </div>

      <div className="space-y-6">
        {milestones.map((milestone) => {
          const progress = Math.min((milestone.fundedAmount / milestone.targetAmount) * 100, 100);
          const isFullyFunded = progress >= 100;

          return (
            <div key={milestone.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{milestone.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{milestone.description}</p>
                </div>
                {isFullyFunded && (
                  <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Verified on Stellar</span>
                  </div>
                )}
              </div>

              {/* Progress Bar Container */}
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">{progress.toFixed(0)}% Funded</span>
                  <span className="text-gray-500">{milestone.fundedAmount} / {milestone.targetAmount} XLM</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isFullyFunded ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
