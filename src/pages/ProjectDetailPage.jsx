// src/pages/ProjectDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
  const { id } = useParams(); // URL의 :id 값을 가져옴
  const navigate = useNavigate();

  const [apiDocs, setApiDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 확장된 API 문서의 ID와 상세 데이터를 저장할 state
  const [expandedDocId, setExpandedDocId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchApiDocs = async () => {
      try {
        const response = await axios.get(
          `https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/apidocs/${id}/`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );
        setApiDocs(response.data);
      } catch (err) {
        console.error('API 문서 목록 조회 실패:', err);
        setError('API 문서 목록을 불러오는 데 실패했습니다.');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchApiDocs();
  }, [id, navigate]);

  const handleToggleDetail = async (docId) => {
    // 이미 열려있는 문서를 다시 클릭하면 닫음
    if (expandedDocId === docId) {
      setExpandedDocId(null);
      setDetailData(null);
      return;
    }
    
    // 새로운 문서를 열기 전 초기화
    setDetailData(null);
    setExpandedDocId(docId);
    setDetailLoading(true);
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(
        `https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/apidocs/detail/${docId}/`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      setDetailData(response.data);
    } catch (err) {
      console.error('API 상세 정보 조회 실패:', err);
      setError('API 상세 정보를 불러오는 데 실패했습니다.');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setDetailLoading(false);
    }
  };
  
  // HTTP 메서드에 따라 클래스 이름을 반환하는 함수
  const getMethodClassName = (method) => {
    return `method-${method.toLowerCase()}`;
  };

  if (loading) return <div className="detail-container"><h1>API 문서 목록 로딩 중...</h1></div>;
  if (error) return <div className="detail-container"><h1 className="error-message">{error}</h1></div>;

  return (
    <div className="detail-container">
      <h1>API 문서 목록 📄</h1>
      <div className="api-doc-list">
        {apiDocs.length > 0 ? (
          apiDocs.map(doc => (
            <div key={doc.id} className="api-doc-item-wrapper">
              <div className="api-doc-item">
                <div className="api-info">
                  <span className={`api-method ${getMethodClassName(doc.http_method)}`}>{doc.http_method}</span>
                  <span className="api-url">{doc.url}</span>
                </div>
                <button onClick={() => handleToggleDetail(doc.id)} className="toggle-button">
                  {expandedDocId === doc.id ? '숨기기 ▲' : '자세히 ▼'}
                </button>
              </div>
              {/* 확장된 상태일 때 상세 정보 표시 */}
              {expandedDocId === doc.id && (
                <div className="api-doc-detail">
                  {detailLoading ? <p>상세 정보 로딩 중...</p> : 
                    detailData ? (
                      <>
                        {/* ✨ 설명은 항상 표시 */}
                        <p><strong>설명:</strong> {detailData.description}</p>
                        
                        {/* ✨ request_headers에 내용이 있을 때만 표시 */}
                        {Object.keys(detailData.request_headers).length > 0 && (
                          <>
                            <h4>Request Headers</h4>
                            <pre>{JSON.stringify(detailData.request_headers, null, 2)}</pre>
                          </>
                        )}

                        {/* ✨ query_params에 내용이 있을 때만 표시 */}
                        {Object.keys(detailData.query_params).length > 0 && (
                          <>
                            <h4>Query Params</h4>
                            <pre>{JSON.stringify(detailData.query_params, null, 2)}</pre>
                          </>
                        )}
                        
                        {/* ✨ request_format에 내용이 있을 때만 표시 */}
                        {Object.keys(detailData.request_format).length > 0 && (
                          <>
                            <h4>Request Body</h4>
                            <pre>{JSON.stringify(detailData.request_format, null, 2)}</pre>
                          </>
                        )}

                        {/* ✨ response_format에 내용이 있을 때만 표시 */}
                        {Object.keys(detailData.response_format).length > 0 && (
                          <>
                            <h4>Response Body</h4>
                            <pre>{JSON.stringify(detailData.response_format, null, 2)}</pre>
                          </>
                        )}
                      </>
                    ) : <p>상세 정보를 불러오지 못했습니다.</p>
                  }
                </div>
              )}
            </div>
          ))
        ) : (
          <p>이 프로젝트에는 아직 작성된 API 문서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
