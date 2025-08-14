import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function FeedbackWidget({ 
  context, 
  confidence, 
  latency, 
  className = "" 
}) {
  const [isUseful, setIsUseful] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

  const handleFeedback = async (useful) => {
    setIsUseful(useful);
    
    if (useful === false) {
      // Show feedback input for negative feedback
      return;
    }
    
    // Submit positive feedback immediately
    await submitFeedback(useful, '');
  };

  const submitFeedback = async (useful, textFeedback) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFirebaseError(false);
    
    try {
      const feedbackData = {
        isUseful: useful,
        feedback: textFeedback,
        context: context || 'unknown',
        confidence: confidence || 'unknown',
        latency: latency || 'unknown',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Try Firebase first
      try {
        await addDoc(collection(db, 'feedback'), {
          ...feedbackData,
          timestamp: serverTimestamp()
        });
      } catch (firebaseErr) {
        console.warn('Firebase submission failed, using local storage fallback:', firebaseErr);
        setFirebaseError(true);
        
        // Fallback to local storage
        const existingFeedback = JSON.parse(localStorage.getItem('nutiFeedback') || '[]');
        existingFeedback.push({
          ...feedbackData,
          id: Date.now().toString(),
          source: 'local-storage'
        });
        localStorage.setItem('nutiFeedback', JSON.stringify(existingFeedback));
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFirebaseError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitFeedback(isUseful, feedback);
  };

  if (isSubmitted) {
    return (
      <div className={`text-sm ${className}`}>
        <div className="text-green-600 mb-1">✓ Thank you for your feedback!</div>
        {firebaseError && (
          <div className="text-xs text-orange-600 bg-orange-50 p-1 rounded">
            ⚠️ Saved locally (Firebase unavailable)
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-600">Was this useful?</span>
        <button
          onClick={() => handleFeedback(true)}
          disabled={isSubmitting}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            isUseful === true
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={isSubmitting}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            isUseful === false
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          No
        </button>
      </div>

      {isUseful === false && (
        <form onSubmit={handleSubmit} className="mt-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What could be improved? (optional)"
            className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
            rows="2"
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {feedback.length}/500
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 