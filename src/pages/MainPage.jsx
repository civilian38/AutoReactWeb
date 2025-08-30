// src/pages/MainPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const storedUsername = localStorage.getItem('username');

        if (accessToken && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogout = () => {
        // localStorage에서 모든 인증 정보를 삭제합니다.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        
        // 상태를 로그아웃된 상태로 업데이트합니다.
        setIsLoggedIn(false);
        setUsername('');
        
        // alert('로그아웃 되었습니다.'); // 이 부분을 삭제했습니다.
        
        // 로그인 페이지로 이동합니다.
        navigate('/login');
    };

    return (
        <div className="main-container">
            {isLoggedIn ? (
                <div className="welcome-container">
                    <h1 className="welcome-message">안녕하세요, {username}님!</h1>
                    <button onClick={handleLogout} className="logout-button">로그아웃</button>
                </div>
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