export const getUserStatus = (status: string) => {
  const status_options = [
    { label: 'Active', value: 'active', active: false },
    { label: 'Offline', value: 'offline', active: false },
    { label: 'Busy', value: 'busy', active: false },
    { label: 'BRB', value: 'brb', active: false },
    { label: 'AFK', value: 'afk', active: false },
    { label: 'Zzz', value: 'sleeping', active: false },
  ];

  return status_options.map((item) => {
    if (item.value === status) {
      return { ...item, active: true };
    }
    return item;
  });
};
