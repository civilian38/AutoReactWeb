// src/components/EditApiDocForm.jsx

import React, { useState, useCallback } from 'react';
// ✨ 변경: axios를 중앙 관리되는 api 인스턴스로 교체 (상대 경로 주의)
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import JsonEditor from './JsonEditor';
import './EditApiDocForm.css';

const EditApiDocForm = ({ docId, initialData, onSuccess, onCancel }) => {
    const navigate = useNavigate();

    const [apiData, setApiData] = useState(initialData);
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

        // ✨ 삭제: accessToken 관련 로직 제거

        try {
            // ✨ 변경: axios.put -> api.put, URL 경로 수정, 헤더 삭제
            await api.put(`apidocs/detail/${docId}/`, apiData);
            onSuccess();
        } catch (err) {
            console.error("API 문서 수정 실패:", err.response || err);
            setError('API 문서 수정에 실패했습니다. 입력 내용을 확인하고 다시 시도해주세요.');
            // ✨ 삭제: 401 에러 처리는 인터셉터가 자동으로 처리합니다.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="apidoc-form-container edit-mode">
            <form onSubmit={handleSubmit} className="apidoc-form">
                <h3 className="form-title">API 문서 수정 🛠️</h3>

                <div className="form-group">
                    <label htmlFor="url">엔드포인트 URL</label>
                    <input
                        type="text"
                        id="url"
                        name="url"
                        value={apiData.url}
                        onChange={handleInputChange}
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
                        rows="3"
                    />
                </div>

                {/* JsonEditor에 initialData prop으로 기존 데이터를 전달 */}
                <JsonEditor title="Request Headers" initialData={apiData.request_headers} onJsonChange={(json) => handleJsonChange('request_headers', json)} />
                <JsonEditor title="Query Parameters" initialData={apiData.query_params} onJsonChange={(json) => handleJsonChange('query_params', json)} />
                <JsonEditor title="Request Body Format" initialData={apiData.request_format} onJsonChange={(json) => handleJsonChange('request_format', json)} />
                <JsonEditor title="Response Body Format" initialData={apiData.response_format} onJsonChange={(json) => handleJsonChange('response_format', json)} />

                {error && <p className="error-message">{error}</p>}

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="cancel-button" disabled={isLoading}>
                        취소
                    </button>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditApiDocForm;


