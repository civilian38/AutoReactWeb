// src/pages/ProjectDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ✨ 변경: axios를 중앙 관리되는 api 인스턴스로 교체
import api from '../api/axiosInstance';
import CreateApiDocForm from '../components/CreateApiDocForm';
import EditApiDocForm from '../components/EditApiDocForm';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
    const { project_id } = useParams();
    const navigate = useNavigate(); // useNavigate는 여전히 필요할 수 있으므로 유지합니다.

    const [apiDocs, setApiDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [expandedDocId, setExpandedDocId] = useState(null);
    const [detailedDoc, setDetailedDoc] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [editingDocId, setEditingDocId] = useState(null);

    const fetchApiDocs = useCallback(async () => {
        setIsLoading(true);
        try {
            // ✨ 변경: axios.get -> api.get, URL 경로 수정, 헤더 삭제
            const response = await api.get(`apidocs/${project_id}/`);
            setApiDocs(response.data);
            setError('');
        } catch (err) {
            console.error("API 문서 가져오기 실패:", err);
            setError("API 문서를 불러올 수 없습니다. 다시 시도해주세요.");
            // ✨ 삭제: 401 에러 처리는 인터셉터가 자동으로 처리합니다.
        } finally {
            setIsLoading(false);
        }
    }, [project_id]);

    useEffect(() => {
        fetchApiDocs();
    }, [fetchApiDocs]);

    const handleCreateSuccess = () => {
        setIsCreating(false);
        fetchApiDocs();
    };

    const handleEditSuccess = () => {
        setEditingDocId(null);
        setExpandedDocId(null);
        setDetailedDoc(null);
        fetchApiDocs();
    };

    const handleToggleDetail = async (docId) => {
        if (editingDocId) return;
        if (expandedDocId === docId) {
            setExpandedDocId(null);
            setDetailedDoc(null);
            return;
        }

        setExpandedDocId(docId);
        setIsDetailLoading(true);
        setDetailedDoc(null);

        try {
            // ✨ 변경: axios.get -> api.get, URL 경로 수정, 헤더 삭제
            const response = await api.get(`apidocs/detail/${docId}/`);
            setDetailedDoc(response.data);
        } catch (err) {
            console.error("API 상세 정보 가져오기 실패:", err);
            setError("상세 정보를 불러오는 데 실패했습니다.");
            // ✨ 삭제: 401 에러 처리는 인터셉터가 자동으로 처리합니다.
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (window.confirm('정말로 이 API 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                // ✨ 변경: axios.delete -> api.delete, URL 경로 수정, 헤더 삭제
                await api.delete(`apidocs/detail/${docId}/`);
                fetchApiDocs();
                setExpandedDocId(null);
                setDetailedDoc(null);
            } catch (err) {
                console.error("API 문서 삭제 실패:", err);
                setError("문서 삭제에 실패했습니다. 다시 시도해주세요.");
                // ✨ 삭제: 401 에러 처리는 인터셉터가 자동으로 처리합니다.
            }
        }
    };

    // ... JSX는 이전과 거의 동일 ...
    const getMethodClass = (method) => `method-${method.toLowerCase()}`;
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
                            
                            {/* ✨ 수정: 상세 정보 표시 로직에 수정/삭제 기능 추가 */}
                            {expandedDocId === doc.id && (
                                <div className="api-doc-detail">
                                    {isDetailLoading && <p>상세 정보를 불러오는 중...</p>}
                                    {detailedDoc && !isDetailLoading && (
                                        editingDocId === doc.id ? (
                                            // ✨ 수정 모드일 때 EditApiDocForm 렌더링
                                            <EditApiDocForm
                                                docId={doc.id}
                                                initialData={detailedDoc}
                                                onSuccess={handleEditSuccess}
                                                onCancel={() => setEditingDocId(null)}
                                            />
                                        ) : (
                                            // ✨ 일반 상세 정보 뷰
                                            <>
                                                {detailedDoc.description && (
                                                    <p><strong>설명:</strong> {detailedDoc.description}</p>
                                                )}

                                                {isObjectNotEmpty(detailedDoc.request_headers) && (
                                                    <><h4>Request Headers</h4><pre>{JSON.stringify(detailedDoc.request_headers, null, 2)}</pre></>
                                                )}

                                                {isObjectNotEmpty(detailedDoc.query_params) && (
                                                    <><h4>Query Params</h4><pre>{JSON.stringify(detailedDoc.query_params, null, 2)}</pre></>
                                                )}

                                                {isObjectNotEmpty(detailedDoc.request_format) && (
                                                    <><h4>Request Body</h4><pre>{JSON.stringify(detailedDoc.request_format, null, 2)}</pre></>
                                                )}

                                                {isObjectNotEmpty(detailedDoc.response_format) && (
                                                    <><h4>Response Body</h4><pre>{JSON.stringify(detailedDoc.response_format, null, 2)}</pre></>
                                                )}

                                                {/* ✨ 추가: 수정 및 삭제 버튼 컨테이너 */}
                                                <div className="api-doc-actions">
                                                    <button onClick={() => setEditingDocId(doc.id)} className="edit-button">수정</button>
                                                    <button onClick={() => handleDeleteDoc(doc.id)} className="delete-button">삭제</button>
                                                </div>
                                            </>
                                        )
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


