import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from 'nestjs-prisma';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('/clips/:clipSlug')
  async getClip(
    @Param('clipSlug') clipSlug: string,
    @Query() {
      includeClipperChannel,
      includeStreamerChannel,
    }: Record<'includeClipperChannel' | 'includeStreamerChannel', string>,
  ) {
    const clip = await this.prisma.clip.findUnique({
      where: { slug: clipSlug },
    });
    const streamerChannel =
      includeStreamerChannel
        ? clip?.streamerChannelId
          ? await this.prisma.channel.findUnique({
            where: { id: clip.streamerChannelId }
          })
          : null
        : undefined;
    const clipperChannel =
      includeClipperChannel
        ? clip?.clipperChannelId
          ? await this.prisma.channel.findUnique({
            where: { id: clip.clipperChannelId }
          })
          : null
        : undefined;
    return {
      ...clip,
      streamerChannel,
      clipperChannel,
    };
  }

  @Post('/clips/:clipSlug')
  async fetchClip(
    @Param('clipSlug') clipSlug: string,
    @Query() includes: Record<'includeClipperChannel' | 'includeStreamerChannel', string>,
  ) {
    await this.appService.scrapeClip(clipSlug);
    return await this.getClip(clipSlug, includes);
  }

}
