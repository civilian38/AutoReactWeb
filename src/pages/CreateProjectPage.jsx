// src/pages/CreateProjectPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateProjectPage.css';

const CreateProjectPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 페이지 로드 시 토큰 확인
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/project/',
        {
          name: name,
          description: description,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      console.log('프로젝트 생성 성공:', response.data);
      alert('새로운 프로젝트가 생성되었습니다!');
      // 성공 시 프로젝트 목록 페이지로 이동
      navigate('/projects');

    } catch (err) {
      console.error('프로젝트 생성 실패:', err);
      setError('프로젝트 생성에 실패했습니다. 입력 내용을 확인해주세요.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
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
