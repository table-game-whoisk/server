import { logger } from "./logger"

const runTime = Date.now()

class AppStatus {
  runing = false

  isRunning() {
    this.runing = true
    logger.info(`app took ${Date.now() - runTime} ms to running`)
  }

  waitRun() {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (this.runing) {
          resolve(true)
          clearInterval(timer)
        }
      }, 300)
    })
  }
}

export const appStatus = new AppStatus()