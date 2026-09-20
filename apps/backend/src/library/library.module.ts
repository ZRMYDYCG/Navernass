import { Module } from '@nestjs/common'
import { LibraryController } from './library.controller.js'
import { LibraryService } from './library.service.js'

@Module({
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
