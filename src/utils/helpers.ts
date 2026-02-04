import dayjs from 'dayjs';
import type { ExpiryStatus } from '../types/Expiry';

export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const today = dayjs().startOf('day');
  const expiration = dayjs(expiryDate).startOf('day');
  const daysRemaining = expiration.diff(today, 'day');

  if (daysRemaining < 0) {
    return 'expired';
  } else if (daysRemaining <= 7) {
    return 'expiringSoon';
  }
  return 'valid';
};

export const getDaysRemaining = (expiryDate: string): number => {
  const today = dayjs().startOf('day');
  const expiration = dayjs(expiryDate).startOf('day');
  return expiration.diff(today, 'day');
};


export const formatDate = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY');
};


export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};