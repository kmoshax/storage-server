import { BadRequestError } from "../libs/errors";
import { FileService } from "../services/file.service";

interface RequestWithParams extends Request {
    params?: { [key: string]: string };
}

export class FileController {

    public static async uploadFile(req: Request) {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) throw new BadRequestError('No file uploaded or invalid form data.');


        const fileRecord = await FileService.storeFile(file, file.name);
        if (!fileRecord) return Response.json({ success: false, message: 'server error' }, { status: 500 })

        const fileUrl = `${new URL(req.url).origin}/files/${fileRecord.storedFilename}`;

        return Response.json({
            success: true,
            message: 'file uploaded successfully',
            filename: fileRecord.storedFilename,
            url: fileUrl,
            size: fileRecord.size,
        }, { status: 200 })
    }

    public static async getFile(req: RequestWithParams) {
        const { filename } = req.params!;
        if (!filename) throw new BadRequestError('filename is required.');

        const metadata = await FileService.getFile(filename);
        if (!metadata) return Response.json({ success: false, message: "file not found" }, { status: 404 })

        const fileBlob = Bun.file(metadata.path);
        if (!(await fileBlob.exists()))
            throw new Error('File is missing from storage, please contact an administrator.');

        const headers = new Headers({
            'Content-Type': metadata.mimetype,
            'Content-Length': metadata.size.toString(),
            'Cache-Control': 'public, max-age=31536000',
        });

        return new Response(fileBlob, { headers, status: 200 });
    }

    static async deleteFile(req: RequestWithParams): Promise<Response> {
        const { filename } = req.params!;
        if (!filename) throw new BadRequestError('Filename is required.');

        const result = await FileService.deleteFile(filename);
        return Response.json(result);
    }

}