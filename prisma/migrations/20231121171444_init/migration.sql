-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "gameName" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "viewCount" INTEGER,
    "streamerChannelId" TEXT,
    "clipperChannelId" TEXT,
    "i_updatedAt" TIMESTAMP(3) NOT NULL,
    "i_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "handle" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "i_updatedAt" TIMESTAMP(3) NOT NULL,
    "i_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clip_slug_key" ON "Clip"("slug");

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_streamerChannelId_fkey" FOREIGN KEY ("streamerChannelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_clipperChannelId_fkey" FOREIGN KEY ("clipperChannelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
