/**
 * Created by isaac on 16/7/12.
 */
import {CronJob} from 'cron';
import {syncPatient} from './actions/api/patient/sync';
import {syncTreatplan} from './actions/api/treatplan/sync';

let job = null;
const SchedulePeriodInSeconds = 5;

export default function (his) {
  const {sync, connection} = his;
  const reject = (error) => console.log(error);
  const func = () => {
    console.log('----------------will start to sync----------------', sync);
    sync.allPatient(connection).then((result) => {
      syncPatient(result, ({data}) => {
        console.log(data);
        if (data && data.jzh) {
          const {jzh} = data;
          sync.plan(connection, jzh).then((planResult) => {
            syncTreatplan(jzh, planResult, (obj) => {
              console.log(obj);
            }, reject);
          }, reject);
        }
      }, reject);
      console.log('----------------end sync patient ----------------');
    }, reject);
  };

  if (!job) {
    job = new CronJob({
      cronTime: `*/${SchedulePeriodInSeconds} * * * * *`,
      onTick: func,
      start: false,
      timeZone: 'Asia/Chongqing'
    });

    job.start();
  }
}
