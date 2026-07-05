import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('imagens')
  @UseInterceptors(
    FilesInterceptor('imagens', 5, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(UPLOAD_DIR)) {
            mkdirSync(UPLOAD_DIR, { recursive: true });
          }
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `produto-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const isValid = allowedTypes.test(extname(file.originalname).toLowerCase())
          && allowedTypes.test(file.mimetype);
        if (isValid) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Apenas imagens são permitidas (jpeg, png, webp, gif)'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por arquivo
    }),
  )
  uploadImagens(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhuma imagem enviada');
    }

    const urls = files.map(
      (file) => `/api/upload/imagens/${file.filename}`,
    );

    return { urls };
  }
}
