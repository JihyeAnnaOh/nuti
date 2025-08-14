'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, suggestions: 0, bugs: 0, avgLatency: 0 });
  const [filterType, setFilterType] = useState('all');
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(200));
        const querySnapshot = await getDocs(q);

        const feedbackData = [];
        let totalLatency = 0;
        let latencyCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          feedbackData.push({ id: doc.id, ...data, timestamp: data.timestamp?.toDate?.() || new Date(), source: 'firebase' });

          if (data.latency && data.latency !== 'unknown') {
            const latencyNum = parseInt(data.latency);
            if (!isNaN(latencyNum)) {
              totalLatency += latencyNum;
              latencyCount++;
            }
          }
        });

        // Merge with locally saved feedback (if any)
        const localFeedback = getLocalFeedback();
        const allFeedback = [...feedbackData, ...localFeedback];

        setFeedback(allFeedback);
        setFirebaseAvailable(true);

        const positive = allFeedback.filter((f) => f.isUseful === true || f.type === 'positive').length;
        const negative = allFeedback.filter((f) => f.isUseful === false || f.type === 'negative').length;
        const suggestions = allFeedback.filter((f) => f.type === 'suggestion').length;
        const bugs = allFeedback.filter((f) => f.type === 'bug').length;
        const avgLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0;

        setStats({ total: allFeedback.length, positive, negative, suggestions, bugs, avgLatency });
      } catch (error) {
        console.error('Error fetching feedback from Firebase:', error);
        const localFeedback = getLocalFeedback();
        setFeedback(localFeedback);
        setFirebaseAvailable(false);

        const positive = localFeedback.filter((f) => f.isUseful === true || f.type === 'positive').length;
        const negative = localFeedback.filter((f) => f.isUseful === false || f.type === 'negative').length;
        const suggestions = localFeedback.filter((f) => f.type === 'suggestion').length;
        const bugs = localFeedback.filter((f) => f.type === 'bug').length;
        setStats({ total: localFeedback.length, positive, negative, suggestions, bugs, avgLatency: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  function getLocalFeedback() {
    try {
      const raw = localStorage.getItem('nutifeedback');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return arr.map((item) => ({ ...item, savedLocally: true, source: 'local-storage' }));
    } catch {
      return [];
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
    let date;
    if (typeof timestamp === 'string') date = new Date(timestamp);
    else if (timestamp?.toDate) date = timestamp.toDate();
    else date = timestamp;
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function getFeedbackTypeLabel(item) {
    if (item.type) {
      switch (item.type) {
        case 'positive':
          return '😊 Positive';
        case 'negative':
          return '😞 Negative';
        case 'suggestion':
          return '💡 Suggestion';
        case 'bug':
          return '🐛 Bug Report';
        default:
          return '💬 General';
      }
    }
    return item.isUseful ? '😊 Useful' : '😞 Not Useful';
  }

  function getFeedbackTypeColor(item) {
    if (item.type) {
      switch (item.type) {
        case 'positive':
          return 'bg-green-100 text-green-800';
        case 'negative':
          return 'bg-red-100 text-red-800';
        case 'suggestion':
          return 'bg-blue-100 text-blue-800';
        case 'bug':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    return item.isUseful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  const filteredFeedback =
    filterType === 'all'
      ? feedback
      : feedback.filter((item) => {
          if (filterType === 'positive') return item.isUseful === true || item.type === 'positive';
          if (filterType === 'negative') return item.isUseful === false || item.type === 'negative';
          if (filterType === 'suggestions') return item.type === 'suggestion';
          if (filterType === 'bugs') return item.type === 'bug';
          return true;
        });

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

      {!firebaseAvailable && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-orange-600">⚠️</span>
            <p className="text-orange-800">Firebase is currently unavailable. Showing locally stored feedback only.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Feedback</h3>
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
          <h3 className="text-sm font-medium text-gray-500">Avg Latency</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.avgLatency}ms</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'positive', 'negative', 'suggestions', 'bugs'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Recent Feedback {filterType !== 'all' && `(${filteredFeedback.length})`}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredFeedback.map((item, index) => (
            <div key={item.id || `local-${index}`} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(item)}`}>{getFeedbackTypeLabel(item)}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</span>
                    {item.page && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{item.page}</span>}
                    {item.savedLocally && <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">📱 Local</span>}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Context:</span> {item.context}
                  </div>
                  {item.feedback && <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{item.feedback}</div>}
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
        <div className="text-center py-12 text-gray-500">{filterType === 'all' ? 'No feedback collected yet.' : `No ${filterType} feedback found.`}</div>
      )}
    </div>
  );
}