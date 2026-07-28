import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock ChartJS using pure React.createElement to prevent JSX parsing issues in JS extension
vi.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'line-chart' }),
  Bar: () => React.createElement('div', { 'data-testid': 'bar-chart' }),
  Doughnut: () => React.createElement('div', { 'data-testid': 'doughnut-chart' }),
}));
