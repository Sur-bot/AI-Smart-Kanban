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
  uploadedBy: {
    name: string;
    avatar?: string;
  };
}
