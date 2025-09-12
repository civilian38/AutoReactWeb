// src/components/CreateApiDocForm.jsx

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JsonEditor from './JsonEditor';
import './CreateApiDocForm.css'; // ✨ 새로운 CSS 파일을 사용합니다.

// 부모로부터 projectId, onSuccess, onCancel props를 받습니다.
const CreateApiDocForm = ({ projectId, onSuccess, onCancel }) => {
  const navigate = useNavigate();

  const [apiData, setApiData] = useState({
    url: '',
    http_method: 'GET',
    description: '',
    request_headers: {},
    query_params: {},
    request_format: {},
    response_format: {},
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApiData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleJsonChange = useCallback((fieldName, jsonObject) => {
    setApiData(prevData => ({ ...prevData, [fieldName]: jsonObject }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
    }

    try {
      await axios.post(
        `https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/apidocs/${projectId}/`,
        apiData,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      // ✨ 성공 시, navigate 대신 부모로부터 받은 onSuccess 콜백을 호출합니다.
      onSuccess();

    } catch (err) {
      console.error("API 문서 생성 실패:", err.response || err);
      setError('API 문서 생성에 실패했습니다. 입력 내용을 확인하고 다시 시도해주세요.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✨ 폼 컨테이너 클래스명을 수정하여 스타일링을 구분합니다.
    <div className="apidoc-form-container">
      <form onSubmit={handleSubmit} className="apidoc-form">
        <h3 className="form-title">새로운 API 문서 생성 ✍️</h3>
        
        <div className="form-group">
          <label htmlFor="url">엔드포인트 URL</label>
          <input
            type="text"
            id="url"
            name="url"
            value={apiData.url}
            onChange={handleInputChange}
            placeholder="/api/v1/users"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="http_method">HTTP Method</label>
          <select
            id="http_method"
            name="http_method"
            value={apiData.http_method}
            onChange={handleInputChange}
            required
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            value={apiData.description}
            onChange={handleInputChange}
            placeholder="이 API가 어떤 역할을 하는지에 대한 간단한 설명"
            rows="3"
          />
        </div>
        
        <JsonEditor title="Request Headers" onJsonChange={(json) => handleJsonChange('request_headers', json)} />
        <JsonEditor title="Query Parameters" onJsonChange={(json) => handleJsonChange('query_params', json)} />
        <JsonEditor title="Request Body Format" onJsonChange={(json) => handleJsonChange('request_format', json)} />
        <JsonEditor title="Response Body Format" onJsonChange={(json) => handleJsonChange('response_format', json)} />

        {error && <p className="error-message">{error}</p>}
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button" disabled={isLoading}>
            취소
          </button>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '생성 중...' : '생성하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateApiDocForm;
