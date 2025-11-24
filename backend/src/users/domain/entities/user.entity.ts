import { BaseEntity, BaseSnapshot, Email, Id } from '../../../shared/domain';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserRole } from './user-role.enum';

export interface UserSnapshot extends BaseSnapshot {
  email: string;
  password: string;
  name: string;
  active: boolean;
  role: UserRole;
}

export class User extends BaseEntity<UserSnapshot, UserCreatedEvent> {
  private constructor(
    id: Id,
    private readonly _email: Email,
    private readonly _password: string,
    private readonly _name: string,
    private _active: boolean,
    private _role: UserRole,
    created_at?: Date,
    updated_at?: Date,
  ) {
    super(id, created_at, updated_at);
  }

  static create(props: {
    email: string;
    password: string;
    name: string;
    active?: boolean;
    role?: UserRole;
  }): User {
    const user = new User(
      new Id(),
      new Email(props.email),
      props.password,
      props.name,
      props.active ?? true,
      props.role ?? UserRole.USER,
    );

    user.addDomainEvent(new UserCreatedEvent(user.id, props.email, props.name));

    return user;
  }

  static rehydrate(snapshot: UserSnapshot): User {
    return new User(
      new Id(snapshot.id),
      new Email(snapshot.email),
      snapshot.password,
      snapshot.name,
      snapshot.active,
      snapshot.role ?? UserRole.USER,
      snapshot.created_at,
      snapshot.updated_at,
    );
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id.value,
      email: this._email.value,
      password: this._password,
      name: this._name,
      active: this._active,
      role: this._role,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  activate(): void {
    this._active = true;
    this.touch();
  }

  deactivate(): void {
    this._active = false;
    this.touch();
  }

  changePassword(newPassword: string): void {
    (this as any)._password = newPassword;
    this.touch();
  }

  get email(): Email {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get name(): string {
    return this._name;
  }

  get active(): boolean {
    return this._active;
  }

  get role(): UserRole {
    return this._role;
  }

  changeRole(newRole: UserRole): void {
    (this as any)._role = newRole;
    this.touch();
  }
}
