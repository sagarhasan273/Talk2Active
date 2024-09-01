import axios from 'axios';
import * as API_URL from '../network/Api';

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

export const uploadImageByFrontend = async (image) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('key', API_URL.UPLOAD_IMAGE_HOST_KEY);

  const response = await fetch(API_URL.UPLOAD_IMAGE_HOST_URL, {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        return data;
      }
      return { status: false, message: 'Error uploading image!' };
    })
    .catch((error) => console.error('Error:', error));

  return response;
};
