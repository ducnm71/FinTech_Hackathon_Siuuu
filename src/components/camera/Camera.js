import React, { useRef, useEffect } from 'react';

const Camera = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = function(e) {
          videoRef.current.play();
        };
      })
      .catch(function(err) {
        console.log("Lỗi: " + err);
      });
  }, []);

  return (
    <video ref={videoRef} width="320" height="240"></video>
  );
};

export default Camera;