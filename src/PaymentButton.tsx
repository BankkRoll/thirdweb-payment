// src/PaymentButton.tsx
import React, { useEffect, useState } from "react";
import { useSDK, ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { ethers } from "ethers";

/**
 * Props for the PaymentButton component.
 * @param recipient - Ethereum address of the recipient.
 * @param amount - Amount in Ether to send.
 * @param className - Custom className for the button.
 * @param buttonText - Custom text for the button.
 * @param icon - Icon element to display next to the button text.
 * @param customStyles - Custom CSS styles for the button.
 * @param onPaymentSuccess - Callback function for successful payment.
 * @param onPaymentError - Callback function for payment error.
 */
interface PaymentButtonProps {
  recipient: string;
  amount: string;
  className?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  customStyles?: React.CSSProperties;
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
  customStyles,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStyle, setModalStyle] = useState({});
  const sdk = useSDK();
  const address = useAddress();
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (showModal) {
      setModalStyle({
        opacity: 0,
        transform: "scale(0.9)",
        transition: "opacity 0.3s, transform 0.3s",
      });

      setTimeout(() => {
        setModalStyle({
          opacity: 1,
          transform: "scale(1)",
          transition: "opacity 0.3s, transform 0.3s",
        });
      }, 10);
    }
  }, [showModal]);

  const handlePayment = async () => {
    setShowModal(false);
    setIsLoading(true);
    setTransactionStatus(null);

    try {
      if (!sdk) {
        throw new Error("Please connect your wallet first.");
      }

      const valueInWei = ethers.utils.parseEther(amount);
      const tx = { to: recipient, value: valueInWei };
      const signer = sdk.getSigner();

      if (!signer) throw new Error("Signer not available.");
      if (!signer.provider) throw new Error("Provider not available.");

      const txResponse = await signer.sendTransaction(tx);
      const receipt = await txResponse.wait();

      if (receipt.status === 1) {
        setTransactionStatus("Success");
        onPaymentSuccess && onPaymentSuccess();
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

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const styles = {
    paymentButton: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "10px 20px",
      border: "2px solid transparent",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s, border-color 0.3s",
      fontWeight: "bold",
      ...customStyles,
    },
    paymentOverlay: {
      position: "fixed" as "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paymentModal: {
      backgroundColor: "#1a1a1a",
      color: "white",
      padding: "25px",
      borderRadius: "8px",
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
      width: "350px",
      ...modalStyle,
    },
    paymentModalButton: {
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      padding: "10px 15px",
      margin: "0 10px",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      fontWeight: "bold",
    },
    paymentModalButtonCancel: {
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      padding: "10px 15px",
      margin: "0 10px",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      fontWeight: "bold",
    },
    paymentLoader: {
      textAlign: "center" as "center",
      marginTop: "20px",
    },
  };

  return (
    <div>
      {address ? (
        <>
          <button
            style={{ ...styles.paymentButton, ...customStyles }}
            className={className}
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                {icon}
                {buttonText}
              </>
            )}
          </button>
  
          {showModal && (
            <div style={styles.paymentOverlay}>
              <div style={styles.paymentModal}>
                <h3>Confirm Payment</h3>
                <p>Recipient: {`${recipient.substring(0, 4)}...${recipient.substring(recipient.length - 4)}`}</p>
                <p>Amount: {amount} ETH</p>
                <div className="payment-modal-actions">
                  <button
                    style={styles.paymentModalButton}
                    onClick={handlePayment}
                  >
                    Confirm
                  </button>
                  <button
                    style={styles.paymentModalButtonCancel}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <ConnectWallet />
      )}
  
      {isLoading && <div style={styles.paymentLoader}>Loading...</div>}
    </div>
  );
};

export default PaymentButton;
