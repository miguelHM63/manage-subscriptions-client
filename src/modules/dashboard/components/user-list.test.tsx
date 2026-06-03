import { render, waitFor } from '@test/test-wrapper';
import { UserList } from './user-list';

vi.mock('../hooks/use-get-user-list', () => ({
  useGetUserList: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock('@/hooks/use-ability', () => ({
  useAbility: () => ({
    can: () => false,
  }),
}));

const componentRender = () => render(<UserList />);

describe('User List', () => {
  it('should render the title', async () => {
    const { getByText } = componentRender();
    const title = getByText('userList');
    await waitFor(() => {
      expect(title).toBeInTheDocument();
    });
  });
});
