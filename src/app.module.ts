import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { core } from '@webarchiver/protoc';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { TasksModule } from './tasks/tasks.module';
import { SharedModule } from './shared/shared.module';



@Module({
  imports: [

    TasksModule,
    SharedModule,
  ],
})
export class AppModule implements OnModuleInit {
  private heroesService: core.v1.TasksServiceClient;

  constructor(@Inject('CORE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.heroesService =
      this.client.getService<core.v1.TasksServiceClient>(TASKS_SERVICE_NAME);
    //this.createTask().subscribe((value) => console.log(value));
  }

  createTask(): Observable<core.v1.Task> {
    return this.heroesService.createTask({ pageId: 8870135 }, new Metadata());
  }
}
