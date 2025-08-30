import React from 'react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>회원가입 페이지</h1>
      <p>현재 준비 중입니다.</p>
      <Link to="/login">로그인 페이지로 돌아가기</Link>
    </div>
  );
};

export default SignupPage;