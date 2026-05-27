export class PaginatedDataDto<T> {
  data: T[];
  totalItems: number;
  currentPage: number;

  constructor(data: T[], totalItems: number, currentPage: number) {
    this.data = data;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
  }

  static fromEntity<T>(items: T[], totalItems: number, currentPage: number): PaginatedDataDto<T> {
    return new PaginatedDataDto<T>(items, totalItems, currentPage);
  }
}
