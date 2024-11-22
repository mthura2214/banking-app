import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    surname: '',
    username: '',
    password: '',
    phoneNumber: '',
    identityNumber: '',
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [transaction, setTransaction] = useState({ type: '', amount: '' });
  const [transferData, setTransferData] = useState({
    recipientName: '',
    transferAmount: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const validatePhoneNumber = (phoneNumber) => /^[0-9]{10}$/.test(phoneNumber);
  const validateIdNumber = (idNumber) => /^[0-9]{13}$/.test(idNumber);
  const validateAmount = (amount) => parseFloat(amount) > 0;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', loginData);
      if (response?.data?.message) {
        alert(response.data.message);
        if (response.data.account_number) {
          fetchDashboard(response.data.account_number);
        } else {
          alert('Account number missing in response');
        }
      } else {
        alert('Invalid response from the server');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    let errors = {};

    if (!validatePhoneNumber(registerData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }
    if (!validateIdNumber(registerData.identityNumber)) {
      errors.identityNumber = 'ID number must be exactly 13 digits';
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', registerData);
      alert(response.data.message);
      setIsRegistering(false);
      setRegisterData({
        name: '',
        surname: '',
        username: '',
        password: '',
        phoneNumber: '',
        identityNumber: '',
      });
      setErrorMessages({});
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async (accountNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/dashboard/${accountNumber}`);
      if (response?.data) {
        setDashboardData({ accountNumber, ...response.data });
      } else {
        alert('Failed to load dashboard data');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    setLoading(true);
    let errors = {};

    if (transaction.type === 'deposit') {
      if (!validateAmount(transaction.amount)) {
        errors.amount = 'Deposit amount must be greater than 0';
      }
    } else if (transaction.type === 'withdraw') {
      if (!validateAmount(transaction.amount)) {
        errors.amount = 'Withdraw amount must be greater than 0';
      } else if (parseFloat(transaction.amount) > dashboardData.balance) {
        errors.amount = 'Insufficient balance for this withdrawal';
      }
    } else if (transaction.type === 'transfer') {
      if (!validateAmount(transferData.transferAmount)) {
        errors.transferAmount = 'Transfer amount must be greater than 0';
      }
      if (!transferData.recipientName.trim()) {
        errors.recipientName = 'Recipient name cannot be empty';
      }
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    try {
      if (transaction.type === 'transfer') {
        const response = await axios.post('http://127.0.0.1:5000/transfer', {
          source_account_number: dashboardData.accountNumber,
          recipient_name: transferData.recipientName,
          amount: parseFloat(transferData.transferAmount),
        });
        alert(response.data.message);
      } else {
        const response = await axios.post(`http://127.0.0.1:5000/${transaction.type}`, {
          account_number: dashboardData.accountNumber,
          amount: parseFloat(transaction.amount),
        });
        alert(response.data.message);
      }

      fetchDashboard(dashboardData.accountNumber);
      setTransaction({ type: '', amount: '' });
      setTransferData({ recipientName: '', transferAmount: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred during the transaction');
    } finally {
      setLoading(false);
    }
  };

  const toggleTransactionHistory = async () => {
    if (showTransactionHistory) {
      setShowTransactionHistory(false);
    } else {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:5000/transaction_history/${dashboardData.accountNumber}`);
        if (response?.data?.transactions) {
          setDashboardData({
            ...dashboardData,
            transactions: response.data.transactions,
          });
          setShowTransactionHistory(true);
        } else {
          alert('Failed to load transaction history');
        }
      } catch (error) {
        alert(error.response?.data?.error || 'An error occurred while fetching transaction history');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    setDashboardData(null);
    setLoginData({ username: '', password: '' });
    setIsRegistering(false);
  };

  return (
    <div className="app">
      <h1>Welcome, Emtee SwiftBank</h1>

      {loading && <p>Loading...</p>}

      {isRegistering ? (
        <div className="register">
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Name"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Surname"
            value={registerData.surname}
            onChange={(e) => setRegisterData({ ...registerData, surname: e.target.value })}
          />
          <input
            type="text"
            placeholder="Username"
            value={registerData.username}
            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={registerData.phoneNumber}
            onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
          />
          {errorMessages.phoneNumber && <p style={{ color: 'red' }}>{errorMessages.phoneNumber}</p>}
          <input
            type="text"
            placeholder="Identity Number"
            value={registerData.identityNumber}
            onChange={(e) => setRegisterData({ ...registerData, identityNumber: e.target.value })}
          />
          {errorMessages.identityNumber && <p style={{ color: 'red' }}>{errorMessages.identityNumber}</p>}
          <button onClick={handleRegistration}>Register</button>
          <p onClick={() => setIsRegistering(false)}>Already have an account? Login here</p>
        </div>
      ) : !dashboardData ? (
        <div className="login">
          <h2>Hello, Mthuthuzeli</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <button onClick={handleLogin}>Sign In</button>
          <p onClick={() => setIsRegistering(true)}>Don't have an account? Register here</p>
        </div>
      ) : (
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p>Account Balance: R {dashboardData.balance}</p>
          <select
            value={transaction.type}
            onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
          >
            <option value="">Select Transaction</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>

          {transaction.type === 'transfer' ? (
            <div>
              <input
                type="text"
                placeholder="Recipient Name"
                value={transferData.recipientName}
                onChange={(e) => setTransferData({ ...transferData, recipientName: e.target.value })}
              />
              {errorMessages.recipientName && <p style={{ color: 'red' }}>{errorMessages.recipientName}</p>}
              <input
                type="number"
                placeholder="Amount to transfer"
                value={transferData.transferAmount}
                onChange={(e) => setTransferData({ ...transferData, transferAmount: e.target.value })}
              />
              {errorMessages.transferAmount && <p style={{ color: 'red' }}>{errorMessages.transferAmount}</p>}
            </div>
          ) : transaction.type && (
            <div>
              <input
                type="number"
                placeholder="Amount"
                value={transaction.amount}
                onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              />
              {errorMessages.amount && <p style={{ color: 'red' }}>{errorMessages.amount}</p>}
            </div>
          )}
          <button onClick={handleTransaction}>Submit</button>
          <button onClick={toggleTransactionHistory}>
            {showTransactionHistory ? 'Hide Transactions' : 'Show Transactions'}
          </button>
          {showTransactionHistory && dashboardData.transactions && (
            <ul>
              {dashboardData.transactions.map((txn, index) => (
                <li key={index}>
                  {txn.type} of R {txn.amount} on {txn.date}
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default App;
