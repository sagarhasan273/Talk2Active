import React, { useRef, useState } from 'react';

import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';

import { Box, Stack } from '@mui/material';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from '../common/canvasPreview';
import { useDebounceEffect } from '../common/useDebounceEffect';

// This is to demonstrate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageEditorCroper({ imgSrc, setImgSrc }) {
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef('');
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(undefined);

  // function onSelectFile(e) {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setCrop(null); // Makes crop preview update between images.
  //     const reader = new FileReader();
  //     reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
  //     reader.readAsDataURL(e.target.files[0]);
  //   }
  // }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);

    if (hiddenAnchorRef.current) {
      // hiddenAnchorRef.current.href = blobUrlRef.current;
      // hiddenAnchorRef.current.click();
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(blob);
    }

    setScale(1);
    setAspect(undefined);
    setRotate(0);
  }

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  const handleToggleAspectClick = () => {
    if (aspect) {
      setAspect(undefined);
    } else {
      setAspect(16 / 9);

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  };

  const handleClose = () => {
    setImgSrc('');
  };

  return (
    <Box>
      <Box className="Crop-Controls">
        {/* <input type="file" accept="image/*" onChange={onSelectFile} /> */}
        <Box>
          <button type="button" onClick={handleClose}>
            Close
          </button>
        </Box>
        <Box>
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="number"
            step="0.1"
            value={scale}
            disabled={!imgSrc}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </Box>
        <Box>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="number"
            value={rotate}
            disabled={!imgSrc}
            onChange={(e) => setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))}
          />
        </Box>
        <Box>
          <button type="button" onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
        </Box>
      </Box>
      <Stack direction="row" gap={5} sx={{}}>
        {!!imgSrc && (
          <Box sx={{ width: '45%' }}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minHeight={100}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </Box>
        )}
        {!!completedCrop && (
          <Stack>
            <Box>
              <canvas
                ref={previewCanvasRef}
                style={{
                  border: '1px solid black',
                  objectFit: 'contain',
                  width: completedCrop.width,
                  height: completedCrop.height,
                }}
              />
            </Box>
            <Box>
              <button type="button" onClick={onDownloadCropClick}>
                Download Crop
              </button>
              <Box style={{ fontSize: 12, color: '#666' }}>
                If you get a security error when downloading try opening the Preview in a new tab (icon near top right).
              </Box>
              <a
                href="#hidden"
                ref={hiddenAnchorRef}
                download
                style={{
                  position: 'absolute',
                  top: '-200vh',
                }}
              >
                Hidden download
              </a>
            </Box>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
