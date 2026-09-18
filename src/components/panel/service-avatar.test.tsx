import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ServiceAvatar } from './service-avatar';

describe('ServiceAvatar', () => {
  it('shows the initial when there is no logo', () => {
    render(<ServiceAvatar name="netflix" />);
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('falls back to the initial when the logo fails to load', () => {
    const { container } = render(
      <ServiceAvatar name="Hbo" iconUrl="https://example.com/broken.png" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();

    fireEvent.error(img!);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('H')).toBeInTheDocument();
  });
});
