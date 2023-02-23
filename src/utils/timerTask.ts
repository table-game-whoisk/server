import { logger } from "./logger"

class TimerTask {
  static queue = new Set<Task>()
  static timer: NodeJS.Timeout | null = null;

  private static loop() {
    TimerTask.queue.forEach((item) => {
      if (item.date.getTime() <= Date.now()) {
        item.action()
        TimerTask.queue.delete(item)
      }
      if (TimerTask.queue.size === 0) {
        logger.info("timer task stop")
        TimerTask.stop()
      }
    })
  }
  static register(task: Task) {
    if (!TimerTask.timer) {
      logger.info("time task start");
      TimerTask.timer = setInterval(TimerTask.loop, 1000);
    }

    TimerTask.queue.add(task);
    logger.info(`there are currently ${TimerTask.queue.size} scheduled tasks`);
  }

  static stop() {
     clearInterval(TimerTask.timer!);
     TimerTask.timer = null;
  }
}