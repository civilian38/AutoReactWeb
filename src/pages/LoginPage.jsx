import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // 이전 에러 메시지 초기화

    try {
      // API 주소를 http -> https 로 변경
      const response = await axios.post('https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/authentication/token/', {
        username,
        password,
      });

      // 토큰 저장 (localStorage는 간단한 예시이며, 실제 프로덕션에서는 httpOnly 쿠키나 다른 보안 방법을 고려해야 합니다.)
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      console.log('로그인 성공:', response.data);
      alert('로그인에 성공했습니다!');
      // 로그인 성공 후 다른 페이지로 이동 (예: 메인 페이지)
      // navigate('/dashboard'); 
    } catch (err) {
      console.error('로그인 실패:', err);
      // 서버에서 오는 에러 메시지가 있다면 그걸 보여주는게 더 좋습니다.
      // 예: err.response.data.detail
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>로그인</h2>
        <div className="input-group">
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">로그인</button>
        <p className="signup-link">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;