export type PaginateEntity<T> = {
  /**
   * Total items number
   *
   * @example 1010
   */
  total: number;

  items: T[];
};
