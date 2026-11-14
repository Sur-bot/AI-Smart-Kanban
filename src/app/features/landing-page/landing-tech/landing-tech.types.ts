/**
 * Định danh các tầng kiến trúc công nghệ trong hệ thống AI Smart Kanban.
 */
export type TechCategoryId = 'frontend' | 'backend' | 'data' | 'devops';

/**
 * Bộ lọc hiển thị tầng công nghệ, bao gồm chế độ xem toàn bộ.
 */
export type TechFilterId = TechCategoryId | 'all';

/**
 * Thông tin hiển thị của một công nghệ được sử dụng trong hệ thống.
 */
export interface TechnologyItem {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly iconPath: string;
  readonly fallbackIcon: string;
  readonly altTextKey: string;
  readonly roleKey: string;
  readonly descriptionKey: string;
  readonly schemaCategory: string;
  readonly featured?: boolean;
}

/**
 * Nhóm các công nghệ thuộc cùng một tầng kiến trúc.
 */
export interface TechLayerGroup {
  readonly id: TechCategoryId;
  readonly icon: string;
  readonly gridColumns: 2 | 3;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly items: readonly TechnologyItem[];
}

/**
 * Cấu hình tab lọc tầng kiến trúc trên thanh điều hướng.
 */
export interface TechFilterTab {
  readonly id: TechFilterId;
  readonly icon: string;
  readonly labelKey: string;
  readonly count: number;
}
