import fs from 'fs';
import csv from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filepath: string;
}

class ImportTransactionsService {
  async execute({ filepath }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const results: any[] = [];

    const promise = new Promise<Transaction[]>((resolve, reject) => {
      const transactions: Transaction[] = [];
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', data => results.push(data))
        .on('end', async () => {
          for (let x = 1; x < results.length; x += 1) {
            const [title, type, value, category] = results[x];
            // eslint-disable-next-line no-await-in-loop
            const transaction = await createTransactionService.execute({
              title: title.trim(),
              type: type.trim(),
              value: Number.parseFloat(value),
              categoryTitle: category.trim(),
            });
            transactions.push(transaction);
          }
          fs.promises.unlink(filepath);
          resolve(transactions);
        })
        .on('error', err => {
          reject(err);
        });
    });

    const transactions = await promise;

    return transactions;
  }
}

export default ImportTransactionsService;
