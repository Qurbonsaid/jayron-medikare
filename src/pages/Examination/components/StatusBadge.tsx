export const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Фаол', class: 'bg-blue-500/10 text-blue-600' },
      completed: {
        text: 'Тугалланган',
        class: 'bg-green-500/10 text-green-600',
      },
      inactive: { text: 'Фаол эмас', class: 'bg-gray-500/10 text-gray-600' },
      deleted: { text: 'Ўчирилган', class: 'bg-red-500/10 text-red-600' },
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