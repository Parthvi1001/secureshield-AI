import { vi } from 'vitest';

// Create a variable starting with "mock" so it is hoisted and allowed in vi.mock scope
const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';

describe('PrivateRoute Guard Route Component', () => {
  it('renders children nodes via Outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com' }
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Protected Telemetry Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Telemetry Page')).toBeInTheDocument();
  });

  it('redirects to login view when user is unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div>Secret Dashboard Area</div>} />
          </Route>
          <Route path="/login" element={<div>Access Login Node Form</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Dashboard Area')).not.toBeInTheDocument();
    expect(screen.getByText('Access Login Node Form')).toBeInTheDocument();
  });
});
