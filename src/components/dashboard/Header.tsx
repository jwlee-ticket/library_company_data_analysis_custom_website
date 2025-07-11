'use client';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* 로고 및 제목 섹션 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">LC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                공연 데이터 대시보드
              </h1>
            </div>
          </div>

          {/* 우측 액션 버튼 섹션 */}
          <div className="flex items-center space-x-6">

            {/* 관리자 프로필 */}
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-medium shadow-md">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">관리자</span>
                <span className="text-xs text-gray-500">admin@library.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 