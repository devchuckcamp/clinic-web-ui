import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { Button } from '@/components/common/Button';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('Button', () => {
  it('should render children', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render as contained button for primary variant', () => {
    renderWithTheme(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('should render as outlined button for secondary variant', () => {
    renderWithTheme(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-outlined');
  });

  it('should render as contained button for danger variant', () => {
    renderWithTheme(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('should render as text button for ghost variant', () => {
    renderWithTheme(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-text');
  });

  it('should render small size', () => {
    renderWithTheme(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-sizeSmall');
  });

  it('should render medium size by default', () => {
    renderWithTheme(<Button>Medium</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-sizeMedium');
  });

  it('should render large size', () => {
    renderWithTheme(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-sizeLarge');
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when isLoading prop is true', () => {
    renderWithTheme(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading spinner when isLoading is true', () => {
    renderWithTheme(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click events when disabled', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const handleClick = jest.fn();
    renderWithTheme(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    renderWithTheme(<Button type="submit" data-testid="test-button">Submit</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
