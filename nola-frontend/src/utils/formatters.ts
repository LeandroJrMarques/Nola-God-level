// src/utils/formatters.ts

/**
 * Converte a string da API (que pode ser null) para um número.
 */
const parseValue = (value: string | null | undefined): number => {
  const num = parseFloat(value || '0');
  return isNaN(num) ? 0 : num;
};

/**
 * Formata um valor de string para Moeda (ex: R$ 1.234,56)
 */
export const formatCurrency = (value: string | null | undefined) => {
  const num = parseValue(value);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

/**
 * Formata um valor de string para Percentagem (ex: 12,3%)
 */
export const formatPercent = (value: string | null | undefined) => {
  const num = parseValue(value);
  return `${(num * 100).toFixed(1)}%`.replace('.', ',');
};

/**
 * Formata um valor de string para Número (ex: 1.234)
 */
export const formatNumber = (value: string | null | undefined) => {
  const num = parseValue(value);
  return num.toLocaleString('pt-BR');
};

/**
 * Formata uma data ISO (T-Z) para data local (ex: 15/10/2025)
 */
export const formatDate = (value: string | null | undefined) => {
  if (!value) return '---';
  // Converte 2025-10-15T03:00:00.000Z para 15/10/2025
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const darkSelectStyles = {
  control: (styles: any, { isFocused }: any) => ({
    ...styles,
    backgroundColor: '#374151',
    borderColor: isFocused ? '#6366f1' : '#4b5563',
    boxShadow: isFocused ? '0 0 0 1px #6366f1' : 'none',
    '&:hover': {
      borderColor: isFocused ? '#6366f1' : '#6b7280',
    },
  }),
  menu: (styles: any) => ({
    ...styles,
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
  }),
  option: (styles: any, { isDisabled, isFocused, isSelected }: any) => ({
    ...styles,
    backgroundColor: isSelected
      ? '#6366f1'
      : isFocused
      ? '#374151'
      : undefined,
    color: '#f9fafb',
    cursor: isDisabled ? 'not-allowed' : 'default',
    '&:active': {
      backgroundColor: '#4f46e5',
    },
  }),
  input: (styles: any) => ({ ...styles, color: '#f9fafb' }),
  singleValue: (styles: any) => ({ ...styles, color: '#f9fafb' }),
  placeholder: (styles: any) => ({ ...styles, color: '#9ca3af' }),
};
