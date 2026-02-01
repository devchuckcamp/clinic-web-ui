import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { Alert } from '@/components/common/Alert';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('Alert', () => {
  it('should render children', () => {
    renderWithTheme(<Alert type="info">Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    renderWithTheme(
      <Alert type="info" title="Alert Title">
        Test message
      </Alert>
    );
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('should render success alert', () => {
    renderWithTheme(<Alert type="success">Success message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardSuccess');
  });

  it('should render error alert', () => {
    renderWithTheme(<Alert type="error">Error message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
  });

  it('should render warning alert', () => {
    renderWithTheme(<Alert type="warning">Warning message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardWarning');
  });

  it('should render info alert', () => {
    renderWithTheme(<Alert type="info">Info message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardInfo');
  });

  it('should show close button when onClose is provided', () => {
    renderWithTheme(
      <Alert type="info" onClose={() => {}}>
        Dismissible
      </Alert>
    );
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('should not show close button when onClose is not provided', () => {
    renderWithTheme(<Alert type="info">Not dismissible</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    renderWithTheme(
      <Alert type="info" onClose={handleClose}>
        Dismissible
      </Alert>
    );

    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    renderWithTheme(
      <Alert type="info" className="custom-class">
        Custom
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});
