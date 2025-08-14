'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getLocalFeedback, clearLocalFeedback, exportLocalFeedback, getFeedbackStats, filterFeedback } from '../utils/feedbackUtils';

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [localFeedback, setLocalFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    suggestions: 0,
    bugs: 0,
    localOnly: 0,
    firebase: 0,
    avgLatency: 0
  });
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchFeedback();
    loadLocalFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(200));
      const querySnapshot = await getDocs(q);
      
      const feedbackData = [];
      let totalLatency = 0;
      let latencyCount = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        feedbackData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
          source: 'firebase'
        });
        
        if (data.latency && data.latency !== 'unknown') {
          const latencyNum = parseInt(data.latency);
          if (!isNaN(latencyNum)) {
            totalLatency += latencyNum;
            latencyCount++;
          }
        }
      });
      
      setFeedback(feedbackData);
      updateStats(feedbackData, localFeedback);
    } catch (error) {
      console.error('Error fetching Firebase feedback:', error);
      // Continue with local feedback only
    } finally {
      setLoading(false);
    }
  };

  const loadLocalFeedback = () => {
    const local = getLocalFeedback();
    setLocalFeedback(local);
    updateStats(feedback, local);
  };

  const updateStats = (firebaseData, localData) => {
    const allFeedback = [...firebaseData, ...localData];
    const stats = getFeedbackStats(allFeedback);
    
    // Calculate average latency from Firebase data only
    let totalLatency = 0;
    let latencyCount = 0;
    
    firebaseData.forEach(item => {
      if (item.latency && item.latency !== 'unknown') {
        const latencyNum = parseInt(item.latency);
        if (!isNaN(latencyNum)) {
          totalLatency += latencyNum;
          latencyCount++;
        }
      }
    });
    
    stats.avgLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0;
    
    setStats(stats);
  };

  const handleClearLocal = () => {
    if (window.confirm('Are you sure you want to clear all locally stored feedback?')) {
      clearLocalFeedback();
      setLocalFeedback([]);
      updateStats(feedback, []);
    }
  };

  const handleExportLocal = () => {
    exportLocalFeedback();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getFeedbackTypeLabel = (item) => {
    if (item.type) {
      switch (item.type) {
        case 'positive': return '😊 Positive';
        case 'negative': return '😞 Negative';
        case 'suggestion': return '💡 Suggestion';
        case 'bug': return '🐛 Bug Report';
        default: return '💬 General';
      }
    }
    return item.isUseful ? '😊 Useful' : '😞 Not Useful';
  };

  const getFeedbackTypeColor = (item) => {
    if (item.type) {
      switch (item.type) {
        case 'positive': return 'bg-green-100 text-green-800';
        case 'negative': return 'bg-red-100 text-red-800';
        case 'suggestion': return 'bg-blue-100 text-blue-800';
        case 'bug': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return item.isUseful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const allFeedback = [...feedback, ...localFeedback];
  const filteredFeedback = filterFeedback(allFeedback, filterType);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Feedback Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Positive</h3>
          <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Negative</h3>
          <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Suggestions</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.suggestions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Bug Reports</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.bugs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Firebase</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.firebase}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Local Only</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.localOnly}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Avg Latency</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.avgLatency}ms</p>
        </div>
      </div>

      {/* Local Feedback Actions */}
      {stats.localOnly > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-orange-800">Local Feedback Available</h3>
              <p className="text-sm text-orange-700">
                {stats.localOnly} feedback items are stored locally (Firebase unavailable)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportLocal}
                className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={handleClearLocal}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Local
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'positive', 'negative', 'suggestions', 'bugs', 'local', 'firebase'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">
            Recent Feedback {filterType !== 'all' && `(${filteredFeedback.length})`}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredFeedback.map((item, index) => (
            <div key={item.id || `local-${index}`} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(item)}`}>
                      {getFeedbackTypeLabel(item)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    {item.page && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {item.page}
                      </span>
                    )}
                    {item.source && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.source === 'local-storage' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.source === 'local-storage' ? 'Local' : 'Firebase'}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Context:</span> {item.context}
                  </div>
                  
                  {item.feedback && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      "{item.feedback}"
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    {item.confidence && <span>Confidence: {item.confidence}</span>}
                    {item.latency && <span>Latency: {item.latency}</span>}
                    <span>URL: {item.url}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {filteredFeedback.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {filterType === 'all' ? 'No feedback collected yet.' : `No ${filterType} feedback found.`}
        </div>
      )}
    </div>
  );
} 