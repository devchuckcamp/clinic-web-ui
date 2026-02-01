import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { Card, CardHeader, CardContent } from '@/components/common/Card';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('Card', () => {
  it('should render children', () => {
    renderWithTheme(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithTheme(<Card className="custom-class">Content</Card>);
    expect(container.querySelector('.MuiCard-root')).toHaveClass('custom-class');
  });

  it('should have MUI card class', () => {
    const { container } = renderWithTheme(<Card>Content</Card>);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    renderWithTheme(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithTheme(<CardHeader className="custom-class">Header</CardHeader>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    renderWithTheme(<CardContent>Content body</CardContent>);
    expect(screen.getByText('Content body')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithTheme(<CardContent className="custom-class">Content</CardContent>);
    expect(container.querySelector('.MuiCardContent-root')).toHaveClass('custom-class');
  });
});

describe('Card composition', () => {
  it('should compose Card with CardHeader and CardContent', () => {
    renderWithTheme(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
