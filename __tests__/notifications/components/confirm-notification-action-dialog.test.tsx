import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RotateCcw } from 'lucide-react';

import { ConfirmNotificationActionDialog } from '@/app/components/confirm-notification-action-dialog';

const renderDialog = (props: Partial<Parameters<typeof ConfirmNotificationActionDialog>[0]> = {}) =>
  render(
    <ConfirmNotificationActionDialog
      notificationId="notif-123"
      onClose={vi.fn()}
      onConfirm={vi.fn().mockResolvedValue(undefined)}
      icon={RotateCcw}
      title="Requeue Notification"
      description="Puts it back in the queue."
      confirmLabel="Requeue"
      pendingLabel="Requeuing…"
      confirmTestId="confirm-requeue-notification"
      {...props}
    />,
  );

describe('ConfirmNotificationActionDialog', () => {
  it('shows the title and description it is given', () => {
    renderDialog();

    expect(screen.getByText('Requeue Notification')).toBeInTheDocument();
    expect(screen.getByText('Puts it back in the queue.')).toBeInTheDocument();
  });

  it('stays closed without a notification id', () => {
    renderDialog({ notificationId: null });

    expect(screen.queryByText('Requeue Notification')).not.toBeInTheDocument();
  });

  it('does not call onConfirm before user confirmation', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderDialog({ onConfirm });

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with the id after clicking confirm', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderDialog({ onConfirm });

    await user.click(screen.getByTestId('confirm-requeue-notification'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('notif-123');
  });

  it('closes from the Close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
