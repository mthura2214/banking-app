import React, { useState } from 'react';

function TransferFunds() {
  const [sourceAccountNumber, setSourceAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_account_number: sourceAccountNumber,
          recipient_name: recipientName,
          amount: parseFloat(amount), // Ensure amount is a number
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setResponseMessage(`Error: ${errorData.error}`);
      } else {
        const data = await response.json();
        setResponseMessage(data.message);
      }
    } catch (error) {
      setResponseMessage(`Error: Unable to complete the transfer`);
    }
  };

  return (
    <div>
      <h1>Transfer Funds</h1>
      <form onSubmit={handleTransfer}>
        <div>
          <label>Source Account Number:</label>
          <input
            type="text"
            value={sourceAccountNumber}
            onChange={(e) => setSourceAccountNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Recipient Name:</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Transfer</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default TransferFunds;
