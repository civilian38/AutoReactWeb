// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './SignupPage.css'; // 스타일을 위한 CSS 파일 import

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nickname: '',
        email: '',
        bio: '',
        gemini_key_encrypted: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(
                'https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/authentication/register/',
                formData
            );
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) {
            console.error('회원가입 실패:', err.response?.data || err.message);
            if (err.response && err.response.data) {
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('\n');
                setError(errorMessages || '회원가입 중 오류가 발생했습니다.');
            } else {
                setError('회원가입 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
            }
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSignup} className="signup-form">
                <h2>회원가입</h2>
                <div className="input-group">
                    <label htmlFor="username">아이디</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="gemini_key_encrypted">Gemini API 키</label>
                    <input
                        type="text"
                        id="gemini_key_encrypted"
                        name="gemini_key_encrypted"
                        value={formData.gemini_key_encrypted}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="bio">소개 (선택)</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                    ></textarea>
                </div>
                {error && <p className="error-message" style={{ whiteSpace: 'pre-line' }}>{error}</p>}
                <button type="submit" className="signup-button">회원가입</button>
                <p className="login-link">
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </p>
            </form>
        </div>
    );
};

export default SignupPage;