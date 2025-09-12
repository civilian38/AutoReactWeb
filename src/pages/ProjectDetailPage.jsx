// src/pages/ProjectDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateApiDocForm from '../components/CreateApiDocForm';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
    const { project_id } = useParams();
    const navigate = useNavigate();

    const [apiDocs, setApiDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // ✨ 수정: 확장된 문서의 ID와 상세 데이터를 별도로 관리합니다.
    const [expandedDocId, setExpandedDocId] = useState(null);
    const [detailedDoc, setDetailedDoc] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

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

    const handleCreateSuccess = () => {
        setIsCreating(false);
        fetchApiDocs();
    };
    
    // ✨ 수정: 상세 정보 조회 로직 추가
    const handleToggleDetail = async (docId) => {
        // 이미 열려있는 문서를 다시 클릭하면 닫습니다.
        if (expandedDocId === docId) {
            setExpandedDocId(null);
            setDetailedDoc(null);
            return;
        }

        // 새로운 문서를 클릭하면 상세 정보를 불러옵니다.
        setExpandedDocId(docId);
        setIsDetailLoading(true);
        setDetailedDoc(null); // 이전 데이터 초기화

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(
                `https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/apidocs/detail/${docId}/`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            setDetailedDoc(response.data);
        } catch (err) {
            console.error("API 상세 정보 가져오기 실패:", err);
            setError("상세 정보를 불러오는 데 실패했습니다.");
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const getMethodClass = (method) => `method-${method.toLowerCase()}`;
    
    // ✨ 추가: 객체가 비어있는지 확인하는 헬퍼 함수
    const isObjectNotEmpty = (obj) => obj && Object.keys(obj).length > 0;

    if (isLoading && apiDocs.length === 0) {
        return <div className="detail-container"><h1>API 문서 로딩 중...</h1></div>;
    }

    if (error) {
        return <div className="detail-container"><h1 className="error-message">{error}</h1></div>;
    }

    return (
        <div className="detail-container">
            <div className="detail-header">
                <h1>API 문서 목록 📄</h1>
                <button onClick={() => setIsCreating(true)} className="add-api-doc-button">
                    + 새 API 문서 추가
                </button>
            </div>

            {isCreating && (
                <div className="create-form-box">
                    <CreateApiDocForm
                        projectId={project_id}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            )}

            <div className="api-doc-list">
                {apiDocs.length > 0 ? (
                    apiDocs.map(doc => (
                        <div key={doc.id} className="api-doc-item-wrapper">
                            <div className="api-doc-item" onClick={() => handleToggleDetail(doc.id)}>
                                <div className="api-info">
                                    <span className={`api-method ${getMethodClass(doc.http_method)}`}>{doc.http_method}</span>
                                    <span className="api-url">{doc.url}</span>
                                </div>
                                <button className="toggle-button">
                                    {expandedDocId === doc.id ? '숨기기 ▲' : '자세히 ▼'}
                                </button>
                            </div>
                            {/* ✨ 수정: 상세 정보 표시 로직 변경 */}
                            {expandedDocId === doc.id && (
                                <div className="api-doc-detail">
                                    {isDetailLoading && <p>상세 정보를 불러오는 중...</p>}
                                    {detailedDoc && !isDetailLoading && (
                                        <>
                                            {detailedDoc.description && (
                                                <p><strong>설명:</strong> {detailedDoc.description}</p>
                                            )}
                                            
                                            {isObjectNotEmpty(detailedDoc.request_headers) && (
                                                <>
                                                    <h4>Request Headers</h4>
                                                    <pre>{JSON.stringify(detailedDoc.request_headers, null, 2)}</pre>
                                                </>
                                            )}

                                            {isObjectNotEmpty(detailedDoc.query_params) && (
                                                <>
                                                    <h4>Query Params</h4>
                                                    <pre>{JSON.stringify(detailedDoc.query_params, null, 2)}</pre>
                                                </>
                                            )}

                                            {isObjectNotEmpty(detailedDoc.request_format) && (
                                                <>
                                                    <h4>Request Body</h4>
                                                    <pre>{JSON.stringify(detailedDoc.request_format, null, 2)}</pre>
                                                </>
                                            )}
                                            
                                            {isObjectNotEmpty(detailedDoc.response_format) && (
                                                <>
                                                    <h4>Response Body</h4>
                                                    <pre>{JSON.stringify(detailedDoc.response_format, null, 2)}</pre>
                                                </>
                                            )}
                                        </>
                                    )}
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
