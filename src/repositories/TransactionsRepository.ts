import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const queryBuilder = this.createQueryBuilder();
    const built = queryBuilder
      .select('Transaction.type', 'type')
      .addSelect('SUM(Transaction.value)', 'value')
      .groupBy('Transaction.type');
    const result = await built.getRawMany();
    const balance: Balance = { income: 0, outcome: 0, total: 0 };

    result.forEach(item => {
      if (item.type === 'income') {
        balance.income = Number.parseFloat(item.value);
      }
      if (item.type === 'outcome') {
        balance.outcome = Number.parseFloat(item.value);
      }
    });
    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
