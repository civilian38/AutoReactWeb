import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // localStorage에서 토큰과 사용자 이름을 가져옵니다.
    const accessToken = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');

    if (accessToken && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행됩니다.

  return (
    <div className="main-container">
      {isLoggedIn ? (
        <h1 className="welcome-message">안녕하세요, {username}님!</h1>
      ) : (
        <div className="login-prompt">
          <h1>로그인하세요!</h1>
          <Link to="/login">
            <button className="login-button-main">로그인 페이지로 이동</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MainPage;