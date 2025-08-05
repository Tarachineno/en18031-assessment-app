// Utility to reset all stored data
export const resetAllData = () => {
  // Clear all localStorage data related to the assessment system
  localStorage.removeItem('assessment-store');
  localStorage.removeItem('project-store');
  localStorage.removeItem('evidence-store');
  
  console.log('All assessment data has been cleared from localStorage');
  
  // Reload the page to reinitialize the stores
  window.location.reload();
};

// Function to be called from browser console for manual reset
(window as any).resetAssessmentData = resetAllData;