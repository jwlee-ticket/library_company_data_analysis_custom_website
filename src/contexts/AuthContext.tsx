'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  userId: number;
  name: string;
  email: string;
  role: number;
  isFileUploader: boolean;
  isLiveManager: boolean;
  liveNameList: string[];
  loginTime: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userId: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('userInfo');
      
      if (isLoggedIn && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('인증 상태 확인: 로그인됨', parsedUser.name);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('인증 상태 확인: 로그인되지 않음');
      }
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userId: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // API 서버 URL 설정
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'http://35.208.29.100:3001' 
        : 'http://35.208.29.100:3001'; // 개발환경에서도 동일한 서버 사용
        
      console.log('로그인 API 호출:', { userId, baseUrl });
      
      const response = await fetch(`${baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userId, password }), // API는 email 필드를 사용하므로 userId를 email 필드에 전달
      });

      const data = await response.json();
      console.log('로그인 API 응답:', data);

      if (data.code === 200) {
        // 로그인 성공
        const userData: User = {
          userId: data.userId,
          name: data.name,
          email: userId, // 실제로는 아이디이지만 기존 구조 유지
          role: data.role,
          isFileUploader: data.isFileUploader,
          isLiveManager: data.isLiveManager,
          liveNameList: data.liveNameList || [],
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('로그인 성공:', userData.name);
        return { success: true };
      } else {
        console.log('로그인 실패:', data.message);
        return { success: false, message: data.message || '로그인에 실패했습니다.' };
      }
    } catch (error) {
      console.error('로그인 API 호출 중 오류:', error);
      return { 
        success: false, 
        message: '서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.' 
      };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userInfo');
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
} 