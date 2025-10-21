import { showSuccess, showError, showWarning, showInfo } from './alertUtils';

// Mock alertify methods
const mockAlertify = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  message: jest.fn(),
  set: jest.fn(),
  confirm: jest.fn(),
  alert: jest.fn()
};

// Mock the alertifyjs module
jest.mock('alertifyjs', () => mockAlertify);

describe('alertUtils', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('showSuccess should call alertify.success', () => {
    const message = 'Success message';
    showSuccess(message);
    expect(mockAlertify.success).toHaveBeenCalledWith(message);
  });

  test('showError should call alertify.error', () => {
    const message = 'Error message';
    showError(message);
    expect(mockAlertify.error).toHaveBeenCalledWith(message);
  });

  test('showWarning should call alertify.warning', () => {
    const message = 'Warning message';
    showWarning(message);
    expect(mockAlertify.warning).toHaveBeenCalledWith(message);
  });

  test('showInfo should call alertify.message', () => {
    const message = 'Info message';
    showInfo(message);
    expect(mockAlertify.message).toHaveBeenCalledWith(message);
  });
});