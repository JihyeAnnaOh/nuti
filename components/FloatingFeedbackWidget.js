'use client';
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * FloatingFeedbackWidget
 *
 * Global floating control anchored at the bottom-right of the viewport that
 * captures quick sentiment, suggestions, or bug reports from anywhere.
 * Falls back to localStorage if Firestore is unavailable.
 */
export default function FloatingFeedbackWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

  // Show hint after 5 seconds of page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleFeedbackType = (type) => {
    setFeedbackType(type);
    if (type === 'positive') {
      // Submit positive feedback immediately
      submitFeedback(type, '');
    }
  };

  const submitFeedback = async (type, textFeedback) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFirebaseError(false);
    
    try {
      const feedbackData = {
        type: type, // 'positive', 'negative', 'suggestion', 'bug'
        feedback: textFeedback,
        context: 'overall-experience',
        page: window.location.pathname,
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
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackType(null);
        setFeedback('');
        setIsExpanded(false);
        setFirebaseError(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFirebaseError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitFeedback(feedbackType, feedback);
  };

  const getFeedbackIcon = () => {
    if (isSubmitted) return '✓';
    if (feedbackType === 'positive') return '😊';
    if (feedbackType === 'negative') return '😞';
    if (feedbackType === 'suggestion') return '💡';
    if (feedbackType === 'bug') return '🐛';
    return '💬';
  };

  const getFeedbackTitle = () => {
    if (isSubmitted) return 'Thank you!';
    if (feedbackType === 'positive') return 'Great!';
    if (feedbackType === 'negative') return 'We are sorry';
    if (feedbackType === 'suggestion') return 'Share your idea';
    if (feedbackType === 'bug') return 'Report an issue';
    return 'Feedback';
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-white font-bold text-lg floating-feedback-button ${
          isExpanded 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-[var(--primary)] hover:bg-[var(--primary-light)]'
        } ${showHint && !isExpanded ? 'animate-pulse' : ''}`}
        title="Give us feedback"
        onMouseEnter={() => setShowHint(false)}
      >
        {getFeedbackIcon()}
      </button>

      {/* Hint Tooltip */}
      {showHint && !isExpanded && (
        <div className="absolute bottom-16 right-0 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 animate-in">
          <div className="text-center">
            <p>💡 We&apos;d love your feedback!</p>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 mx-auto mt-1"></div>
          </div>
        </div>
      )}

      {/* Expanded Feedback Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getFeedbackTitle()}
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!isSubmitted ? (
            <>
              {/* Feedback Type Selection */}
              {!feedbackType && (
                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => handleFeedbackType('positive')}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😊</span>
                      <div>
                        <div className="font-medium text-gray-900">I love this!</div>
                        <div className="text-sm text-gray-500">Share what you enjoy</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFeedbackType('negative')}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😞</span>
                      <div>
                        <div className="font-medium text-gray-900">Something&apos;s wrong</div>
                        <div className="text-sm text-gray-500">Tell us what&apos;s not working</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFeedbackType('suggestion')}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <div className="font-medium text-gray-900">I have an idea</div>
                        <div className="text-sm text-gray-500">Suggest improvements</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFeedbackType('bug')}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐛</span>
                      <div>
                        <div className="font-medium text-gray-900">Found a bug</div>
                        <div className="text-sm text-gray-500">Report technical issues</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Feedback Input for non-positive types */}
              {feedbackType && feedbackType !== 'positive' && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {feedbackType === 'negative' && 'What went wrong?'}
                      {feedbackType === 'suggestion' && 'What would you like to see?'}
                      {feedbackType === 'bug' && 'Describe the issue:'}
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={
                        feedbackType === 'negative' ? 'Tell us what happened…' :
                        feedbackType === 'suggestion' ? 'Share your idea…' :
                        'Describe the bug…'
                      }
                      className="w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      rows="4"
                      maxLength="500"
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {feedback.length}/500
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackType(null);
                          setFeedback('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !feedback.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2 animate-bounce">🎉</div>
              <p className="text-green-600 font-medium">Thank you for your feedback!</p>
              <p className="text-sm text-gray-500 mt-1">We appreciate your input.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 