import React, { useRef, useEffect, useState } from 'react';

const Camera = (props) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  useEffect(() => {
    if (props.show) {
      // Start the stream if show is true
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = function (e) {
            videoRef.current.play();
          };
          setStream(stream); // store the MediaStream object in state
        })
        .catch(function (err) {
          console.log("Lỗi: " + err);
        });
    } else {
      // Stop the stream if show is false
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setStream(null); // reset the state variable to null
      }
    }

    return () => {
      // cleanup function to stop the stream when the component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [props.show]);

  return (
    <video ref={videoRef} width="320" height="240"></video>
  );
};

export default Camera;