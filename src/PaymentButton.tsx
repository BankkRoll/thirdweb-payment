// src/PaymentButton.tsx
import React, { useState } from "react";
import { useSDK, ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import SpinnerLoading from "./Loading";

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
  customStyles?: {
    button?: React.CSSProperties;
    modalOverlay?: React.CSSProperties;
    modalContent?: React.CSSProperties;
    modalButton?: React.CSSProperties;
    modalButtonCancel?: React.CSSProperties;
    loader?: {
      container?: React.CSSProperties;
      spinner?: React.CSSProperties;
      text?: React.CSSProperties;
      link?: React.CSSProperties;
    };
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
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalStyle, setModalStyle] = useState<React.CSSProperties>({});
  const sdk = useSDK();
  const address = useAddress();
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [txn, setTxn] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

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
    setTransactionStatus(null);

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

  const getModalContent = () => {
    switch (transactionStatus) {
      case "Success":
        return (
          <div>
            <h3 style={modalHeaderStyles}>Payment Successful</h3>
            <p style={modalParagraphStyles}>Thank you for your transaction!</p>
            {txn && (
              <div style={styles.modalActions}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {explorerUrl ? (
                    <a
                      style={styles.modalButton}
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    txn
                  )}
                  <button
                    style={styles.modalButtonCancel}
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "Failed":
        return (
          <div>
            <h3 style={modalHeaderStyles}>Payment Failed</h3>
            <p style={modalParagraphStyles}>
              An error occurred during the transaction.
            </p>
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
          <div>
            <h3 style={modalHeaderStyles}>Confirm Payment</h3>
            <p style={modalParagraphStyles}>
              Recipient:{" "}
              <span>{`${recipient.substring(0, 8)}...${recipient.substring(
                recipient.length - 8
              )}`}</span>
            </p>
            <p style={modalParagraphStyles}>Amount: {amount}</p>
            <div style={styles.modalActions}>
              <button style={styles.modalButton} onClick={handlePayment}>
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

  const buttonStyles: React.CSSProperties = {
    backgroundColor: "#007bff",
    color: "#ffffff",
    padding: "10px 20px",
    border: "1px solid #002244",
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
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(50, 50, 50, 0.85)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalContentStyles: React.CSSProperties = {
    backgroundColor: "#282c34",
    color: "#fff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.75)",
    zIndex: 1050,
    width: "400px",
    height: "auto",
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    ...modalStyle,
  };

  const modalButtonStyles: React.CSSProperties = {
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
    fontWeight: "500",
    margin: "0",
    flex: "1",
    marginLeft: "10px",
    marginRight: "10px",
  };

  const modalButtonCancelStyles: React.CSSProperties = {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
    fontWeight: "500",
    margin: "0",
    flex: "1",
    marginLeft: "10px",
    marginRight: "10px",
  };

  const loaderStyles: React.CSSProperties = {
    textAlign: "center",
    margin: "20px",
  };

  const modalActionsStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-around",
    paddingTop: "4rem",
    width: "100%",
  };

  const modalHeaderStyles: React.CSSProperties = {
    color: "#ffffff",
    marginBottom: "6px",
    textAlign: "center",
    fontSize: "20px",
  };

  const modalParagraphStyles: React.CSSProperties = {
    color: "#d1d1d1",
    textAlign: "center",
    fontSize: "16px",
  };

  const styles = {
    paymentButton: buttonStyles,
    modalOverlay: modalOverlayStyles,
    modalContent: modalContentStyles,
    modalActions: modalActionsStyles,
    modalButton: modalButtonStyles,
    modalButtonCancel: modalButtonCancelStyles,
    loader: loaderStyles,
  };

  return (
    <div>
      {address ? (
        <>
          <button
            style={{ ...styles.paymentButton, ...customStyles.button }}
            className={className}
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            {icon}
            {buttonText}
          </button>

          {showConfirmModal && (
            <div
              style={{ ...styles.modalOverlay, ...customStyles.modalOverlay }}
            >
              <div
                style={{ ...styles.modalContent, ...customStyles.modalContent }}
              >
                {isLoading ? (
                  <SpinnerLoading
                    isLoading
                    txn={txn}
                    customStyles={customStyles.loader}
                  />
                ) : (
                  getModalContent()
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <ConnectWallet
          style={{ ...styles.paymentButton, ...customStyles.button }}
        />
      )}
    </div>
  );
};

export default PaymentButton;
