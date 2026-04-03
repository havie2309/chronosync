import { prisma } from "../lib/prisma.js";

type SessionInput = {
  email: string;
  name?: string;
  photoUrl?: string;
};

async function findOrCreateUser(input: SessionInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      photoUrl: input.photoUrl
    }
  });
}

async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export { findOrCreateUser, getUserByEmail };
export type { SessionInput };
