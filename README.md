# thirdweb-payment Button Component

## Overview

The Payment Button component is a reusable React component for handling Ethereum payments. It allows users to initiate a payment by specifying the recipient's Ethereum address and the amount to send.

## Installation

To use the Payment Button component in your project, follow these steps:

1. Install the package via npm:

   ```
   npm install thirdweb-payment
   ```

## Usage

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

Now, you can use the `PaymentButton` component in your React application as shown below:

```javascript
import React from 'react';
import { PaymentButton } from 'thirdweb-payment';

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
        <PaymentButton
          // Required props
          recipient="0x1234567890abcdef"         // Ethereum address of the recipient
          amount="0.001"                         // Amount in Ether to send

          // Optional props
          className="custom-button-style"        // Custom className for the button
          buttonText="Pay with Ether"            // Custom text for the button
          icon="💰"                              // Custom icon for the button
          customStyles={{
            button: {
            // Custom styles for the pay button
            },
            modalOverlay: {
            // Custom styles for the modal overlay
            },
            modalContent: {
            // Custom styles for the modal content
            },
            modalButton: {
            // Custom styles for the modal button success
            },
            modalButtonCancel: {
            // Custom styles for the modal button cancel
            },
            loader: {
              container: {
              // Custom styles for the loader container
              },
              spinner: {
              // Custom styles for the loader spinner
              },
              text: {
              // Custom styles for the loader text
              },
              link: {
              // Custom styles for the loader txn link
              },
            },
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
- `icon` (React.ReactNode, optional): Custom icon element to display next to the button text.
- `customStyles` (object, optional): Custom CSS styles for different parts of the component, including button, modal overlay, modal content, modal buttons, and loader.
- `onPaymentSuccess` (function, optional): Callback function for successful payment.
- `onPaymentError` (function, optional): Callback function for payment error.

## License

This component is released under the MIT License.
