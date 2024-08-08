export const changeTopBarActionRouteHistory = (type, history) => {
  if (type === 'home') {
    history('/', {
      state: null,
    });
  } else if (type === 'posts') {
    history('/posts', {
      state: null,
    });
  } else if (type === 'people') {
    history('/people', {
      state: null,
    });
  } else if (type === 'messages') {
    history('/messages', {
      state: null,
    });
  }
};
