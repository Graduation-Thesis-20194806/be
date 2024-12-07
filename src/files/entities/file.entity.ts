export class FileEntity {
  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
