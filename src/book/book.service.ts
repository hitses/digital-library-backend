import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { Model } from 'mongoose';
import { createErrorResponse } from 'src/common/methods/errors';

@Injectable()
export class BookService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async create(createBookDto: CreateBookDto) {
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

  findAll() {
    return `This action returns all book`;
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
