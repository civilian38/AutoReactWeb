// src/pages/ProjectDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateApiDocForm from '../components/CreateApiDocForm'; // ✨ 새로 만들 폼 컴포넌트를 임포트합니다.
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();

  const [apiDocs, setApiDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDoc, setExpandedDoc] = useState(null);

  // ✨ 새 API 문서 생성 폼의 표시 여부를 관리하는 state
  const [isCreating, setIsCreating] = useState(false);

  const fetchApiDocs = useCallback(async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(
        `https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/apidocs/${project_id}/`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      setApiDocs(response.data);
      setError('');
    } catch (err) {
      console.error("API 문서 가져오기 실패:", err);
      setError("API 문서를 불러올 수 없습니다. 다시 시도해주세요.");
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [project_id, navigate]);

  useEffect(() => {
    fetchApiDocs();
  }, [fetchApiDocs]);

  // ✨ API 문서 생성이 성공했을 때 호출될 콜백 함수
  const handleCreateSuccess = () => {
    setIsCreating(false); // 폼을 닫습니다.
    fetchApiDocs();     // API 문서 목록을 다시 불러옵니다.
  };

  const handleToggleDetail = (doc) => {
    if (expandedDoc && expandedDoc.id === doc.id) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc(doc);
    }
  };

  const getMethodClass = (method) => `method-${method.toLowerCase()}`;

  if (isLoading && apiDocs.length === 0) { // 초기 로딩 시에만 전체 로딩 표시
    return <div className="detail-container"><h1>API 문서 로딩 중...</h1></div>;
  }

  if (error) {
    return <div className="detail-container"><h1 className="error-message">{error}</h1></div>;
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h1>API 문서 목록 📄</h1>
        {/* ✨ 버튼 클릭 시 isCreating 상태를 true로 변경하여 폼을 보여줍니다. */}
        <button onClick={() => setIsCreating(true)} className="add-api-doc-button">
          + 새 API 문서 추가
        </button>
      </div>

      {/* isCreating이 true일 때만 CreateApiDocForm을 렌더링합니다. */}
      {isCreating && (
        <div className="create-form-box">
          <CreateApiDocForm
            projectId={project_id}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreating(false)} // 취소 버튼을 위한 콜백
          />
        </div>
      )}

      <div className="api-doc-list">
        {apiDocs.length > 0 ? (
          apiDocs.map(doc => (
            <div key={doc.id} className="api-doc-item-wrapper">
              <div className="api-doc-item" onClick={() => handleToggleDetail(doc)}>
                <div className="api-info">
                  <span className={`api-method ${getMethodClass(doc.http_method)}`}>{doc.http_method}</span>
                  <span className="api-url">{doc.url}</span>
                </div>
                <button className="toggle-button">
                  {expandedDoc?.id === doc.id ? '숨기기 ▲' : '자세히 ▼'}
                </button>
              </div>
              {expandedDoc?.id === doc.id && (
                <div className="api-doc-detail">
                  <p><strong>설명:</strong> {doc.description || '설명이 없습니다.'}</p>
                  <h4>Request Headers</h4>
                  <pre>{JSON.stringify(doc.request_headers || {}, null, 2)}</pre>
                  <h4>Query Params</h4>
                  <pre>{JSON.stringify(doc.query_params || {}, null, 2)}</pre>
                  <h4>Request Body</h4>
                  <pre>{JSON.stringify(doc.request_format || {}, null, 2)}</pre>
                  <h4>Response Body</h4>
                  <pre>{JSON.stringify(doc.response_format || {}, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        ) : (
          !isCreating && <p>이 프로젝트에 작성된 API 문서가 없습니다. 새로 추가해보세요!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
