import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload-zone',
  templateUrl: './image-upload-zone.html',
  styleUrls: ['./image-upload-zone.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class ImageUploadZoneComponent {
  @Output() filesSelected = new EventEmitter<File[]>();

  isDragOver = false;
  readonly acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  readonly maxSizeBytes = 20 * 1024 * 1024; // 20MB

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = ''; // Reset để cho phép chọn lại cùng file
    }
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter(file => {
      if (!this.acceptedTypes.includes(file.type)) {
        console.warn(`Định dạng không hỗ trợ: ${file.name}`);
        return false;
      }
      if (file.size > this.maxSizeBytes) {
        console.warn(`File quá lớn (>10MB): ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }
}
