import axios from 'axios';
import React, { useState } from 'react';

const Information = () => {
  const [responseData, setResponseData] = useState('');
  const [error, setError] = useState('');

  const onClick = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9000/generateSignature');
      // console.log('Response Data:', response.data);
      setResponseData(response.data); // Store response data in state
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error:', error);
      setError(error.message); // Store error message in state
      setResponseData(null); // Clear response data
    }
  };

  return (
    <div>
      <button onClick={onClick} type="button" className="btn btn-primary">
        Generate Signature
      </button>
      {responseData && (
        <div className="mt-3">
          <h3>Response Data:</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div className="alert alert-danger mt-3">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Information;
