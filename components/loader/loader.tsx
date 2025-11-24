import React from "react";

const Loader = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "white",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: 60,
        height: 60,
        border: "6px solid #f3f3f3",
        borderTop: "6px solid #e41c34",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loader;
