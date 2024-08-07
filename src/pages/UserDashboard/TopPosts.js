/* eslint-disable consistent-return */
import { Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import PostCard from '../../components/PostCard';

function TopPosts({ posts = [] }) {
  const containerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleMouseDown = (e) => {
      setIsMouseDown(true);
      setStartX(e.pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    };

    const handleMouseLeave = (e) => {
      e.preventDefault();
      setIsMouseDown(false);
      setStartX(0);
      setScrollLeft(0);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      setIsMouseDown(false);
      setStartX(0);
      setScrollLeft(0);
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = x - startX;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMouseDown, startX, scrollLeft]);

  return (
    <Stack
      className="custom-scroll-top-post no-select"
      sx={{
        m: 'auto',
        width: '90%',
        height: '380px',
        overflowX: 'scroll',
      }}
      direction="row"
      gap={3}
      ref={containerRef}
    >
      {posts.map((item, index) => (
        <PostCard key={index} postItem={item} />
      ))}
    </Stack>
  );
}

export default TopPosts;
