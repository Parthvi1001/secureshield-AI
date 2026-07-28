import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../layouts/Sidebar';

describe('Sidebar Layout Component', () => {
  it('renders all navigation items correctly', () => {
    const mockSetIsOpen = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />
      </MemoryRouter>
    );

    // Verify system brand logo/header is present
    expect(screen.getByText(/SecureShield/i)).toBeInTheDocument();

    // Verify key security app sections are visible as links
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Scanner/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/History/i)).toBeInTheDocument();
    expect(screen.getByText(/Cyber News/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });
});
