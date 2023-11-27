// src/Loading.tsx
import React from "react";

/**
 * Props for the SpinnerLoading component.
 * @param message - Message to display.
 * @param isLoading - Whether the component is loading.
 * @param txn - Transaction hash.
 * @param customStyles - Custom styles for the component.
 */
interface SpinnerLoadingProps {
  message?: string;
  isLoading: boolean;
  txn?: string | null;
  customStyles?: {
    container?: React.CSSProperties;
    spinner?: React.CSSProperties;
    text?: React.CSSProperties;
    link?: React.CSSProperties;
  };
}

const SpinnerLoading: React.FC<SpinnerLoadingProps> = ({
  message = "Processing...",
  isLoading,
  txn,
  customStyles = {},
}) => {
  if (!isLoading) {
    return null;
  }

  const defaultContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "50px",
  };

  const defaultSpinnerStyle: React.CSSProperties = {
    borderRadius: "50%",
    borderTop: "5px solid rgba(0, 0, 0, 0.2)",
    borderLeft: "5px solid #3498db",
    borderBottom: "5px solid rgba(0, 0, 0, 0.2)",
    borderRight: "5px solid rgba(0, 0, 0, 0.2)",
    width: "5em",
    height: "5em",
    animation: "spin 1s ease-in-out infinite",
  };

  const defaultTextStyle: React.CSSProperties = {
    marginTop: "20px",
    fontSize: "18px",
  };

  const defaultLinkStyle: React.CSSProperties = {
    fontSize: "18px",
    color: "#3498db",
    textDecoration: "underline",
    cursor: "pointer",
  };

  const linkContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
  };

  const containerStyle = {
    ...defaultContainerStyle,
    ...customStyles.container,
  };
  const spinnerStyle = { ...defaultSpinnerStyle, ...customStyles.spinner };
  const textStyle = { ...defaultTextStyle, ...customStyles.text };
  const linkStyle = { ...defaultLinkStyle, ...customStyles.link };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
      <p style={textStyle}>{message}</p>
      {txn && (
        <p style={linkContainerStyle}>
          <span>View Transaction: </span>
          <span style={linkStyle}>
            {`${txn.substring(0, 6)}...${txn.substring(txn.length - 6)}`}
          </span>
        </p>
      )}
    </div>
  );
};

export default SpinnerLoading;
