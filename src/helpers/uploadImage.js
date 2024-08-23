import axios from 'axios';

export const uploadImageToBackend = async (image) => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await axios.post('http://localhost:5000/image/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
