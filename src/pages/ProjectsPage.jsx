// src/pages/ProjectsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProjectsPage.css';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            // 1. localStorage에서 accessToken 가져오기
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                // 토큰이 없으면 로그인 페이지로 이동
                navigate('/login');
                return;
            }

            try {
                // 2. 인증 헤더를 포함하여 API 요청
                const response = await axios.get('https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/project/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                // 3. API 응답 결과를 state에 저장
                setProjects(response.data.results);
            } catch (err) {
                console.error('프로젝트 목록을 불러오는데 실패했습니다:', err);
                setError('프로젝트 목록을 불러오는데 실패했습니다. 다시 로그인해주세요.');
                // 401 Unauthorized 오류 발생 시 로그인 페이지로 이동
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [navigate]);

    // 로딩 중일 때 표시할 UI
    if (loading) {
        return <div className="projects-container"><h1>로딩 중...</h1></div>;
    }

    // 에러 발생 시 표시할 UI
    if (error) {
        return <div className="projects-container"><h1 className="error-message">{error}</h1></div>;
    }

    // 4. 프로젝트 목록을 화면에 렌더링
    return (
        <div className="projects-container">
            <h1>내 프로젝트 목록 🚀</h1>
            <div className="project-list">
                {projects.length > 0 ? (
                    projects.map(project => (
                        // 나중에 상세 페이지 구현 시 이 부분을 <Link>로 감싸면 됩니다.
                        <div key={project.id} className="project-card" onClick={() => alert(`프로젝트 ID: ${project.id}`)}>
                            <h2>{project.name}</h2>
                            <p>{project.description}</p>
                            <span className="project-date">생성일: {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                    ))
                ) : (
                    <p>아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!</p>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;
