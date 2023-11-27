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
            <h3>Payment Successful</h3>
            <p>Thank you for your transaction!</p>
            {txn && (
              <div style={{ display: "flex", alignItems: "center" }}>
                {explorerUrl ? (
                  <a
                    style={styles.modalButton}
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Transaction
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
            )}
          </div>
        );
      case "Failed":
        return (
          <div>
            <h3>Payment Failed</h3>
            <p>An error occurred during the transaction.</p>
            <button style={styles.modalButtonCancel} onClick={handleCloseModal}>
              Close
            </button>
          </div>
        );
      default:
        return (
          <div>
            <h3>Confirm Payment</h3>
            <p>
              Recipient:{" "}
              {`${recipient.substring(0, 6)}...${recipient.substring(
                recipient.length - 6
              )}`}
            </p>
            <p>Amount: {amount}</p>
            <div className="payment-modal-actions">
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
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s, border-color 0.3s",
    fontWeight: "bold",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    textTransform: "uppercase",
    fontSize: "16px",
    letterSpacing: "1px",
    margin: "0 auto",
    display: "block",
    ...customStyles,
  };

  const modalOverlayStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalContentStyles: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
    width: "100%",
    maxWidth: "400px",
    ...modalStyle,
  };

  const modalButtonStyles: React.CSSProperties = {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 20px",
    margin: "0 10px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontWeight: "bold",
  };

  const modalButtonCancelStyles: React.CSSProperties = {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "12px 20px",
    margin: "0 10px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontWeight: "bold",
  };

  const loaderStyles: React.CSSProperties = {
    textAlign: "center",
    margin: "20px",
  };

  const styles = {
    paymentButton: buttonStyles,
    modalOverlay: modalOverlayStyles,
    modalContent: modalContentStyles,
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
        <ConnectWallet />
      )}
    </div>
  );
};

export default PaymentButton;
