import { workerService } from "./workers.service.js";
import {
  createWorkerSchema,
  updateWorkerSchema,
  idSchema,
} from "./worker.validator.js";

export const getWorkers = async (req, res, next) => {
  try {
    const workers =
      await workerService.getAllWorkers();

    res.json(workers);

  } catch (error) {
    next(error);
  }
};
export const createWorker = async (req, res, next) => {
  try {
    const data = createWorkerSchema.parse(req.body);

    const result = await workerService.createWorker({
      data,
      user: req.user,
      ip: req.ip,
    });

    return res.status(201).json(result);

  } catch (error) {
    next(error);
  }
};

export const updateWorker = async (req, res, next) => {
  try {
    const { id } = idSchema.parse(req.params);

    const data = updateWorkerSchema.parse(req.body);

    const worker = await workerService.updateWorker({
      id,
      data,
      user: req.user,
      ip: req.ip,
    });

    res.json(worker);

  } catch (error) {
    next(error);
  }
};

export const deleteWorker = async (req, res, next) => {
  try {
    const { id } = idSchema.parse(req.params);

    const result = await workerService.deleteWorker({
      id,
      user: req.user,
      ip: req.ip,
    });

    res.json(result);

  } catch (error) {
    next(error);
  }
};       