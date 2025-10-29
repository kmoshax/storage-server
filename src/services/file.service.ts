import { join } from "node:path";
import { config } from "../config";
import { prisma } from "../libs/prisma";
import { fileMetadataCache } from "../libs/cache";
import type { File } from "../../prisma/generated/client";

export class FileService {

    public static async storeFile(file: Blob, originalFileName: string): Promise<File | null> {
        const fileExtension = originalFileName.split('.').pop() || '';
        const storedFileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = join(config.uploadDir, storedFileName);

        // ultrafast way to write files on the disk
        await Bun.write(filePath, file);

        const fileRecord = await prisma.file.create({
            data: {
                originalFilename: originalFileName,
                storedFilename: storedFileName,
                mimetype: file.type,
                size: file.size,
                path: filePath
            }
        });

        return fileRecord;
    }


    public static async getFile(storedFilename: string): Promise<File | null> {
        const cachedData = fileMetadataCache.get(storedFilename);
        if (cachedData) return cachedData;

        const fileRecord = await prisma.file.findUnique({ where: { storedFilename } });
        if (!fileRecord) return null;

        fileMetadataCache.set(storedFilename, fileRecord);

        return fileRecord;
    }

    public static async deleteFile(storedFilename: string) {
        const fileRecord = await prisma.file.findUnique({ where: { storedFilename } });
        if (!fileRecord) return 
    }
}