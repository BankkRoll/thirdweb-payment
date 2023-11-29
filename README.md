# thirdweb-payment Button Component
![example](https://github.com/BankkRoll/thirdweb-payment/assets/106103625/532d6f80-4b49-47bf-aa1e-58b27634ce5c)

## Overview

The Payment Button component is a reusable React component for handling Ethereum payments. It allows users to initiate a payment by specifying the recipient's Ethereum address and the amount to send.

## Installation & Usage

### Step 1: Configuration

In your app, configure the `@thirdweb-dev/react` package as follows:

1. Install the required packages:

   ```
   npm i @thirdweb-dev/react @thirdweb-dev/sdk ethers@^5
   ```

2. Initialize the `ThirdwebProvider` component with the desired chain and client ID:

   ```javascript
    // More info here: https://portal.thirdweb.com/react/react.thirdwebprovider
    import { ThirdwebProvider } from "@thirdweb-dev/react";

    function MyApp() {
    return (
        <ThirdwebProvider
        activeChain="ethereum"
        clientId="your-client-id"
        >
        <YourApp />
        </ThirdwebProvider>
      );
    }
   ```

### Step 2: Button Component

To use the Payment Button component in your project, follow these steps:

1. Install the package via npm:

   ```
   npm install thirdweb-payment
   ```

- To ensure the component is styled correctly, import the CSS file from the dist folder of the thirdweb-payment package:

   ```
   import 'thirdweb-payment/dist/PaymentButton.css';
   ```

2. Now, you can use the `PaymentButton` component in your React application as shown below:

```javascript
import React from 'react';
import { PaymentButton } from 'thirdweb-payment';
import 'thirdweb-payment/dist/PaymentButton.css';

function Home() {
  // Callback function for successful payment
  const handlePaymentSuccess = () => {
    console.log('Payment successful');
  };

  // Callback function for payment error
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  return (
    <div>
 (
    <div>
        <PaymentButton
          // Required props
          recipient="0x1234567890abcdef"         // Ethereum address of the recipient
          amount="0.001"                         // Amount in Ether to send

          // Optional props
          className="custom-payment-button"      // Custom className for the button
          termsText="Custom terms text"          // Custom terms text
          buttonText="Pay with Ether"            // Custom text for the button
          icon="💰"                              // Custom icon for the button
          
          // Custom classes (*YOU MAY NEED TO USE THE "!important" FLAG IN YOUR CSS TO OVERRIDE DEFAULT STYLES*)
          customClasses={{
            contentContainer: "custom-content-container",          // Custom className for the container
            button: "custom-button-style",                         // Custom className for the connect/buy button

            modalOverlay: "custom-modal-overlay",                  // Custom className for the modal overlay
            modalContent: "custom-modal-content",                  // Custom className for the modal content 
            modalButton: "custom-modal-button",                    // Custom className for the base modal buttons
            modalButtonSuccess: "custom-modal-button-success",     // Custom className for the modal button success 
            modalButtonCancel: "custom-modal-button-cancel",       // Custom className for the modal button cancel
            modalActions: "custom-modal-actions",                  // Custom className for the modal actions container
            modalHeader: "custom-modal-header",                    // Custom className for the modal
            modalParagraph: "custom-modal-paragraph",              // Custom className for the modal

            loadingSpinnerContainer: "custom-loading-spinner-container",  // Custom className for the loading spinner container
            loadingSpinner: "custom-loading-spinner",              // Custom className for the loading spinner

            transactionDetailsContainer: "custom-transaction-details-container", // Custom className for the transaction details container 
            transactionDetailRow: "custom-transaction-detail-row",              // Custom className for the transaction details row  
            transactionDetailLabel: "custom-transaction-detail-label",          // Custom className for the transaction details label
            transactionDetailValue: "custom-transaction-detail-value",          // Custom className for the transaction details value
            transactionDetailSymbol: "custom-transaction-detail-symbol",        // Custom className for the transaction details symbol
            transactionAddDetailAmount: "custom-transaction-add-detail-amount", // Custom className for the transaction details add amount
            transactionSubtractDetailAmount: "custom-transaction-subtract-detail-amount",    // Custom className for the transaction details subtract amount

            termsContainer: "custom-terms-container",                      // Custom className for the terms container
            termsCheckBox: "custom-terms-check-box",                       // Custom className for the terms checkbox
            termsCheckBoxLabel: "custom-terms-check-box-label",            // Custom className for the terms checkbox label

            additionalPaymentButton: "custom-additional-payment-button",   // Custom className additional payment button
            errorBlock: "custom-error-block",                              // Custom className error block warning container
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
    </div>
  );
}

export default Home;
```

## Props

The `PaymentButton` component accepts the following props:

- `recipient` (string): Ethereum address of the recipient of payments.
- `amount` (string): Amount in Ether to send.
- `className` (string, optional): Custom className for the button.
- `buttonText` (string, optional): Custom text for the button.
- `termsText` (string, optional): Custom text for the terms label.
- `icon` (React.ReactNode, optional): Custom icon element to display next to the button text.
- `customClasses` (object, optional): Custom CSS styles for different parts of the component, including button, modal overlay, modal content, modal buttons, and loader.
- `onPaymentSuccess` (function, optional): Callback function for successful payment.
- `onPaymentError` (function, optional): Callback function for payment error.

## License

This component is released under the MIT License.
