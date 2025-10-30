// nola-frontend/src/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatNumber } from './formatters';

describe('Funções de Formatação', () => {

  // Testes para formatCurrency
  describe('formatCurrency', () => {
    it('deve formatar números positivos corretamente', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });

    it('deve formatar zero corretamente', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('deve formatar números negativos', () => {
      expect(formatCurrency(-500)).toBe('-R$ 500,00');
    });

    it('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });
  });

  // Testes para formatPercentage
  describe('formatPercentage', () => {
    it('deve formatar percentagens corretamente', () => {
      // O seu formatador multiplica por 100
      expect(formatPercentage(0.1234)).toBe('12,3%');
    });

    it('deve formatar com uma casa decimal', () => {
      expect(formatPercentage(0.8888)).toBe('88,9%');
    });

    it('deve formatar zero', () => {
      expect(formatPercentage(0)).toBe('0,0%');
    });

    it('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatPercentage(null)).toBe('0,0%');
      expect(formatPercentage(undefined)).toBe('0,0%');
    });
  });

  // Testes para formatNumber
  describe('formatNumber', () => {
    it('deve formatar números inteiros', () => {
      expect(formatNumber(5000)).toBe('5.000');
    });

    it('deve formatar números decimais', () => {
      expect(formatNumber(123.45)).toBe('123,45');
    });
    
    it('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });
  });
});