/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ArchitectureHero } from './components/ArchitectureHero';
import { SubmitRequest } from './components/SubmitRequest';
import { Dashboard } from './components/Dashboard';
import { HotspotsTable } from './components/HotspotsTable';
import { DistrictMap } from './components/DistrictMap';
import { LiveFeed } from './components/LiveFeed';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { AboutSection } from './components/AboutSection';
import { CitizenRequest, DistrictHotspot } from './types';
import { storageService } from './services/storageService';
import { aggregateDistrictHotspots } from './utils/calculations';
import { 
  Building2, 
  Send, 
  LayoutDashboard, 
  Flame, 
  Radio, 
  Info, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'submit' | 'dashboard' | 'hotspots' | 'feed' | 'about'>('home');
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [selectedHotspotForAI, setSelectedHotspotForAI] = useState<DistrictHotspot | null>(null);
  const [recentlySubmitted, setRecentlySubmitted] = useState<CitizenRequest | null>(null);

  // Subscribe to real-time updates from storageService
  useEffect(() => {
    const unsubscribe = storageService.subscribe((updatedRequests) => {
      setRequests(updatedRequests);
    });
    return () => unsubscribe();
  }, []);

  // Recalculate hotspots deterministically in real-time as requests change
  const hotspots: DistrictHotspot[] = useMemo(() => {
    return aggregateDistrictHotspots(requests);
  }, [requests]);

  const handleRequestSubmitted = (newRequest: CitizenRequest) => {
    setRecentlySubmitted(newRequest);
  };

  const handleResetData = () => {
    if (confirm('Reset all citizen requests back to the default synthetic dataset (125 requests across India)?')) {
      storageService.resetToDefaultDemoData();
      setRecentlySubmitted(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalRequests={requests.length}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <ArchitectureHero
              onNavigate={(tab) => setActiveTab(tab)}
              totalRequests={requests.length}
            />

            {/* Quick Teaser of Live Dashboard & Hotspots */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              {/* National Map & Hotspots Quick View */}
              <DistrictMap
                hotspots={hotspots}
                onSelectDistrict={(h) => setSelectedHotspotForAI(h)}
              />

              {/* Top Hotspots Table */}
              <HotspotsTable
                hotspots={hotspots.slice(0, 5)}
                onSelectDistrictForAI={(h) => setSelectedHotspotForAI(h)}
              />

              {/* Call to Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div 
                  onClick={() => setActiveTab('submit')}
                  className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        Voice or Text Intake
                      </h3>
                      <p className="text-xs text-slate-400">
                        Submit development needs in Marathi, Hindi, or English.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test the complete flow with your own voice or sample prompts. Google Gemini extracts problem categories, urgency, and demographics in real-time.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('dashboard')}
                  className="bg-gradient-to-br from-slate-900 to-slate-950 border border-sky-500/30 hover:border-sky-500/60 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        Policymaker Intelligence Dashboard
                      </h3>
                      <p className="text-xs text-slate-400">
                        6 real-time charts and live urgency distributions.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Watch the charts and hotspot signals update instantly as citizens voice demands across India, without manual page refreshes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submit' && (
          <SubmitRequest
            onSuccess={handleRequestSubmitted}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <Dashboard
              requests={requests}
              hotspots={hotspots}
              onSelectDistrictForAI={(h) => setSelectedHotspotForAI(h)}
              onNavigateToHotspots={() => setActiveTab('hotspots')}
            />

            {/* Embedded District Map inside Dashboard */}
            <div className="max-w-7xl mx-auto px-4">
              <DistrictMap
                hotspots={hotspots}
                onSelectDistrict={(h) => setSelectedHotspotForAI(h)}
              />
            </div>
          </div>
        )}

        {activeTab === 'hotspots' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
            <DistrictMap
              hotspots={hotspots}
              onSelectDistrict={(h) => setSelectedHotspotForAI(h)}
            />
            <HotspotsTable
              hotspots={hotspots}
              onSelectDistrictForAI={(h) => setSelectedHotspotForAI(h)}
            />
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <LiveFeed requests={requests} />
          </div>
        )}

        {activeTab === 'about' && (
          <AboutSection />
        )}
      </main>

      {/* AI Policymaker Recommendation Modal Overlay */}
      {selectedHotspotForAI && (
        <AIRecommendationsView
          hotspot={selectedHotspotForAI}
          onClose={() => setSelectedHotspotForAI(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">JansevaHelp-AI</span>
            <span>— “Turning citizen voices into smarter development priorities.”</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Built with Google Gemini 3.8</span>
            <span>•</span>
            <span>Code for Communities</span>
            <span>•</span>
            <span className="text-amber-500/80">Synthetic/Demo Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
