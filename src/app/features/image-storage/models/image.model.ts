export interface StorageQuota {
  userId?: string;
  usedBytes: number;
  quotaBytes: number;
  fileCount: number;
  percentageUsed: number;
  availableBytes: number;
  isFull: boolean;
  updatedAt?: string;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;             // bytes
  width: number;
  height: number;
  format: string;           // jpg, png, gif, webp
  uploadedAt: Date;
  userId?: string;
  storageKey?: string;
  thumbnailKey?: string;
  uploadedBy: {
    name: string;
    avatar?: string;
  };
}

