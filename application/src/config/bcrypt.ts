import * as bcrypt from 'bcrypt';

export async function encodePassword(rawPassword: string): Promise<string> {
  const SALT = bcrypt.genSaltSync();
  return bcrypt.hashSync(rawPassword, SALT);
}

export async function comparePassword(
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compareSync(rawPassword, hashedPassword);
}
