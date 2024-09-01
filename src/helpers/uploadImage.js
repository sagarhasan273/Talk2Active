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

export const uploadImageByFrontend = async (image) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('key', '66c72a274deb5826ae53ac0d86462173');

  const response = await fetch('https://api.imgbb.com/1/upload', {
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
