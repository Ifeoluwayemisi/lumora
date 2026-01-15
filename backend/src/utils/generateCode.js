import prisma from '../models/prismaClient.js';

const CHAR_POOL = "ABCDEFGHJKLMNPORSTUVWXYZ23456789";

export async function generateUniqueCode(batchId, manufacturerId) {
    const PREFIX = "LUM-";
    let code;

    do {
        code = PREFIX + Array(10).fill(0).map(() => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]).join('');
    } while (await prisma.code.findUnique({ where: { codeValue: code } }));
    return code;    
}