export const getUserStatus = () => {
  const status_options = [
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
    { label: 'Busy', value: 'busy' },
    { label: 'BRB', value: 'brb' },
    { label: 'AFK', value: 'afk' },
    { label: 'Zzz', value: 'sleeping' },
  ];

  return status_options;
};
