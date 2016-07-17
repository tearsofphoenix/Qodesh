/**
 * Created by isaac on 16/7/14.
 */
import kue from 'kue';
import {kJobDialysisSample} from './constants';

import config from '../config';
const {redis} = config;

let queue = null;

export function getCurrentQueue(callback) {
  callback(queue);
}

export default function () {
  return new Promise((resolve) => {

    if (!queue) {
      queue = kue.createQueue({redis});
      queue.on('error', function (error) {
        console.log('Oops... ', error);
      });
      queue.on('job complete', (id, result) => {
        kue.Job.get(id, (error, job) => {
          console.log('done:', error, job.data);
        });
      });
    }

    resolve();
    kue.app.listen(config.kue.port);
    kue.app.set('title', config.kue.title);
  });
}
