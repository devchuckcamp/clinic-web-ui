import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotesProvider } from '@/contexts/NotesContext';

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider theme={lightTheme}>
        <AuthProvider>
          <NotesProvider>{children}</NotesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
