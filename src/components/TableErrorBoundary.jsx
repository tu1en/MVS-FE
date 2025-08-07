import React from 'react';
import { Alert, Button } from 'antd';

class TableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Table Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is the rawData.some error we're looking for
    if (error.message && error.message.includes('some is not a function')) {
      console.error('Detected rawData.some error - likely caused by non-array data passed to Table component');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message="Table Rendering Error"
          description={
            <div>
              <p>There was an error rendering the table. This usually happens when invalid data is passed to the table component.</p>
              <p><strong>Error:</strong> {this.state.error?.message}</p>
              <Button type="primary" onClick={this.handleRetry} style={{ marginTop: 8 }}>
                Try Again
              </Button>
            </div>
          }
          type="error"
          showIcon
        />
      );
    }

    return this.props.children;
  }
}

export default TableErrorBoundary;