import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const categoryId = { id: '' };

    if (!value || Number.isNaN(value) || value < 0) {
      throw new AppError('Invalid value of the transaction.', 400);
    }

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insufficiente funds.');
    }

    const categoryFound = await categoriesRepository.findOne({
      where: {
        title: categoryTitle,
      },
    });

    if (categoryFound) {
      categoryId.id = categoryFound.id;
    } else {
      const categoryCreated = categoriesRepository.create({
        title: categoryTitle,
      });
      await categoriesRepository.save(categoryCreated);
      categoryId.id = categoryCreated.id;
    }

    const transactionCreated = transactionsRepository.create({
      title,
      type,
      value,
      category_id: categoryId.id,
    });

    await transactionsRepository.save(transactionCreated);
    return transactionCreated;
  }
}

export default CreateTransactionService;
