import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#000',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '900', 
              marginBottom: '1rem',
              color: '#00ff88'
            }}>
              Oops! Something went wrong
            </h1>
            <p style={{ 
              color: '#a0a0a0', 
              fontSize: '1rem',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '2rem', 
                textAlign: 'left',
                backgroundColor: '#1a1a1a',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <summary style={{ cursor: 'pointer', color: '#00ff88', marginBottom: '0.5rem' }}>
                  Error Details (Dev Mode)
                </summary>
                <pre style={{ 
                  color: '#ff6b6b',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre style={{ 
                    color: '#a0a0a0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginTop: '0.5rem'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
