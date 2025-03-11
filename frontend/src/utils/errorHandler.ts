/**
 * Processes API errors and returns standardized error objects
 */
export const handleApiError = (error: any): { 
  message: string; 
  type: 'connection' | 'notFound' | 'auth' | 'general';
  originalError: any;
} => {
  // Network connection errors (XAMPP not running)
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return {
      message: 'Unable to connect to the server. Please check if XAMPP is running.',
      type: 'connection',
      originalError: error
    };
  }
  
  // Handle specific HTTP status codes
  if (error.response) {
    const status = error.response.status;
    
    // Auth errors
    if (status === 401 || status === 403) {
      return {
        message: 'Authentication error. Please log in again.',
        type: 'auth',
        originalError: error
      };
    }
    
    // Not found errors
    if (status === 404) {
      return {
        message: 'The requested resource was not found.',
        type: 'notFound',
        originalError: error
      };
    }
    
    // Database errors
    if (status === 500) {
      // Check for database connection errors in the response body
      const responseBody = error.response.data;
      
      if (
        responseBody?.error?.includes('Database') || 
        responseBody?.message?.includes('Database') ||
        responseBody?.message?.includes('SQL') ||
        responseBody?.message?.includes('query error') ||
        responseBody?.message?.includes('enqueue Query') ||
        responseBody?.message?.includes('fatal error')
      ) {
        return {
          message: 'Database connection problem. Please check if MySQL is running.',
          type: 'connection',
          originalError: error
        };
      }
    }
  }
  
  // Extract message from structured error
  if (typeof error === 'object' && error !== null) {
    // If error contains database-related text, simplify it
    const errorStr = JSON.stringify(error);
    if (errorStr.includes('Database') || errorStr.includes('query error') || 
        errorStr.includes('enqueue Query') || errorStr.includes('fatal error')) {
      return {
        message: 'Database connection problem. Please try again later.',
        type: 'connection',
        originalError: error
      };
    }
  }
  
  // Default error handling
  return {
    message: error.message || 'An unexpected error occurred. Please try again.',
    type: 'general',
    originalError: error
  };
};
