import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ManageCategory from './ManageCategory';
import { toast } from 'react-toastify';

jest.mock('../components/AdminLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => null,
}));

jest.mock('react-csv', () => ({
  CSVLink: ({ children }) => <div>{children}</div>,
}));

describe('ManageCategory delete action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: async () => [
          { id: 1, category_name: 'Test Category', creation_date: '2024-01-01T00:00:00Z' },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('No JSON body');
        },
      });
  });

  it('removes the category when the delete endpoint returns an empty successful response', async () => {
    window.confirm = jest.fn(() => true);

    render(
      <MemoryRouter>
        <ManageCategory />
      </MemoryRouter>
    );

    expect(await screen.findByText('Test Category')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Category deleted successfully'));
    await waitFor(() => expect(screen.queryByText('Test Category')).not.toBeInTheDocument());
  });
});
