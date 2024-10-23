import { Inject, Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class UrlService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}
  async create(createUrlDto: CreateUrlDto) {
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
        return { data: newUrl };
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  findAll() {
    return `This action returns all url`;
  }

  async findOne(urlId: string, response: Response) {
    try {
      const url = await this.prisma.url.findUnique({
        where: {
          urlID: urlId,
        },
      });

      if (url) return response.redirect(url.longUrl);
    } catch (error) {
      console.log(error);
    }
  }
}
