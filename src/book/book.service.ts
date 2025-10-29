import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { Model } from 'mongoose';
import { createErrorResponse } from 'src/common/methods/errors';
import { PAGINATION } from 'src/common/constants/pagination.constants';

@Injectable()
export class BookService {
  private readonly defaultPage = PAGINATION.DEFAULT_PAGE;
  private readonly defaultLimit = PAGINATION.DEFAULT_LIMIT;

  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const existingBook = await this.bookModel.findOne({
      isbn: createBookDto.isbn,
    });

    if (existingBook?.delete) {
      Object.assign(existingBook, {
        ...createBookDto,
        delete: false,
      });

      return existingBook.save();
    }

    if (existingBook)
      throw new ConflictException('Book with this ISBN already exists');

    try {
      const newBook = await this.bookModel.create(createBookDto);

      return newBook;
    } catch (error) {
      return createErrorResponse('Book', error);
    }
  }

  async findAll(
    page: number = this.defaultPage,
    limit: number = this.defaultLimit,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.bookModel.find({ delete: false }).skip(skip).limit(limit),
      this.bookModel.countDocuments({ delete: false }),
    ]);

    return { data, total, page, limit };
  }

  findOne(id: string) {
    return `This action returns a #${id} book`;
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    console.log(updateBookDto);
    return `This action updates a #${id} book`;
  }

  remove(id: string) {
    return `This action removes a #${id} book`;
  }
}
