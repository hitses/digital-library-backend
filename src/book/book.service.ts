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
import { Review } from 'src/review/entities/review.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookService {
  private readonly defaultPage;
  private readonly defaultLimit;

  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private readonly configService: ConfigService,
  ) {
    this.defaultPage = Number(this.configService.get('DEFAULT_PAGE'));
    this.defaultLimit = Number(this.configService.get('DEFAULT_LIMIT'));
  }

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
      const shouldBeFeatured =
        (await this.bookModel.countDocuments({
          featured: true,
        })) < this.defaultLimit;

      const newBook = await this.bookModel.create({
        ...createBookDto,
        featured: shouldBeFeatured,
        featuredAt: shouldBeFeatured ? new Date() : undefined,
      });

      return newBook;
    } catch (error) {
      return createErrorResponse('Book', error);
    }
  }

  async findAll(
    page: number = this.defaultPage,
    limit: number = this.defaultLimit,
  ): Promise<{
    data: Book[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      this.bookModel
        .find({ delete: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.bookModel.countDocuments({ delete: false }),
    ]);

    const booksWithRatings = await this.enrichBooksWithRatings(books);
    const totalPages = Math.ceil(total / limit);

    return { data: booksWithRatings, total, totalPages, page, limit };
  }

  async getTotalCount(): Promise<number> {
    return await this.bookModel.countDocuments({ delete: false });
  }

  async getLatestsBooks(limit: number = 3): Promise<Book[]> {
    const latestBooks = await this.bookModel
      .find({ delete: false })
      .sort({ createdAt: -1 })
      .limit(limit);

    if (!latestBooks || latestBooks.length === 0) return [];

    return latestBooks;
  }

  async countRecentBooks(days: number = 30): Promise<number> {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.bookModel.countDocuments({
      createdAt: { $gte: sinceDate },
      delete: false,
    });
  }

  async getReviewlessBooks(
    page: number = this.defaultPage,
    limit: number = this.defaultLimit,
  ): Promise<{
    data: Book[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    const allBooks = await this.bookModel.find({ delete: false }).lean();
    const booksWithRatings = await this.enrichBooksWithRatings(allBooks);

    const reviewlessBooks = booksWithRatings.filter(
      (book) => !book.totalReviews || book.totalReviews === 0,
    );

    const total = reviewlessBooks.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: reviewlessBooks.slice(start, end),
      total,
      totalPages,
      page,
      limit,
    };
  }

  async search(
    query: string,
    page = this.defaultPage,
    limit = this.defaultLimit,
  ): Promise<{
    data: Book[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
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
    const totalPages = Math.ceil(total / limit);

    return { data: booksWithRatings, total, totalPages, page, limit };
  }

  async findFeaturedBooks(): Promise<Book[]> {
    const featuredBooks = await this.bookModel
      .find({ featured: true })
      .sort({ featuredAt: -1 })
      .lean();

    const booksWithRatings = await this.enrichBooksWithRatings(featuredBooks);

    if (!featuredBooks || featuredBooks.length === 0)
      throw new NotFoundException('Books not found');

    return booksWithRatings;
  }

  async findNewBooks(): Promise<Book[]> {
    const newBooks = await this.bookModel
      .find()
      .sort({ createdAt: -1 })
      .limit(this.defaultLimit)
      .lean();

    const booksWithRatings = await this.enrichBooksWithRatings(newBooks);

    if (!newBooks || newBooks.length === 0)
      throw new NotFoundException('Books not found');

    return booksWithRatings;
  }

  async getPopularBooks(): Promise<Book[]> {
    const books = await this.bookModel.aggregate([
      // Filtrar eliminados
      { $match: { delete: false } },

      // Calcular averageRating y totalReviews de reviews verificadas
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'bookId',
          pipeline: [
            { $match: { verified: true } },
            {
              $group: {
                _id: '$bookId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: 'ratingData',
        },
      },

      // Setear valores por defecto si sin reviews
      {
        $addFields: {
          averageRating: {
            $round: [
              {
                $ifNull: [
                  { $arrayElemAt: ['$ratingData.averageRating', 0] },
                  0,
                ],
              },
              1,
            ],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ['$ratingData.totalReviews', 0] }, 0],
          },
        },
      },

      // Orden: rating desc, fecha desc
      { $sort: { averageRating: -1, createdAt: -1 } },

      // Top
      { $limit: +this.defaultLimit },

      // Limpiar lookup intermedia
      { $project: { ratingData: 0 } },
    ]);

    return books;
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel
      .findOne({ _id: id, delete: false })
      .lean();

    if (!book) throw new NotFoundException('Book not found or deleted');

    const bookWithRatings = await this.calculateBookRating(book._id.toString());

    return {
      ...book,
      ...bookWithRatings,
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

  async toggleFeatured(id: string, makeFeatured: boolean): Promise<Book> {
    const book = await this.bookModel.findById(id);
    if (!book) throw new NotFoundException('Book not found');

    // Quitar featured
    if (!makeFeatured) {
      if (!book.featured) return book;
      book.featured = false;
      book.featuredAt = undefined;

      return book.save();
    }

    // Ya es featured
    if (book.featured) return book;

    // Contar destacados
    const count = await this.bookModel.countDocuments({ featured: true });

    if (count < this.defaultLimit) {
      book.featured = true;
      book.featuredAt = new Date();

      return book.save();
    }

    // Hay límite (.env file) -> rotar: quitar el primer featured según featuredAt asc
    const oldestFeatured = await this.bookModel
      .findOne({ featured: true })
      .sort({ featuredAt: 1 })
      .exec();

    if (oldestFeatured && !oldestFeatured._id.equals(book._id)) {
      oldestFeatured.featured = false;
      oldestFeatured.featuredAt = undefined;

      await oldestFeatured.save();
    }

    book.featured = true;
    book.featuredAt = new Date();

    return book.save();
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

    if (result.length === 0) return { averageRating: 0, totalReviews: 0 };

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    };
  }
}
