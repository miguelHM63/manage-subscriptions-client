import { render, waitFor } from '@test/test-wrapper';
import { SignupForm } from './signup-form';
import userEvent from '@testing-library/user-event';
import * as signupHook from '../hooks/use-signup';
import { vi } from 'vitest';
import type { UseMutationResult } from '@tanstack/react-query';
import type { HttpError } from '@/api/config';
import type { IAuthResponse } from '@/context/auth/auth-context.interfaces';
import type { SignupBody } from '../hooks/use-signup';

const mockedMutate = vi.fn();
const mockedUsedNavigate = vi.fn();
const mockedSetSession = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useNavigate: () => mockedUsedNavigate,
  };
});

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ setSession: mockedSetSession }),
}));

const fakeAuthResponse: IAuthResponse = {
  token: 'fake-token',
  user: { _id: '1' } as IAuthResponse['user'],
};

vi.mock('../hooks/use-signup', () => ({
  useSignup: (options: { onSuccess?: (data: IAuthResponse) => void } = {}) => {
    return {
      mutate: (data: Record<string, unknown>) => {
        mockedMutate(data);
        options.onSuccess?.(fakeAuthResponse);
      },
      isLoading: false,
      isPending: false,
      error: null,
    };
  },
}));

describe('SignupForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockedMutate.mockClear();
    mockedUsedNavigate.mockClear();
    mockedSetSession.mockClear();
  });

  // El formulario pide solo negocio, correo y contraseña (nombre/apellido se
  // completan después en Mi cuenta).
  it('should render the input fields', () => {
    const { getByLabelText } = render(<SignupForm />);
    expect(getByLabelText('signUp.fields.businessName')).toBeInTheDocument();
    expect(getByLabelText('signUp.fields.email')).toBeInTheDocument();
    expect(getByLabelText('signUp.fields.password')).toBeInTheDocument();
    expect(getByLabelText('signUp.fields.confirmPassword')).toBeInTheDocument();
  });

  it('should render the submit button', () => {
    const { getByText } = render(<SignupForm />);
    expect(getByText('signUp.summitText')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const { getByText } = render(<SignupForm />);
    const submitButton = getByText('signUp.summitText');
    await userEvent.setup().click(submitButton);

    await waitFor(() => {
      expect(getByText("'businessName' is required")).toBeInTheDocument();
      expect(getByText("'email' is required")).toBeInTheDocument();
      expect(getByText("'password' is required")).toBeInTheDocument();
    });
  });

  it('disables all fields and button when loading=true', () => {
    vi.spyOn(signupHook, 'useSignup').mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    } as unknown as UseMutationResult<IAuthResponse, HttpError, SignupBody, unknown>);

    const { getByLabelText, getByText } = render(<SignupForm />);
    expect(getByLabelText('signUp.fields.businessName')).toBeDisabled();
    expect(getByLabelText('signUp.fields.email')).toBeDisabled();
    expect(getByLabelText('signUp.fields.password')).toBeDisabled();
    expect(getByLabelText('signUp.fields.confirmPassword')).toBeDisabled();
    const button = getByText('signUp.summitText').closest('button');
    expect(button).toHaveClass('ant-btn-loading');
  });
});
