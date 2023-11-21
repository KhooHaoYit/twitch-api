import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { fetchClip } from './twitch';
import { pipeline } from 'stream/promises';
import { PassThrough } from 'stream';
import SizeExtractor from '@khoohaoyit/image-size';
import { upload } from './attachmentUploader';
import { request } from 'undici';

@Injectable()
export class AppService {

  constructor(
    private prisma: PrismaService,
  ) { }

  async scrapeClip(clipSlug: string) {
    const clip = await fetchClip(clipSlug);
    await Promise.all([
      this.handleClip(clip),
      this.handleClipper(clip),
      this.handleStreamer(clip),
    ]);
    return clip;
  }

  async handleClipper(clip: Awaited<ReturnType<typeof fetchClip>>) {
    await prismaUpsertRetry(this.prisma.channel, {
      where: { id: clip.clipper.id },
      update: {
        handle: clip.clipper.handle,
        name: clip.clipper.name,
      },
      create: {
        id: clip.id,
        handle: clip.clipper.handle,
        name: clip.clipper.name,
      },
    });
  }

  async handleStreamer(clip: Awaited<ReturnType<typeof fetchClip>>) {
    const dbChannel = await this.prisma.channel.findUnique({
      where: { id: clip.streamer.id },
    });
    const newAvatarUrl = await (async () => {
      const oldFilename = dbChannel?.avatarUrl?.split('?')[0].split('/').at(-1);
      if (oldFilename === clip.streamer.avatarFilename)
        return;
      const res = await request(clip.streamer.avatarUrl);
      const size = +<string>res.headers['content-length'];
      if (Number.isNaN(size))
        throw new Error(`size isn't a number`);
      const attachment = await upload(res.body, clip.streamer.avatarFilename, size);
      return attachment.url;
    })();
    await prismaUpsertRetry(this.prisma.channel, {
      where: { id: clip.streamer.id },
      update: {
        handle: clip.streamer.handle,
        name: clip.streamer.name,
        avatarUrl: newAvatarUrl,
      },
      create: {
        id: clip.id,
        handle: clip.streamer.handle,
        name: clip.streamer.name,
        avatarUrl: newAvatarUrl,
      },
    });
  }

  async handleClip(clip: Awaited<ReturnType<typeof fetchClip>>) {
    const dbClip = await this.prisma.clip.findUnique({
      where: { id: clip.id },
    });
    if (dbClip)
      return;
    const [videoUrl, { thumbnailUrl, width, height }] = await Promise.all([
      // video
      (async () => {
        const res = await request(clip.videoUrl);
        const size = +<string>res.headers['content-length'];
        if (Number.isNaN(size))
          throw new Error(`size is not a number`);
        const attachment = await upload(res.body, clip.videoFilename, size)
        return attachment.url;
      })(),
      // thumbnail
      (async () => {
        const res = await request(clip.thumbnailUrl);
        const size = +<string>res.headers['content-length'];
        if (Number.isNaN(size))
          throw new Error(`size is not a number`);
        const sizeExtractor = new SizeExtractor({ passthrough: true });
        const body = new PassThrough;
        const [attachment] = await Promise.all([
          upload(body, clip.thumbnailFilename, size),
          pipeline(
            res.body,
            sizeExtractor,
            body,
          ),
        ]);
        const [[{ width, height }]] = sizeExtractor.sizes;
        return {
          width,
          height,
          thumbnailUrl: attachment.url
        };
      })(),
    ]);
    await this.prisma.clip.create({
      data: {
        id: clip.id,
        slug: clip.slug,
        title: clip.title,
        viewCount: clip.viewCount,
        gameName: clip.gameName,
        width,
        height,
        videoUrl,
        thumbnailUrl,
        streamerChannel: {
          connectOrCreate: {
            where: { id: clip.streamer.id },
            create: { id: clip.streamer.id },
          },
        },
        clipperChannel: {
          connectOrCreate: {
            where: { id: clip.clipper.id },
            create: { id: clip.clipper.id },
          },
        },
      },
    });
  }

}

async function prismaUpsertRetry<
  T extends {
    upsert: (...args: any[]) => Promise<any>,
  },
>(model: T, args: Parameters<T['upsert']>[0], amount = 2): Promise<Awaited<ReturnType<T['upsert']>>> {
  let err: Error | null = null;
  for (; amount; --amount) {
    const result = await model.upsert(args)
      .catch((err: Error) => err);
    // if (
    //   result instanceof Error
    //   && 'code' in result
    //   && typeof result.code === 'string'
    //   && [ // https://www.prisma.io/docs/reference/api-reference/error-reference
    //     'P2002', // "Unique constraint failed on the {constraint}"
    //     'P2003', // "Foreign key constraint failed on the field: {field_name}"
    //     'P2024', // "A constraint failed on the database: {database_error}"
    //   ].indexOf(result.code) !== -1
    // ) continue;
    if (result instanceof Error) {
      err = result;
      continue;
    }
    return result as Awaited<ReturnType<T['upsert']>>;
  }
  if (err)
    throw err;
  throw new Error(`Exceeded retry count`);
}
