import React, { useState, useEffect } from 'react';

import { format, parseISO } from 'date-fns';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface ApiCategory {
  id: string;
  title: string;
}

interface ApiTransaction {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: number;
  created_at: string;
  category: ApiCategory;
}

interface ApiBalance {
  income: number;
  outcome: number;
  total: number;
}

interface ApiTransactionObject {
  transactions: ApiTransaction[];
  balance: ApiBalance;
}

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      api.get<ApiTransactionObject>('/transactions').then(response => {
        const apiTransactionObject = response.data;

        const apiTransactions = apiTransactionObject.transactions;
        const apiBalance = apiTransactionObject.balance;

        const newTransactions = apiTransactions.map<Transaction>(
          transaction => ({
            id: transaction.id,
            title: transaction.title,
            value: transaction.value,
            formattedValue: formatValue(transaction.value),
            formattedDate: format(
              parseISO(transaction.created_at),
              'yyyy/MM/dd'
            ),
            type: transaction.type,
            category: { title: transaction.category.title },
            created_at: parseISO(transaction.created_at)
          })
        );

        const newBalance: Balance = {
          income: formatValue(apiBalance.income),
          outcome: formatValue(apiBalance.outcome),
          total: formatValue(apiBalance.total)
        };

        setTransactions([...newTransactions]);
        setBalance(newBalance);
      });
    }

    loadTransactions();
  }, [transactions]);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance && balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance && balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance && balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => {
                return (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className={transaction.type}>
                      {transaction.type === 'outcome'
                        ? `- ${transaction.formattedValue}`
                        : `${transaction.formattedValue}`}
                    </td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
