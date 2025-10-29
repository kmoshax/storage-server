import { join } from 'node:path';

import type { File } from '../../prisma/generated/client';
import { config } from '../config';

import { fileMetadataCache } from '../libs/cache';
import { prisma } from '../libs/prisma';
import { NotFoundError } from '../libs/errors';
import { unlink } from 'node:fs/promises';
import { Logger } from '../libs/logger';

export class FileService {
	public static async storeFile(
		file: Blob,
		originalFileName: string,
	): Promise<File | null> {
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
				path: filePath,
			},
		});

		return fileRecord;
	}

	public static async getFile(storedFilename: string): Promise<File | null> {
		const cachedData = fileMetadataCache.get(storedFilename);
		if (cachedData) return cachedData;

		const fileRecord = await prisma.file.findUnique({
			where: { storedFilename },
		});
		if (!fileRecord) return null;

		fileMetadataCache.set(storedFilename, fileRecord);

		return fileRecord;
	}

	public static async deleteFile(storedFilename: string) {
		const fileRecord = await prisma.file.findUnique({
			where: { storedFilename },
		});
		if (!fileRecord) throw new NotFoundError('File to delete not found');

		try {
			await unlink(fileRecord.path);

			await prisma.file.delete({
				where: { storedFilename },
			});

			fileMetadataCache.delete(storedFilename);

			Logger.info(
				`Deleted file: ${fileRecord.originalFilename} (${storedFilename})`,
			);
			return { message: 'File deleted successfully' };

			// biome-ignore lint/suspicious/noExplicitAny: i hate this
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				Logger.warn(
					`File not found on disk but was in DB: ${fileRecord.path}. Cleaning up DB record.`,
				);

				await prisma.file.delete({ where: { storedFilename } });
				fileMetadataCache.delete(storedFilename);

				return {
					message:
						'File record cleaned up, but file was already missing from disk.',
				};
			}
			throw error;
		}
	}
}
