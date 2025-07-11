import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 📊 Play API 데이터 변환 유틸리티 함수들

// 숫자 포맷팅 - 안전한 변환
export const formatCurrency = (amount: string | number | undefined): string => {
  if (!amount) return '0';
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(numAmount)) return '0';
  return new Intl.NumberFormat('ko-KR').format(numAmount);
};

// 퍼센트 계산 - 문자열 입력 처리
export const calculatePercentage = (actual: string | undefined, target: string | undefined): string => {
  if (!actual || !target) return '0.0';
  const actualNum = parseFloat(actual);
  const targetNum = parseFloat(target);
  if (isNaN(actualNum) || isNaN(targetNum) || targetNum === 0) return '0.0';
  return ((actualNum / targetNum) * 100).toFixed(1);
};

// 점유율 포맷팅 - 문자열에서 숫자로 변환
export const formatShareRate = (share: string | undefined): string => {
  if (!share) return '0.0';
  const shareNum = parseFloat(share);
  if (isNaN(shareNum)) return '0.0';
  return shareNum.toFixed(1);
};

// 날짜 포맷팅
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR');
  } catch {
    return '-';
  }
};

// 달성률 계산 및 상태 반환
export const getAchievementStatus = (actual: string | undefined, target: string | undefined) => {
  const percentage = parseFloat(calculatePercentage(actual, target));
  return {
    rate: percentage,
    status: percentage >= 100 ? 'success' : percentage >= 70 ? 'warning' : 'danger',
    color: percentage >= 100 ? 'text-green-600' : percentage >= 70 ? 'text-yellow-600' : 'text-red-600'
  };
};