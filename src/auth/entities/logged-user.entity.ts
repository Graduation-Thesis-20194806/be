export class LoggedUserEntity {
  /**
   * user'id
   */
  id: number;
}

export type LoggedUserRequest = {
  user: LoggedUserEntity;
};
