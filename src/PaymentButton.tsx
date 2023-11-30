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
 * @param termsText - Custom text for the terms link.
 * @param icon - Icon element to display next to the button text.
 * @param customClasses - Custom CSS styles for different parts of the component.
 * @param onPaymentSuccess - Callback function for successful payment.
 * @param onPaymentError - Callback function for payment error.
 * @param onTransactionLog - Callback function for transaction log.
 */
export interface PaymentButtonProps {
  recipient: string;
  amount: string;
  className?: string;
  buttonText?: string;
  termsText?: string;
  icon?: React.ReactNode;
  customClasses?: {
    button?: string;
    contentContainer?: string;
    modalOverlay?: string;
    modalContent?: string;
    modalButton?: string;
    modalButtonConfirm?: string;
    modalButtonCancel?: string;
    modalActions?: string;
    modalHeader?: string;
    modalParagraph?: string;
    loadingSpinnerContainer?: string;
    loadingSpinner?: string;
    transactionDetailsContainer?: string;
    transactionDetailRow?: string;
    transactionDetailLabel?: string;
    transactionDetailValue?: string;
    transactionDetailSymbol?: string;
    transactionAddDetailAmount?: string;
    transactionSubtractDetailAmount?: string;
    additionalPaymentButton?: string;
    termsContainer?: string;
    termsCheckBox?: string;
    termsCheckBoxLabel?: string;
    errorBlock?: string;
  };
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
  onTransactionLog?: (logData: any) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  recipient,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onTransactionLog,
  className,
  buttonText = "Buy Now",
  termsText = `I acknowledge that editing the transaction details may lead to a total loss of funds, and I agree to send the exact amount of ${amount} ETH to the specified recipient.`,
  icon,
  customClasses = {},
}) => {
  const sdk = useSDK();
  const address = useAddress();
  const [termsChecked, setTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<string | null>(null);
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
    setValidationError(null);

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
      const transaction = await signer.provider.getTransaction(txResponse.hash);

      let owedAmount = "0.0";
      const sentAmount = ethers.utils.formatEther(transaction.value);
      if (transaction && sentAmount !== amount) {
        owedAmount = ethers.utils.formatEther(
          ethers.utils.parseEther(amount).sub(transaction.value)
        );
        setValidationError(
          `The sent amount does not match the requested amount. You still owe ${owedAmount} ETH.`
        );
        setRemainingAmount(owedAmount);
      }

      if (receipt.status === 1) {
        setTransactionStatus("Success");
        const network = await signer.provider.getNetwork();
        const url = getExplorerUrl(network.chainId, txResponse.hash);
        setExplorerUrl(url);
        onPaymentSuccess && onPaymentSuccess();
        setPaymentConfirmed(true);

        onTransactionLog &&
          onTransactionLog({
            type: "success",
            transactionHash: txResponse.hash,
            from: transaction.from,
            to: transaction.to,
            amount: transaction.value.toString(),
            nonce: transaction.nonce,
            gasLimit: transaction.gasLimit.toString(),
            gasPrice: transaction.gasPrice?.toString(),
            maxFeePerGas: transaction.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
            chainId: transaction.chainId,
            initialAmount: amount,
            remainingAmount: owedAmount,
          });
      } else {
        setTransactionStatus("Failed");
        throw new Error("Payment transaction failed.");
      }
    } catch (error) {
      setTransactionStatus("Failed");
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      onPaymentError && onPaymentError(error);

      onTransactionLog &&
        onTransactionLog({
          type: "error",
          errorMessage: errorMessage,
          amount,
          recipient,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdditionalPayment = async (remainingAmount: string) => {
    if (remainingAmount === null) {
      setError("No remaining amount to pay.");
      return;
    }

    setIsLoading(true);
    setTransactionStatus("Loading");
    setError(null);
    setValidationError(null);

    try {
      if (!sdk) throw new Error("Please connect your wallet first.");

      const remainingAmountInWei = ethers.utils.parseEther(remainingAmount);
      const tx = { to: recipient, value: remainingAmountInWei };
      const signer = sdk.getSigner();

      if (!signer) throw new Error("Signer not available.");
      if (!signer.provider) throw new Error("Provider not available.");

      const txResponse = await signer.sendTransaction(tx);
      const receipt = await txResponse.wait();
      const updatedTransaction = await signer.provider.getTransaction(
        txResponse.hash
      );
      const updatedRemainingAmount = ethers.utils.formatEther(
        ethers.utils.parseEther(amount).sub(updatedTransaction.value)
      );

      if (receipt.status === 1) {
        setTransactionStatus("Success");
        setValidationError(null);
        setRemainingAmount(null);
        onPaymentSuccess && onPaymentSuccess();

        onTransactionLog &&
          onTransactionLog({
            type: "additionalPaymentSuccess",
            transactionHash: txResponse.hash,
            from: updatedTransaction.from,
            to: updatedTransaction.to,
            amount: updatedTransaction.value.toString(),
            nonce: updatedTransaction.nonce,
            gasLimit: updatedTransaction.gasLimit.toString(),
            gasPrice: updatedTransaction.gasPrice?.toString(),
            maxFeePerGas: updatedTransaction.maxFeePerGas?.toString(),
            maxPriorityFeePerGas:
              updatedTransaction.maxPriorityFeePerGas?.toString(),
            chainId: updatedTransaction.chainId,
            initialAmount: amount,
            remainingAmount: updatedRemainingAmount,
          });
      } else {
        setTransactionStatus("Failed");
        throw new Error("Payment transaction failed.");
      }
    } catch (error) {
      setTransactionStatus("Failed");
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      onPaymentError && onPaymentError(error);

      onTransactionLog &&
        onTransactionLog({
          type: "additionalPaymentError",
          errorMessage: errorMessage,
          initialAmount: amount,
          remainingAmount,
          recipient,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => setShowConfirmModal(true);
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setTransactionStatus(null);
    setPaymentConfirmed(false);
    setTransactionStatus(null);
    setTxn(null);
  };

  const getModalContent = () => {
    switch (transactionStatus) {
      case "Loading":
        return (
          <div className="modal-content">
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
            <div className="transaction-details-container">
              <div className="transaction-detail-row">
                <span className="transaction-detail-label">Sender:</span>
                <span className="transaction-detail-value">{address}</span>
                <span className="transaction-detail-symbol">-</span>
                <span className="transaction-subtract-detail-amount">
                  <strong>{amount} ETH</strong>
                </span>
              </div>
              <div className="transaction-detail-row">
                <span className="transaction-detail-label">Recipient:</span>
                <span className="transaction-detail-value">{recipient}</span>
                <span className="transaction-detail-symbol">+</span>
                <span className="transaction-add-detail-amount">
                  <strong>{amount} ETH</strong>
                </span>
              </div>
            </div>
            {txn && (
              <div className="modal-actions">
                <button
                  className="modal-button-confirm"
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
          <div className="modal-content">
            <div className="content-container">
              <h4 className="modal-header">Payment Successful</h4>
              <p className="modal-paragraph">Thank you for your transaction!</p>
              {validationError && (
                <>
                  <p className="error-block">{validationError}</p>
                  <button
                    className="additional-payment-button"
                    onClick={() =>
                      remainingAmount !== null &&
                      handleAdditionalPayment(remainingAmount)
                    }
                  >
                    Pay Remaining {remainingAmount} ETH
                  </button>
                </>
              )}
            </div>
            {txn && (
              <div className="modal-actions">
                {explorerUrl ? (
                  <button
                    className="modal-button-confirm"
                    onClick={() => window.open(explorerUrl, "_blank")}
                  >
                    View Transaction
                  </button>
                ) : (
                  <p className="modal-paragraph">{txn}</p>
                )}
                <button
                  className="modal-button-cancel"
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
          <div className="modal-content">
            <div className="content-container">
              <h4 className="modal-header">Payment Failed</h4>
              <p className="modal-paragraph">
                An error occurred during the transaction.
              </p>
              {error && <div className="error-block">{error}</div>}
            </div>
            <div className="modal-actions">
              <button
                className="modal-button-cancel"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="modal-content">
            <div className="content-container">
              <h4 className="modal-header">Confirm Payment</h4>
              <p className="modal-paragraph">
                Are you sure you want to send <strong>{amount} ETH</strong> to{" "}
                <strong>{recipient}</strong>
              </p>
            </div>
            <div className="content-container">
              <h4 className="modal-header">Recipient:</h4>
              <p className="modal-paragraph">
                {recipient.substring(0, 8)}...
                {recipient.substring(recipient.length - 8)}
              </p>
            </div>
            <div className="content-container">
              <h4 className="modal-header">Amount:</h4>
              <p className="modal-paragraph">
                <strong>{amount} ETH</strong>
              </p>
            </div>
            <div className="terms-container">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                className="terms-check-box"
              />
              <label className="terms-check-box-label">{termsText}</label>
            </div>
            <div className="modal-actions">
              <button
                className="modal-button-cancel"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              {!termsChecked && (
                <button className="modal-button-confirm-before-terms" disabled>
                  Confirm
                </button>
              )}
              {termsChecked && (
                <button
                  className="modal-button-confirm"
                  onClick={handlePayment}
                  disabled={!termsChecked}
                >
                  Confirm
                </button>
              )}
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
            className={`payment-button ${className || ""}`}
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            {icon}
            {buttonText}
          </button>

          {showConfirmModal && (
            <div className="modal-overlay">
              <div className="modal-content">{getModalContent()}</div>
            </div>
          )}
        </>
      ) : (
        <ConnectWallet switchToActiveChain={true} className="payment-button" />
      )}
    </div>
  );
};

export default PaymentButton;
