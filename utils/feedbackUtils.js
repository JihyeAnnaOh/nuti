// Utility functions for managing feedback data

/**
 * Get all feedback from localStorage.
 */
export function getLocalFeedback() {
  try {
    const feedback = localStorage.getItem('nutiFeedback');
    return feedback ? JSON.parse(feedback) : [];
  } catch (error) {
    console.error('Error reading local feedback:', error);
    return [];
  }
}

/**
 * Clear all local feedback.
 */
export function clearLocalFeedback() {
  try {
    localStorage.removeItem('nutiFeedback');
    return true;
  } catch (error) {
    console.error('Error clearing local feedback:', error);
    return false;
  }
}

/**
 * Export local feedback as JSON for debugging or support.
 */
export function exportLocalFeedback() {
  try {
    const feedback = getLocalFeedback();
    const dataStr = JSON.stringify(feedback, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `nuti-feedback-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting local feedback:', error);
    return false;
  }
}

/**
 * Compute aggregate statistics across a feedback array.
 */
export function getFeedbackStats(feedback) {
  const stats = {
    total: feedback.length,
    positive: 0,
    negative: 0,
    suggestions: 0,
    bugs: 0,
    localOnly: 0,
    firebase: 0
  };

  feedback.forEach(item => {
    if (item.source === 'local-storage') {
      stats.localOnly++;
    } else {
      stats.firebase++;
    }

    if (item.type) {
      switch (item.type) {
        case 'positive':
          stats.positive++;
          break;
        case 'negative':
          stats.negative++;
          break;
        case 'suggestion':
          stats.suggestions++;
          break;
        case 'bug':
          stats.bugs++;
          break;
      }
    } else if (item.isUseful !== undefined) {
      if (item.isUseful) {
        stats.positive++;
      } else {
        stats.negative++;
      }
    }
  });

  return stats;
}

/**
 * Filter feedback by a UI-selected type.
 */
export function filterFeedback(feedback, filterType) {
  if (filterType === 'all') return feedback;
  
  return feedback.filter(item => {
    if (filterType === 'positive') {
      return item.type === 'positive' || item.isUseful === true;
    }
    if (filterType === 'negative') {
      return item.type === 'negative' || item.isUseful === false;
    }
    if (filterType === 'suggestions') {
      return item.type === 'suggestion';
    }
    if (filterType === 'bugs') {
      return item.type === 'bug';
    }
    if (filterType === 'local') {
      return item.source === 'local-storage';
    }
    if (filterType === 'firebase') {
      return item.source !== 'local-storage';
    }
    return true;
  });
} 