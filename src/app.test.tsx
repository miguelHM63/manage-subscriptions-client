import { render } from '@testing-library/react';
import App from './app';

describe('App', () => {
  it('renders the App component without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
