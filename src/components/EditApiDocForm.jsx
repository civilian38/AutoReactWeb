// src/components/EditApiDocForm.jsx

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JsonEditor from './JsonEditor';
import './EditApiDocForm.css'; // 수정 폼 전용 CSS

// docId: 수정할 문서의 ID
// initialData: 폼을 채울 초기 데이터
// onSuccess: 수정 성공 시 호출될 콜백
// onCancel: 취소 시 호출될 콜백
const EditApiDocForm = ({ docId, initialData, onSuccess, onCancel }) => {
    const navigate = useNavigate();

    // 부모로부터 받은 initialData로 state 초기화
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
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            navigate('/login');
            return;
        }

        try {
            // PUT 요청으로 API 문서 수정
            await axios.put(
                `https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/apidocs/detail/${docId}/`,
                apiData,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );
            onSuccess(); // 성공 콜백 호출
        } catch (err) {
            console.error("API 문서 수정 실패:", err.response || err);
            setError('API 문서 수정에 실패했습니다. 입력 내용을 확인하고 다시 시도해주세요.');
            if (err.response?.status === 401) {
                navigate('/login');
            }
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
