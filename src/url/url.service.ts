import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { url } from '@prisma/client';

@Injectable()
export class UrlService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}
  async create(createUrlDto: CreateUrlDto): Promise<url> {
    const { longUrl } = createUrlDto;

    const urlID = nanoid();
    try {
      const existingUrl = await this.prisma.url.findUnique({
        where: {
          longUrl,
        },
      });

      if (existingUrl) {
        return existingUrl;
      } else {
        const shortUrl = `${this.configService.get('devBaseURL')}/${urlID}`;
        const newUrl = await this.prisma.url.create({
          data: {
            longUrl,
            shortUrl,
            urlID,
          },
        });
        return newUrl;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
        { description: error },
      );
    }
  }

  async findOne(urlId: string, response: Response): Promise<void> {
    try {
      const url = await this.prisma.url.findUnique({
        where: {
          urlID: urlId,
        },
      });

      if (!url) {
        throw new NotFoundException('Could not find url');
      }

      // Perform the redirect
      response.redirect(url.longUrl);
    } catch (error) {
      throw new InternalServerErrorException('Could not get url', {
        description: error,
      });
    }
  }

    findAll() {
    return `This action returns all url`;
  }

}
