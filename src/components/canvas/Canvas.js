import React, { useRef } from 'react';

const Canvas = ({ image }) => {
  const canvasRef = useRef(null);

  if (image) {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(image, 0, 0);
  }

  return (
    <canvas id='hehe' ref={canvasRef} width="320" height="240"></canvas>
  );
};

export default Canvas;
