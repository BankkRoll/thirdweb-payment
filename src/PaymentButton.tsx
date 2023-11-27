// src/PaymentButton.tsx
import React, { useState } from 'react';
import { useSDK, ConnectWallet } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import './PaymentButton.css';

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
  buttonText = 'Buy Now',
  icon,
  customStyles,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const sdk = useSDK();

  const handlePayment = async () => {
    setShowModal(false);
    setIsLoading(true);
    setTransactionStatus(null);

    try {
      if (!sdk) {
        throw new Error('Please connect your wallet first.');
      }

      const valueInWei = ethers.utils.parseEther(amount);
      const tx = { to: recipient, value: valueInWei };
      const signer = sdk.getSigner();

      if (!signer) throw new Error('Signer not available.');
      if (!signer.provider) throw new Error('Provider not available.');

      const txResponse = await signer.sendTransaction(tx);
      const receipt = await txResponse.wait();

      if (receipt.status === 1) {
        setTransactionStatus('Success');
        onPaymentSuccess && onPaymentSuccess();
      } else {
        setTransactionStatus('Failed');
        throw new Error('Payment failed.');
      }
    } catch (error) {
      setTransactionStatus('Failed');
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

  return (
    <div>
      {sdk ? (
        <>
          <button
            className={`payment-button ${className}`}
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : <>{icon}{buttonText}</>}
          </button>

          {showModal && (
            <div className="payment-overlay">
              <div className="payment-modal">
                <h3>Confirm Payment</h3>
                <p>Recipient: {recipient}</p>
                <p>Amount: {amount} ETH</p>
                <div className="payment-modal-actions">
                  <button className="payment-modal-button" onClick={handlePayment}>Confirm</button>
                  <button className="payment-modal-button" onClick={handleCloseModal}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <ConnectWallet />
      )}

      {isLoading && (
        <div className="payment-loader" style={{ textAlign: 'center', marginTop: '20px' }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default PaymentButton;