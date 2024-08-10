export function getImageSize(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let adjustedHeight = img.height;

      if (img.height < 400) {
        adjustedHeight = 400;
      } else if (img.height > 700) {
        adjustedHeight = 700;
      }

      resolve({ width: img.width, height: adjustedHeight });
    };

    img.onerror = (error) => {
      reject(new Error('Failed to load image'));
      console.log(error);
    };

    img.src = url;
  });
}

export function calculateHeightForImageFeed(naturalWidth, width, naturalHeight) {
  // Calculate the height based on the width ratio
  let calculatedHeight = (width / naturalWidth) * naturalHeight;
  if (naturalHeight < 400) {
    calculatedHeight = 400;
  } else if (naturalHeight > 700) {
    calculatedHeight = 700;
  }
  // Ensure height is within the specified range

  return calculatedHeight;
}
