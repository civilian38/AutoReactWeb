// src/pages/CreateProjectPage.jsx

import React, { useState } from 'react';
// ✨ 변경: axios를 중앙 관리되는 api 인스턴스로 교체
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './CreateProjectPage.css';

const CreateProjectPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✨ 삭제: useEffect를 사용한 토큰 확인 로직은 이제 인터셉터가 처리하므로 불필요합니다.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // ✨ 삭제: accessToken을 직접 가져오는 로직이 더 이상 필요 없습니다.

        try {
            // ✨ 변경: axios.post -> api.post
            const response = await api.post(
                'project/', 
                {
                    name: name,
                    description: description,
                }
                // ✨ 삭제: 헤더 설정은 인터셉터가 자동으로 처리합니다.
            );

            console.log('프로젝트 생성 성공:', response.data);
            alert('새로운 프로젝트가 생성되었습니다!');
            navigate('/projects');

        } catch (err) {
            console.error('프로젝트 생성 실패:', err);
            setError('프로젝트 생성에 실패했습니다. 입력 내용을 확인해주세요.');
            // ✨ 삭제: 401 에러 처리는 인터셉터가 자동으로 처리합니다.
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-project-container">
            <form onSubmit={handleSubmit} className="create-project-form">
                <h2>새로운 프로젝트 생성 🎨</h2>
                <div className="input-group">
                    <label htmlFor="name">프로젝트 이름</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 쇼핑몰 API"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="description">프로젝트 설명</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="프로젝트에 대한 간단한 설명을 입력하세요."
                        rows="4"
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? '생성 중...' : '프로젝트 생성하기'}
                </button>
            </form>
        </div>
    );
};

export default CreateProjectPage;
