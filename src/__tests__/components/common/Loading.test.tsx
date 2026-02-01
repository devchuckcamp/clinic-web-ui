import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { Loading } from '@/components/common/Loading';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('Loading', () => {
  it('should render spinner', () => {
    renderWithTheme(<Loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render text when provided', () => {
    renderWithTheme(<Loading text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not render text when not provided', () => {
    const { container } = renderWithTheme(<Loading />);
    expect(container.textContent).toBe('');
  });

  it('should render with different sizes', () => {
    const { rerender } = renderWithTheme(<Loading size="sm" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <Loading size="md" />
      </ThemeProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <Loading size="lg" />
      </ThemeProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithTheme(<Loading className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
