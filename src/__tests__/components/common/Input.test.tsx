import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { Input } from '@/components/common/Input';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('Input', () => {
  it('should render with label', () => {
    renderWithTheme(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render without label', () => {
    renderWithTheme(<Input name="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('should show error message when error prop is provided', () => {
    renderWithTheme(<Input label="Email" name="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should show helper text when provided', () => {
    renderWithTheme(<Input label="Email" name="email" helperText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Input label="Email" name="email" />);

    const input = screen.getByLabelText('Email');
    await user.type(input, 'test@example.com');

    await waitFor(() => {
      expect(input).toHaveValue('test@example.com');
    });
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithTheme(<Input label="Email" name="email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('should pass through input attributes', () => {
    renderWithTheme(<Input label="Email" name="email" type="email" required />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
  });
});
