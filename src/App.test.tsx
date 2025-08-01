import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form when not authenticated', () => {
  render(<App />);
  const loginHeading = screen.getByText(/sign in to your account/i);
  expect(loginHeading).toBeInTheDocument();
});
