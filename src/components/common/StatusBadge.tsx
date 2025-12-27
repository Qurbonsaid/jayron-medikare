import i18n from '@/i18n';

export const getStatusBadge = (status: string) => {
    const t = (key: string) => i18n.t(key, { ns: 'common' });

    const statusConfig = {
      active: { text: t('statuses.active'), class: 'bg-blue-500/10 text-blue-600' },
      completed: {
        text: t('statuses.completed'),
        class: 'bg-green-500/10 text-green-600',
      },
      pending:{text: t('statuses.pending'), class:'bg-yellow-500/10 text-yellow-600'},
      inactive: { text: t('statuses.inactive'), class: 'bg-gray-500/10 text-gray-600' },
      deleted: { text: t('statuses.deleted'), class: 'bg-red-500/10 text-red-600' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };