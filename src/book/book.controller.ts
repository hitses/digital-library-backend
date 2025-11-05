import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Book } from './entities/book.entity';
import { ConfigService } from '@nestjs/config';

@Controller('book')
export class BookController {
  private readonly defaultPage;
  private readonly defaultLimit;

  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {
    this.defaultPage = Number(this.configService.get('DEFAULT_PAGE'));
    this.defaultLimit = Number(this.configService.get('DEFAULT_LIMIT'));
  }

  @Post()
  @Auth()
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.create(createBookDto);
  }

  @Get()
  @Auth()
  findAll(
    @Query('page') page = this.defaultPage,
    @Query('limit') limit = this.defaultLimit,
  ): Promise<{
    data: Book[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    return this.bookService.findAll(+page, +limit);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page = this.defaultPage,
    @Query('limit') limit = this.defaultLimit,
  ): Promise<{
    data: Book[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    return this.bookService.search(query, +page, +limit);
  }

  @Get('featured')
  findFeaturedBooks(): Promise<Book[]> {
    return this.bookService.findFeaturedBooks();
  }

  @Get('new')
  findNewBooks(): Promise<Book[]> {
    return this.bookService.findNewBooks();
  }

  @Get('popular')
  getTopBooks() {
    return this.bookService.getPopularBooks();
  }

  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookDto);
  }

  @Patch(':id/featured')
  @Auth()
  setFeatured(
    @Param('id', MongoIdPipe) id: string,
    @Body('featured') featured: boolean,
  ) {
    return this.bookService.toggleFeatured(id, featured);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', MongoIdPipe) id: string): Promise<Book> {
    return this.bookService.remove(id);
  }
}
