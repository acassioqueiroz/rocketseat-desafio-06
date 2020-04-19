import { isUuid } from 'uuidv4';
import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (!isUuid(id)) {
      throw new AppError('Invalid UUID format.');
    }

    const transaction = await transactionsRepository.findOne({ where: { id } });

    if (transaction) {
      await transactionsRepository.remove(transaction);
      return;
    }
    throw new AppError('Transaction not found', 401);
  }
}

export default DeleteTransactionService;
