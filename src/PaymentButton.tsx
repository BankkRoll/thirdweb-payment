// src/PaymentButton.tsx
import React, { useState } from "react";
import { useSDK, ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { ethers } from "ethers";

/**
 * Props for the PaymentButton component.
 * @param recipient - Ethereum address of the recipient.
 * @param amount - Amount in Ether to send.
 * @param className - Custom className for the button.
 * @param buttonText - Custom text for the button.
 * @param icon - Icon element to display next to the button text.
 * @param customStyles - Custom CSS styles for different parts of the component.
 * @param onPaymentSuccess - Callback function for successful payment.
 * @param onPaymentError - Callback function for payment error.
 */
interface PaymentButtonProps {
  recipient: string;
  amount: string;
  className?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  txn?: string | null;
  spinner?: React.CSSProperties;
  customStyles?: {
    button?: React.CSSProperties;
    modalOverlay?: React.CSSProperties;
    modalContent?: React.CSSProperties;
    modalButton?: React.CSSProperties;
    modalButtonConfirm?: React.CSSProperties;
    modalButtonCancel?: React.CSSProperties;
    modalActions?: React.CSSProperties;
    modalHeader?: React.CSSProperties;
    modalParagraph?: React.CSSProperties;
    loadingSpinnerContainer?: React.CSSProperties;
    loadingSpinner?: React.CSSProperties;
    transactionDetailsContainer?: React.CSSProperties;
    detailRow?: React.CSSProperties;
    detailLabel?: React.CSSProperties;
    detailValue?: React.CSSProperties;
    detailSymbol?: React.CSSProperties;
    addDetailAmount?: React.CSSProperties;
    subtractDetailAmount?: React.CSSProperties;
  };
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  recipient,
  amount,
  onPaymentSuccess,
  onPaymentError,
  className,
  buttonText = "Buy Now",
  icon,
  customStyles = {},
}) => {
  const sdk = useSDK();
  const address = useAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [txn, setTxn] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );

  const getExplorerUrl = (chainId: number, txHash: string) => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `https://etherscan.io/tx/${txHash}`;
      case 3: // Ropsten Testnet
        return `https://ropsten.etherscan.io/tx/${txHash}`;
      case 4: // Rinkeby Testnet
        return `https://rinkeby.etherscan.io/tx/${txHash}`;
      case 5: // Goerli Testnet
        return `https://goerli.etherscan.io/tx/${txHash}`;
      case 42: // Kovan Testnet
        return `https://kovan.etherscan.io/tx/${txHash}`;
      case 80001: // Mumbai Testnet
        return `https://mumbai.polygonscan.com/tx/${txHash}`;
      default: // Unknown network
        return "";
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setTransactionStatus("Loading");
    try {
      if (!sdk) throw new Error("Please connect your wallet first.");

      const valueInWei = ethers.utils.parseEther(amount);
      const tx = { to: recipient, value: valueInWei };
      const signer = sdk.getSigner();

      if (!signer) throw new Error("Signer not available.");
      if (!signer.provider) throw new Error("Provider not available.");

      const txResponse = await signer.sendTransaction(tx);
      setTxn(txResponse.hash);
      const receipt = await txResponse.wait();

      if (receipt.status === 1) {
        setTransactionStatus("Success");
        const network = await signer.provider.getNetwork();
        const url = getExplorerUrl(network.chainId, txResponse.hash);
        setExplorerUrl(url);
        onPaymentSuccess && onPaymentSuccess();
        setPaymentConfirmed(true);
      } else {
        setTransactionStatus("Failed");
        throw new Error("Payment failed.");
      }
    } catch (error) {
      setTransactionStatus("Failed");
      onPaymentError && onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => setShowConfirmModal(true);
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setTransactionStatus(null);
    setPaymentConfirmed(false);
  };

  const buttonStyles: React.CSSProperties = {
    backgroundColor: "#007bff",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    fontWeight: "600",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)",
    fontSize: "14px",
    letterSpacing: "normal",
    margin: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...customStyles.button,
  };

  const modalOverlayStyles: React.CSSProperties = {
    ...{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(10px)",
    },
    ...customStyles.modalOverlay,
  };

  const modalContentStyles: React.CSSProperties = {
    ...{
      backgroundColor: "hsl(230deg 11.63% 8.43%)",
      color: "hsl(256, 6.0%, 93.2%)",
      padding: "24px",
      borderRadius: "20px",
      boxShadow:
        "0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      zIndex: 10000,
      width: "calc(100vw - 40px)",
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      boxSizing: "border-box",
      border: "1px solid hsl(230deg 11.63% 17%)",
      overflow: "hidden",
      fontFamily: "inherit",
      height: "570px",
      maxWidth: "730px",
      pointerEvents: "auto",
    },
    ...customStyles.modalContent,
  };

  const modalButtonStyles: React.CSSProperties = {
    ...{
      padding: "12px 24px",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
      margin: "0 10px",
      flex: "1",
      transition: "opacity 0.2s ease-in-out",
      border: "1px solid transparent",
    },
    ...customStyles.modalButton,
  };

  const modalButtonConfirmStyles: React.CSSProperties = {
    ...{
      ...modalButtonStyles,
      backgroundColor: "transparent",
      color: "#4caf50",
      borderColor: "#4caf50",
    },
    ...customStyles.modalButtonConfirm,
  };

  const modalButtonCancelStyles: React.CSSProperties = {
    ...{
      ...modalButtonStyles,
      backgroundColor: "transparent",
      color: "#f44336",
      borderColor: "#f44336",
    },
    ...customStyles.modalButtonCancel,
  };

  const modalActionsStyles: React.CSSProperties = {
    ...{
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      padding: "1rem",
      boxSizing: "border-box",
      position: "absolute",
      bottom: "0",
      left: "0",
    },
    ...customStyles.modalActions,
  };

  const modalHeaderStyles: React.CSSProperties = {
    ...{
      color: "#ffffff",
      marginBottom: "6px",
      textAlign: "center",
      fontSize: "20px",
      paddingBottom: "10px",
    },
    ...customStyles.modalHeader,
  };

  const modalParagraphStyles: React.CSSProperties = {
    ...{
      color: "#d1d1d1",
      textAlign: "center",
      fontSize: "14px",
      textOverflow: "ellipsis",
    },
    ...customStyles.modalParagraph,
  };

  const loadingSpinnerContainerStyle: React.CSSProperties = {
    ...{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "50px",
    },
    ...customStyles.loadingSpinnerContainer,
  };

  const loadingSpinnerStyle: React.CSSProperties = {
    ...{
      borderRadius: "50%",
      borderTop: "5px solid rgba(0, 0, 0, 0.2)",
      borderLeft: "5px solid #007bff",
      borderBottom: "5px solid rgba(0, 0, 0, 0.2)",
      borderRight: "5px solid rgba(0, 0, 0, 0.2)",
      width: "8em",
      height: "8em",
      animation: "spin 1.5s infinite linear",
    },
    ...customStyles.loadingSpinner,
  };

  const contentContainerStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
  };

  const transactionDetailsContainerStyle: React.CSSProperties = {
    ...{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "2rem",
    },
    ...customStyles.transactionDetailsContainer,
  };

  const detailRowStyle: React.CSSProperties = {
    ...{
      display: "flex",
      alignItems: "center",
      marginBottom: "0.5rem",
    },
    ...customStyles.detailRow,
  };

  const detailLabelStyle: React.CSSProperties = {
    ...{
      color: "#d1d1d1",
      marginRight: "0.5rem",
    },
    ...customStyles.detailLabel,
  };

  const detailValueStyle: React.CSSProperties = {
    ...{
      color: "#ffffff",
      marginRight: "0.2rem",
    },
    ...customStyles.detailValue,
  };

  const detailSymbolStyle: React.CSSProperties = {
    ...{
      color: "#ffffff",
      margin: "0 0.2rem",
    },
    ...customStyles.detailSymbol,
  };

  const addDetailAmountStyle: React.CSSProperties = {
    ...{
      color: "green",
    },
    ...customStyles.addDetailAmount,
  };

  const subtractDetailAmountStyle: React.CSSProperties = {
    ...{
      color: "red",
    },
    ...customStyles.subtractDetailAmount,
  };

  const styles = {
    paymentButton: buttonStyles,
    modalOverlay: modalOverlayStyles,
    modalContent: modalContentStyles,
    modalActions: modalActionsStyles,
    modalButton: modalButtonStyles,
    modalButtonConfirm: modalButtonConfirmStyles,
    modalButtonCancel: modalButtonCancelStyles,
    modalHeader: modalHeaderStyles,
    modalParagraph: modalParagraphStyles,
    loadingSpinnerContainer: loadingSpinnerContainerStyle,
    loadingSpinner: loadingSpinnerStyle,
    contentContainer: contentContainerStyle,
    transactionDetailsContainer: transactionDetailsContainerStyle,
    detailRow: detailRowStyle,
    detailLabel: detailLabelStyle,
    detailValue: detailValueStyle,
    detailSymbol: detailSymbolStyle,
    addDetailAmount: addDetailAmountStyle,
    subtractDetailAmount: subtractDetailAmountStyle,
  };

  const getModalContent = () => {
    switch (transactionStatus) {
      case "Loading":
        return (
          <div style={styles.modalContent}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={styles.loadingSpinnerContainer}>
              <div style={styles.loadingSpinner}></div>
            </div>
            <div style={styles.transactionDetailsContainer}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Sender:</span>
                <span style={styles.detailValue}>{address}</span>
                <span style={styles.detailSymbol}>-</span>
                <span style={styles.subtractDetailAmount}>{amount}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Recipient:</span>
                <span style={styles.detailValue}>{recipient}</span>
                <span style={styles.detailSymbol}>+</span>
                <span style={styles.addDetailAmount}>{amount}</span>
              </div>
            </div>
            {txn && (
              <div style={styles.modalActions}>
                <button
                  style={styles.modalButtonConfirm}
                  onClick={() => window.open(getExplorerUrl(5, txn), "_blank")}
                >
                  View Transaction
                </button>
              </div>
            )}
          </div>
        );
      case "Success":
        return (
          <div style={styles.modalContent}>
            <div style={styles.contentContainer}>
              <h4 style={styles.modalHeader}>Payment Successful</h4>
              <p style={styles.modalParagraph}>
                Thank you for your transaction!
              </p>
            </div>
            {txn && (
              <div style={styles.modalActions}>
                {explorerUrl ? (
                  <button
                    style={styles.modalButtonConfirm}
                    onClick={() => window.open(explorerUrl, "_blank")}
                  >
                    View
                  </button>
                ) : (
                  <p style={styles.modalParagraph}>{txn}</p>
                )}
                <button
                  style={styles.modalButtonCancel}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        );
      case "Failed":
        return (
          <div style={styles.modalContent}>
            <div style={styles.contentContainer}>
              <h4 style={styles.modalHeader}>Payment Failed</h4>
              <p style={styles.modalParagraph}>
                An error occurred during the transaction.
              </p>
            </div>
            <div style={styles.modalActions}>
              <button
                style={styles.modalButtonCancel}
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div style={styles.modalContent}>
            <div style={styles.contentContainer}>
              <h4 style={styles.modalHeader}>Confirm Payment</h4>
              <p style={styles.modalParagraph}>
                Are you sure you want to send <strong>{amount}</strong> to{" "}
                <strong>{recipient}</strong>
              </p>
            </div>
            <div style={styles.contentContainer}>
              <h4 style={styles.modalHeader}>Recipient:</h4>
              <p style={styles.modalParagraph}>
                {recipient.substring(0, 8)}...
                {recipient.substring(recipient.length - 8)}
              </p>
            </div>
            <div style={styles.contentContainer}>
              <h4 style={styles.modalHeader}>Amount:</h4>
              <p style={styles.modalParagraph}>{amount}</p>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.modalButtonConfirm} onClick={handlePayment}>
                Confirm
              </button>
              <button
                style={styles.modalButtonCancel}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {address ? (
        <>
          <button
            style={styles.paymentButton}
            className={className}
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            {icon}
            {buttonText}
          </button>

          {showConfirmModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>{getModalContent()}</div>
            </div>
          )}
        </>
      ) : (
        <ConnectWallet style={styles.paymentButton} />
      )}
    </div>
  );
};

export default PaymentButton;
