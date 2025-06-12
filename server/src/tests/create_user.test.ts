
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

const testInput: CreateUserInput = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with all fields', async () => {
    const result = await createUser(testInput);

    expect(result.email).toEqual('test@example.com');
    expect(result.username).toEqual('testuser');
    expect(result.display_name).toEqual('Test User');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a user without avatar_url', async () => {
    const inputWithoutAvatar = {
      email: 'test2@example.com',
      username: 'testuser2',
      display_name: 'Test User 2'
    };

    const result = await createUser(inputWithoutAvatar);

    expect(result.email).toEqual('test2@example.com');
    expect(result.username).toEqual('testuser2');
    expect(result.display_name).toEqual('Test User 2');
    expect(result.avatar_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].username).toEqual('testuser');
    expect(users[0].display_name).toEqual('Test User');
    expect(users[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should reject duplicate email', async () => {
    await createUser(testInput);

    const duplicateEmailInput = {
      email: 'test@example.com',
      username: 'differentuser',
      display_name: 'Different User'
    };

    await expect(createUser(duplicateEmailInput)).rejects.toThrow(/duplicate/i);
  });

  it('should reject duplicate username', async () => {
    await createUser(testInput);

    const duplicateUsernameInput = {
      email: 'different@example.com',
      username: 'testuser',
      display_name: 'Different User'
    };

    await expect(createUser(duplicateUsernameInput)).rejects.toThrow(/duplicate/i);
  });
});
