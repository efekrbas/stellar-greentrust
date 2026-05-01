import React from 'react';
import { MilestoneDashboard } from './components/MilestoneDashboard';
import { DonateSection } from './components/DonateSection';

function App() {
  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <header className="bg-green-600 text-white p-6 shadow-md mb-8">
        <h1 className="text-3xl font-bold max-w-4xl mx-auto">🌱 Stellar GreenTrust</h1>
      </header>
      <main className="max-w-4xl mx-auto space-y-8 px-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <DonateSection />
        </div>
        <MilestoneDashboard />
      </main>
    </div>
  )
}

export default App;
