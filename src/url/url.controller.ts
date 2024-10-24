import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response } from 'express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @SkipThrottle({ default: false })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('/shorten')
  create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Get()
  findAll() {
    return this.urlService.findAll();
  }

  @SkipThrottle()
  @Get(':urlId')
  findOne(@Param('urlId') urlId: string, @Res() response: Response) {
    return this.urlService.findOne(urlId, response);
  }
}
