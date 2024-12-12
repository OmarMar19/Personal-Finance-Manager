import React, { useState, useEffect } from 'react';
import './App.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('income'); // 'income' or 'expense'
  const [balance, setBalance] = useState(0);
  const [timeFilter, setTimeFilter] = useState('all'); // daily, weekly, monthly, all

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions'));
    if (savedTransactions) {
      setTransactions(savedTransactions);
      calculateBalance(savedTransactions);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    calculateBalance(transactions);
  }, [transactions]);

  // Function to add a transaction
  const addTransaction = () => {
    if (description === '' || amount === '' || category === '') return;

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
    setCategory('');
  };

  // Calculate the total balance
  const calculateBalance = (transactions) => {
    const totalBalance = transactions.reduce((acc, transaction) => {
      return transaction.type === 'income'
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
    setBalance(totalBalance);
  };

  // Filter transactions based on time
  const filterTransactions = () => {
    const today = new Date();
    let filteredTransactions = transactions;

    if (timeFilter === 'daily') {
      filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.toDateString() === today.toDateString();
      });
    } else if (timeFilter === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      filteredTransactions = transactions.filter(
        (transaction) => new Date(transaction.date) >= oneWeekAgo
      );
    } else if (timeFilter === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      filteredTransactions = transactions.filter(
        (transaction) => new Date(transaction.date) >= oneMonthAgo
      );
    }

    return filteredTransactions;
  };

  // Generate data for the pie chart
  const pieChartData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      const existingCategory = acc.find((entry) => entry.name === transaction.category);
      if (existingCategory) {
        existingCategory.value += transaction.amount;
      } else {
        acc.push({ name: transaction.category, value: transaction.amount });
      }
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6666'];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Personal Finance Manager</h1>

        <div className="balance">
          <h2>Balance: ${balance.toFixed(2)}</h2>
        </div>

        <div className="transaction-inputs">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button onClick={addTransaction}>Add Transaction</button>
        </div>

        <div className="filter-section">
          <label>Filter by time: </label>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="transactions-list">
          <h3>Transactions:</h3>
          {filterTransactions().map((transaction) => (
            <div key={transaction.id} className="transaction">
              <p>
                {transaction.description} - ${transaction.amount.toFixed(2)} (
                {transaction.category}) - {transaction.type}
              </p>
              <p>Date: {new Date(transaction.date).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="pie-chart-section">
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="80%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </header>
    </div>
  );
}

export default App;
