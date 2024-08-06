import { toast } from 'react-toastify';

export const successMsg = (msg, type, props) => {
  if (type === 'success') {
    return toast.success(msg, {
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: 'custom-toast',

      ...(props || {}),
    });
  }
  if (type === 'dark') {
    return toast.dark(msg, {
      autoClose: 1500,
      className: 'custom-toast',

      ...(props || {}),
    });
  }
  if (type === 'info') {
    return toast.info(msg, {
      autoClose: 1500,
      className: 'custom-toast',

      ...(props || {}),
    });
  }
  if (type === 'error') {
    return toast.error(msg, {
      autoClose: 1500,
      className: 'custom-toast',

      ...(props || {}),
    });
  }
  return toast.warn(msg, {
    autoClose: 2000,
    className: 'custom-toast',

    ...(props || {}),
  });
};
