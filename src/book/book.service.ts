import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { Model, Types } from 'mongoose';
import {
  createErrorResponse,
  updateErrorResponse,
} from 'src/common/methods/errors';
import { PAGINATION } from 'src/common/constants/pagination.constants';
import { Review } from 'src/review/entities/review.entity';

@Injectable()
export class BookService {
  private readonly defaultPage = PAGINATION.DEFAULT_PAGE;
  private readonly defaultLimit = PAGINATION.DEFAULT_LIMIT;

  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

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

    const [books, total] = await Promise.all([
      this.bookModel.find({ delete: false }).skip(skip).limit(limit).lean(),
      this.bookModel.countDocuments({ delete: false }),
    ]);

    const booksWithRatings = await this.enrichBooksWithRatings(books);

    return { data: booksWithRatings, total, page, limit };
  }

  async search(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    // Si no hay query, buscar todos
    if (!query || query.trim() === '') return this.findAll(page, limit);

    const normalizedQuery = this.normalizeText(query);

    // ISBN exacto o coincidencia parcial en título/autor
    const filter = {
      delete: false,
      $or: [
        { isbn: normalizedQuery },
        {
          title: { $regex: this.makeAccentInsensitiveRegex(normalizedQuery) },
        },
        {
          author: { $regex: this.makeAccentInsensitiveRegex(normalizedQuery) },
        },
      ],
    };

    const [books, total] = await Promise.all([
      this.bookModel.find(filter).skip(skip).limit(limit).lean(),
      this.bookModel.countDocuments(filter),
    ]);

    const booksWithRatings = await this.enrichBooksWithRatings(books);

    return { data: booksWithRatings, total, page, limit };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel
      .findOne({ _id: id, delete: false })
      .populate({
        path: 'reviews',
        match: { verified: true },
        select: 'name review rating createdAt',
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    if (!book) throw new NotFoundException('Book not found or deleted');

    const ratingStats = await this.calculateBookRating(id);

    return {
      ...book,
      averageRating: ratingStats.averageRating,
      totalReviews: ratingStats.totalReviews,
    } as any;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      const updatedBook = await this.bookModel.findOneAndUpdate(
        { _id: id, delete: false },
        updateBookDto,
        { new: true },
      );

      if (!updatedBook) throw new NotFoundException('Book not found');

      return updatedBook;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      return updateErrorResponse('Book', error);
    }
  }

  async remove(id: string): Promise<Book> {
    const deletedBook = await this.bookModel.findOneAndUpdate(
      { _id: id, delete: false },
      { delete: true },
      { new: true },
    );

    if (!deletedBook)
      throw new NotFoundException('Book not found or already deleted');

    return deletedBook;
  }

  // Normaliza texto para eliminar tildes, diéresis, ñ, etc.
  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Genera regex insensible a acentos
  private makeAccentInsensitiveRegex(query: string): RegExp {
    const accentMap: Record<string, string> = {
      a: '[aáàäâ]',
      e: '[eéèëê]',
      i: '[iíìïî]',
      o: '[oóòöô]',
      u: '[uúùüû]',
      n: '[nñ]',
      c: '[cç]',
    };

    const pattern = query
      .split('')
      .map((char) => accentMap[char] || char)
      .join('');

    return new RegExp(pattern, 'i');
  }

  private async enrichBooksWithRatings(books: any[]): Promise<Book[]> {
    if (books.length === 0) return [];

    const bookIds = books.map((book) => book._id);

    const ratingsData = await this.reviewModel.aggregate([
      {
        $match: {
          bookId: { $in: bookIds },
          verified: true,
        },
      },
      {
        $group: {
          _id: '$bookId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingsMap = new Map(
      ratingsData.map((item) => [
        item._id.toString(),
        {
          averageRating: Math.round(item.averageRating * 10) / 10,
          totalReviews: item.totalReviews,
        },
      ]),
    );

    return books.map((book) => ({
      ...book,
      averageRating: ratingsMap.get(book._id.toString())?.averageRating || 0,
      totalReviews: ratingsMap.get(book._id.toString())?.totalReviews || 0,
    }));
  }

  private async calculateBookRating(
    bookId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.reviewModel.aggregate([
      {
        $match: {
          bookId: new Types.ObjectId(bookId),
          verified: true,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    };
  }
}
