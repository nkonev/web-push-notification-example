import { NextFunction, Request, Response } from 'express';
import * as subscriptionRepository from '../repositories/subscriptionRepository';
import webpush, { SendResult, WebPushError } from 'web-push';

export const post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = req.body;

    const newSubscription = await subscriptionRepository.create(subscription);

    // Send 201 - resource created
    res.status(201).json(newSubscription);
  } catch (e) {
    next(e);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const endpoint: string = req.query.endpoint?.toString();
    if (!endpoint) {
      res.sendStatus(400);
      return;
    }

    const successful = await subscriptionRepository.deleteByEndpoint(endpoint);
    if (successful) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (e) {
    next(e);
  }
};

export const broadcast = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notification = { title: 'Hey, this is a push notification!' };

    const subscriptions = await subscriptionRepository.getAll();

    const notifications: Promise<SendResult | void>[] = [];
    subscriptions.forEach(async (subscription) => {
        notifications.push(webpush.sendNotification(subscription, JSON.stringify(notification)).catch((e: WebPushError) => {
          if (e.statusCode == 410) {
            console.error("Deleting stale subscription", subscription.endpoint)
            return subscriptionRepository
                .deleteByEndpoint(subscription.endpoint)
                .then(_ => {});
          } else {
            return Promise.reject(e)
          }
        }));
    });

    await Promise.all(notifications);
    res.sendStatus(200);
  } catch (e) {
    console.error("Got error", e)
    next(e);
  }
};
