import {
  formatDate,
  formatDateTime,
  formatDateForInput,
  getTodayISO,
  formatFileSize,
  debounce,
  truncate,
} from '@/utils';

describe('formatDate', () => {
  it('should format date string to readable format', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toMatch(/Jan\s+15,\s+2024/);
  });
});

describe('formatDateTime', () => {
  it('should format date string with time', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z');
    expect(result).toMatch(/Jan\s+15,\s+2024/);
  });
});

describe('formatDateForInput', () => {
  it('should format date for input field', () => {
    const result = formatDateForInput('2024-01-15T10:30:00Z');
    expect(result).toBe('2024-01-15');
  });
});

describe('getTodayISO', () => {
  it('should return today date in ISO format', () => {
    const result = getTodayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toISOString().split('T')[0]);
  });
});

describe('formatFileSize', () => {
  it('should format 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should format with decimal places', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce function calls', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('arg1', 'arg2');

    jest.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should use the latest arguments', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('first');
    debouncedFunc('second');
    debouncedFunc('third');

    jest.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith('third');
  });
});

describe('truncate', () => {
  it('should not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});
