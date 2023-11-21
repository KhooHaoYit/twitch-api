import { request } from "undici";

export async function fetchClip(clipSlug: string) {
  const data = await request(`https://gql.twitch.tv/gql`, {
    method: 'POST',
    body: JSON.stringify(generateBody(clipSlug)),
    headers: {
      'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
    },
  }).then(res => res.body.json() as Promise<Data>);
  return {
    id: data[9].data.clip.id,
    slug: clipSlug,
    title: data[14].data.clip.title,
    gameName: data[9].data.clip.game.name,
    viewCount: data[14].data.clip.viewCount,
    thumbnailUrl: data[4].data.clip.thumbnailURL
      .replace(/-preview-.*$/, '-preview.jpg'),
    thumbnailFilename: data[4].data.clip.thumbnailURL
      .replace(/-preview-.*$/, '-preview.jpg')
      .split('/')
      .splice(3)
      .join('/')
      .replace(/[/%]/g, '_'),
    videoUrl: `${data[2].data.clip.videoQualities[0].sourceURL}?sig=${data[2].data.clip.playbackAccessToken.signature}&token=${encodeURIComponent(data[2].data.clip.playbackAccessToken.value)}`,
    videoFilename: data[2].data.clip.videoQualities[0].sourceURL
      .split('/')
      .splice(3)
      .join('/')
      .replace(/[/%]/g, '_'),
    streamer: {
      id: data[9].data.clip.broadcaster.id,
      name: data[9].data.clip.broadcaster.displayName,
      handle: data[9].data.clip.broadcaster.login,
      avatarUrl: data[9].data.clip.broadcaster.profileImageURL
        .replace(/-profile_image-.*$/, '-profile_image-300x300.png'),
      avatarFilename: data[9].data.clip.broadcaster.profileImageURL
        .replace(/-profile_image-.*$/, '-profile_image-300x300.png')
        .split('/')
        .at(-1)!,
    },
    clipper: {
      id: data[13].data.clip.curator.id,
      name: data[13].data.clip.curator.displayName,
      handle: data[13].data.clip.curator.login,
    },
  };
}
// BlightedAstuteZucchiniNinjaGrumpy-mL7quV7wpDPVv7ID
type Data = [
  unknown,
  unknown,
  {
    data: {
      clip: {
        playbackAccessToken: {
          signature: string
          value: string
        }
        videoQualities: {
          sourceURL: string
        }[]
      }
    }
  },
  unknown,
  {
    data: {
      clip: {
        thumbnailURL: string
      }
    }
  },
  unknown,
  unknown,
  unknown,
  unknown,
  {
    data: {
      clip: {
        id: string
        game: {
          name: string
        }
        broadcaster: {
          id: string
          login: string
          displayName: string
          profileImageURL: string
        }
      }
    }
  },
  unknown,
  unknown,
  unknown,
  {
    data: {
      clip: {
        curator: {
          id: string
          login: string
          displayName: string
        }
      }
    }
  },
  {
    data: {
      clip: {
        title: string
        viewCount: number
      }
    }
  },
];

function generateBody(clipSlug: string) {
  return [
    {
      "operationName": "ClipsView",
      "variables": {
        slug: clipSlug,
        "isCommunityMomentsFeatureEnabled": true
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "46e80db2f20f65bdc8125b871be148b32dd6a92f0509f27d8d43e02b63386808"
        }
      }
    },
    {
      "operationName": "ClipsSocialShare",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "86533e14855999f00b4c700c3a73149f1ddb5a5948453c77defcb8350e8d108d"
        }
      }
    },
    {
      "operationName": "ClipsDownloadButton",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "9c0a5b51612a41b06bfb93065deb6fd7bb7e011db2beb6e5e5d7588ae7f3ff4b"
        }
      }
    },
    {
      "operationName": "ClipsViewModerationModals",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "a313949f8702b400456f5cf59c4bf1bedeeba47cddaafd6b48591c118403c27c"
        }
      }
    },
    {
      "operationName": "WatchLivePrompt",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "dcf741d88e5066ac8c140f1247309c36ce459b9c15a1ef726634081733d7147d"
        }
      }
    },
    {
      "operationName": "ContentClassificationContext",
      "variables": {
        clipSlug: clipSlug,
        "isStream": false,
        "isClip": true,
        "isVOD": false
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "57bb6c1aca3631b2b3e74b1c3c8adbecbbcc3becb70ec52d7c5ef0f90d7c3b02"
        }
      }
    },
    {
      "operationName": "PlayerTrackingContextQuery",
      "variables": {
        "isLive": false,
        "hasCollection": false,
        "collectionID": "",
        "videoID": "",
        "hasVideo": false,
        slug: clipSlug,
        "hasClip": true
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "f8cf144bd3a96f628b0955799b689ddaf0d9f3f1155941ae6483083e421e3027"
        }
      }
    },
    {
      "operationName": "VideoPlayer_VideoSourceManager",
      "variables": {
        "input": {
          "login": null,
          "ownsVideoID": null,
          "ownsCollectionID": null,
          broadcasterOfClipSlug: clipSlug,
        }
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "f5e1b35d6f5a40348c6476fea36945d0931ba50621e1701b6c31252ee498cc3e"
        }
      }
    },
    {
      "operationName": "ComscoreStreamingQuery",
      "variables": {
        "channel": "",
        clipSlug: clipSlug,
        "isClip": true,
        "isLive": false,
        "isVodOrCollection": false,
        "vodID": ""
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "e1edae8122517d013405f237ffcc124515dc6ded82480a88daef69c83b53ac01"
        }
      }
    },
    {
      "operationName": "ClipsBroadcasterInfo",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "ce258d9536360736605b42db697b3636e750fdb14ff0a7da8c7225bdc2c07e8a"
        }
      }
    },
    {
      "operationName": "ClipsChatCard",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "3fede3b87c77902e2a9814337e8911768731c2f3224a974ddb7d825670ec2a87"
        }
      }
    },
    {
      "operationName": "ClipsViewCount",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "00209f168e946123d3b911544a57be26391306685e6cae80edf75cdcf55bd979"
        }
      }
    },
    {
      "operationName": "ClipsTitle",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "f6cca7f2fdfbfc2cecea0c88452500dae569191e58a265f97711f8f2a838f5b4"
        }
      }
    },
    {
      "operationName": "ClipsCurator",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "769e99d9ac3f68e53c63dd902807cc9fbea63dace36c81643d776bcb120902e2"
        }
      }
    },
    {
      "operationName": "ClipsActionButtons",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "c10c0319f1b62107ffaf542f36d82c58db3cdf7451379910fe27c45bac889ab4"
        }
      }
    },
    {
      "operationName": "ClipsRecommendations",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "3bc8eac6ad9406a9c7c0b9990338ebb0775e385a38738b5321bcc12a10ee587b"
        }
      }
    },
    {
      "operationName": "VideoAccessToken_Clip",
      "variables": {
        slug: clipSlug,
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11"
        }
      }
    }
  ];
}
