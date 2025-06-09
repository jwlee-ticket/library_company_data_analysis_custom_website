'use client';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* 회사 정보 */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">LC</span>
            </div>
            <span className="text-sm text-gray-600">
              © 2025 라이브러리컴퍼니
            </span>
          </div>

          {/* 담당자 정보 */}
          <div className="text-sm text-gray-600">
            담당자: 플랫폼팀 이진욱
          </div>
        </div>
      </div>
    </footer>
  );
} 