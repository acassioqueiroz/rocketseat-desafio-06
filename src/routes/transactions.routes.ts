import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

import multer = require('multer');

interface TransactionItem {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
  created_at: Date;
  updated_at: Date;
}

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();
  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    categoryTitle: category,
  });
  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute({
      filepath: `${uploadConfig.directory}/${request.file.filename}`,
    });

    const transactionItems: TransactionItem[] = [];

    transactions.forEach(transaction => {
      const transactionItem: TransactionItem = {
        id: transaction.id,
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category_id: transaction.category_id,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      };
      transactionItems.push(transactionItem);
    });

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
