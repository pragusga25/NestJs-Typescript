import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter-dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');

    const querySearch =
      'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)';
    const queryStatus = 'task.status = :status';

    if (search && status) {
      query.andWhere(`(${querySearch}) AND ${queryStatus}`, {
        search: `%${search}%`,
        status,
      });
    } else if (status) {
      query.andWhere(queryStatus, { status });
    } else if (search) {
      query.andWhere(querySearch, { search: `%${search}%` });
    }

    const tasks = await query.getMany();

    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);

    return task;
  }
}
